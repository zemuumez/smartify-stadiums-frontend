'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { billingService } from '@/services';
import type { Booking, PaymentMethod, PaymentTransaction } from '@/services/contracts';
import { useLanguage } from '@/i18n/provider';
import { useServiceQuery } from '@/lib/use-service-query';
import { useAuthStore } from '@/lib/auth-store';
import { isDemoMode } from '@/services/config';
import { Loading, ServiceErrorMessage } from './service-state';

function useModalKeyboard(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      const focusables = containerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        containerRef.current.focus();
      }
    }, 10);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key === 'Tab' && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  return containerRef;
}

export function SettlementModal({
  booking,
  onClose,
  onSuccess,
}: {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const modalRef = useModalKeyboard(true, onClose);
  const { t, money } = useLanguage();
  const { user } = useAuthStore();
  const isSuspended = user?.status === 'suspended';
  const [customAmount, setCustomAmount] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const query = useServiceQuery(
    useCallback(signal => billingService.bookingFinancials(booking.id, signal), [booking.id]),
    booking.id
  );

  const financials = query.data;
  const amountInput = customAmount !== null ? customAmount : (financials ? (financials.outstandingMinor / 100).toFixed(2) : '');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setValidationError(null);

    if (isSuspended) {
      setSubmitError(t('accountSuspendedNotice'));
      return;
    }

    const amountMinor = Math.round(parseFloat(amountInput) * 100);
    if (isNaN(amountMinor) || amountMinor <= 0) {
      setValidationError(t('overpaymentError'));
      return;
    }
    if (financials && amountMinor > financials.outstandingMinor) {
      setValidationError(t('overpaymentError'));
      return;
    }

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `settle-${booking.id}-${Date.now()}`;
    }

    setBusy(true);
    try {
      await billingService.settleBooking(
        booking.id,
        {
          amountMinor,
          method,
          reference: reference.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        idempotencyKeyRef.current
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSubmitError(msg);
      // Preserve idempotency key on failure so subsequent retries use the identical key
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settlement-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b pb-3">
          <h2 id="settlement-title" className="text-xl font-bold text-slate-900">
            {t('recordSettlement')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        {query.loading ? (
          <Loading />
        ) : query.error ? (
          <ServiceErrorMessage error={query.error} retry={query.reload} />
        ) : financials ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500 block">{t('bookingValue')}</span>
                <span className="font-bold text-slate-900">{money(financials.totalPriceMinor)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t('collected')}</span>
                <span className="font-bold text-emerald-700">{money(financials.netCollectedMinor)}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-700">{t('outstanding')}</span>
                <span className="text-lg font-bold text-amber-700">{money(financials.outstandingMinor)}</span>
              </div>
            </div>

            {validationError && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
                {validationError}
              </div>
            )}
            {submitError && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
                {submitError}
              </div>
            )}
            {isSuspended && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
                {t('accountSuspendedNotice')}
              </div>
            )}

            <div className="space-y-3">
              <label className="form-label">
                {t('settlementAmount')}
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={(financials.outstandingMinor / 100).toFixed(2)}
                    required
                    value={amountInput}
                    onChange={e => setCustomAmount(e.target.value)}
                    className="form-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomAmount((financials.outstandingMinor / 100).toFixed(2))}
                    className="min-h-11 px-3 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-100"
                  >
                    {t('payFullBalance')}
                  </button>
                </div>
              </label>

              <label className="form-label">
                {t('paymentMethod')}
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value as PaymentMethod)}
                  className="form-input"
                >
                  <option value="cash">{t('cash')}</option>
                  <option value="pos">{t('pos')}</option>
                  <option value="telebirr_manual">{t('telebirr_manual')}</option>
                  <option value="bank_transfer">{t('bank_transfer')}</option>
                </select>
              </label>

              <label className="form-label">
                {t('referenceNumber')}
                <input
                  type="text"
                  maxLength={100}
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder="e.g. REC-98234 or POS auth code"
                  className="form-input"
                />
              </label>

              <label className="form-label">
                {t('notes')}
                <textarea
                  maxLength={500}
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="form-input"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="min-h-11 px-4 rounded-xl border border-slate-300 text-sm font-semibold hover:bg-slate-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={busy || financials.outstandingMinor <= 0 || isSuspended}
                className="action"
              >
                {busy ? t('processing') : t('recordSettlement')}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export function ReceiptModal({
  booking,
  owner,
  onClose,
  onUpdated,
}: {
  booking: Booking;
  owner: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const modalRef = useModalKeyboard(true, onClose);
  const { t, money, date: displayDate } = useLanguage();
  const { user } = useAuthStore();
  const isSuspended = user?.status === 'suspended';

  const query = useServiceQuery(
    useCallback(signal => billingService.bookingFinancials(booking.id, signal), [booking.id]),
    booking.id
  );

  const financials = query.data;

  // Refund state
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [customRefundAmount, setCustomRefundAmount] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundBusy, setRefundBusy] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const refundIdempotencyRef = useRef<string | null>(null);

  const refundAmount = customRefundAmount !== null ? customRefundAmount : (financials ? (financials.netCollectedMinor / 100).toFixed(2) : '');

  async function handleRefund(e: FormEvent) {
    e.preventDefault();
    setRefundError(null);

    if (isSuspended) {
      setRefundError(t('accountSuspendedNotice'));
      return;
    }

    const amountMinor = Math.round(parseFloat(refundAmount) * 100);
    if (isNaN(amountMinor) || amountMinor <= 0) {
      setRefundError(t('refundLimitError'));
      return;
    }
    if (financials && amountMinor > financials.netCollectedMinor) {
      setRefundError(t('refundLimitError'));
      return;
    }

    if (!refundIdempotencyRef.current) {
      refundIdempotencyRef.current = `refund-${booking.id}-${Date.now()}`;
    }

    setRefundBusy(true);
    try {
      await billingService.refundBooking(
        booking.id,
        {
          amountMinor,
          reason: refundReason.trim() || 'Manual refund',
        },
        refundIdempotencyRef.current
      );
      setShowRefundForm(false);
      refundIdempotencyRef.current = null;
      query.reload();
      onUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setRefundError(msg);
      // Preserve idempotency key on failure so subsequent retries use the identical key
    } finally {
      setRefundBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 id="receipt-title" className="text-xl font-bold text-slate-900">
              {t('paymentReceipts')}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{booking.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        {query.loading ? (
          <Loading />
        ) : query.error ? (
          <ServiceErrorMessage error={query.error} retry={query.reload} />
        ) : financials ? (
          <div className="space-y-6">
            {/* Financial Overview Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-3">
                {t('financialSummary')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">{t('grossBookingValue')}</span>
                  <span className="text-base font-bold text-slate-900">{money(financials.totalPriceMinor)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">{t('collected')}</span>
                  <span className="text-base font-bold text-emerald-700">{money(financials.netCollectedMinor)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">{t('totalRefunds')}</span>
                  <span className="text-base font-bold text-rose-700">{money(financials.refundedMinor)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">{t('outstanding')}</span>
                  <span className="text-base font-bold text-amber-700">{money(financials.outstandingMinor)}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>
                  {t('payment')}:{' '}
                  <span className="font-semibold">{t(financials.paymentStatus)}</span>
                </span>
                <span>
                  {t('status')}:{' '}
                  <span className="font-semibold">{t(booking.status)}</span>
                </span>
              </div>
            </div>

            {/* Refund trigger / form for owners */}
            {owner && financials.netCollectedMinor > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">{t('issueRefund')}</h4>
                    <p className="text-xs text-rose-700">
                      {t('netCollected')}: {money(financials.netCollectedMinor)}
                    </p>
                  </div>
                  {!showRefundForm && (
                    <button
                      type="button"
                      disabled={isSuspended}
                      onClick={() => setShowRefundForm(true)}
                      className={`min-h-11 px-3 text-xs font-semibold rounded-xl border border-rose-300 bg-white text-rose-900 hover:bg-rose-50 ${
                        isSuspended ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {t('issueRefund')}
                    </button>
                  )}
                </div>

                {isSuspended && (
                  <p className="text-xs text-rose-800 bg-rose-100 p-2 rounded-lg font-medium">
                    {t('accountSuspendedNotice')}
                  </p>
                )}

                {showRefundForm && (
                  <form onSubmit={handleRefund} className="space-y-3 pt-2 border-t border-rose-200">
                    {refundError && (
                      <p className="text-xs text-rose-800 bg-rose-100 p-2 rounded-lg font-medium">
                        {refundError}
                      </p>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="form-label">
                        {t('refundAmount')}
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={(financials.netCollectedMinor / 100).toFixed(2)}
                          required
                          disabled={isSuspended}
                          value={refundAmount}
                          onChange={e => setCustomRefundAmount(e.target.value)}
                          className="form-input"
                        />
                      </label>
                      <label className="form-label">
                        {t('refundReason')}
                        <input
                          type="text"
                          required
                          maxLength={200}
                          disabled={isSuspended}
                          value={refundReason}
                          onChange={e => setRefundReason(e.target.value)}
                          placeholder="e.g. Weather closure or customer cancellation"
                          className="form-input"
                        />
                      </label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={refundBusy}
                        onClick={() => setShowRefundForm(false)}
                        className="min-h-11 px-3 text-xs rounded-xl border border-slate-300 hover:bg-slate-50"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={refundBusy || isSuspended}
                        className="min-h-11 px-4 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                      >
                        {refundBusy ? t('processing') : t('issueRefund')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Transactions Ledger */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                {t('transactionHistory')}
              </h3>

              {!financials.transactions.length ? (
                <p className="text-sm text-slate-500 py-3">{t('noTransactions')}</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full text-left text-xs divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-slate-700 font-semibold">
                      <tr>
                        <th className="px-3 py-2.5">{t('date')}</th>
                        <th className="px-3 py-2.5">{t('type')}</th>
                        <th className="px-3 py-2.5">{t('paymentMethod')}</th>
                        <th className="px-3 py-2.5">{t('settlementAmount')}</th>
                        <th className="px-3 py-2.5">{t('status')}</th>
                        <th className="px-3 py-2.5">{t('referenceNumber')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {financials.transactions.map((tx: PaymentTransaction) => {
                        const isCredit = tx.type === 'collection';
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">
                              {displayDate(tx.createdAt.slice(0, 10))}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span
                                className={`rounded px-1.5 py-0.5 font-semibold text-[11px] ${
                                  isCredit
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {t(tx.type as 'collection')}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">
                              {t(tx.method)}
                            </td>
                            <td
                              className={`px-3 py-2.5 whitespace-nowrap font-bold ${
                                isCredit ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {isCredit ? '+' : '-'}
                              {money(tx.amountMinor)}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                                  tx.status === 'succeeded'
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {t(tx.status as 'pending')}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-slate-500 font-mono text-[11px] max-w-[150px] truncate">
                              {tx.reference || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="action"
              >
                {t('close')}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SimulateGatewayModal({
  booking,
  onClose,
  onSuccess,
}: {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const modalRef = useModalKeyboard(true, onClose);
  const { t, money } = useLanguage();
  const { user } = useAuthStore();
  const isSuspended = user?.status === 'suspended';
  const [method, setMethod] = useState<'telebirr_gateway' | 'cbe_birr'>('telebirr_gateway');
  const [outcome, setOutcome] = useState<'succeed' | 'fail'>('succeed');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const query = useServiceQuery(
    useCallback(signal => billingService.bookingFinancials(booking.id, signal), [booking.id]),
    booking.id
  );

  const financials = query.data;

  async function handleSimulate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isDemoMode) {
      setError(t('gatewaySimulationNotice'));
      return;
    }

    if (isSuspended) {
      setError(t('accountSuspendedNotice'));
      return;
    }

    if (financials && financials.outstandingMinor <= 0) {
      setError(t('overpaymentError'));
      return;
    }

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `gateway-${booking.id}-${Date.now()}`;
    }

    setBusy(true);
    try {
      await billingService.simulateGateway(
        booking.id,
        {
          method,
          simulateOutcome: outcome === 'succeed' ? 'success' : 'failure',
        },
        idempotencyKeyRef.current
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      // Preserve idempotency key on failure so subsequent retries use the identical key
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="simulate-gateway-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b pb-3">
          <h2 id="simulate-gateway-title" className="text-xl font-bold text-slate-900">
            {t('simulateGatewayTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        {/* Prominent Demo Disclaimer */}
        <div className="rounded-xl border border-sky-300 bg-sky-50 p-3 text-xs text-sky-950 font-medium">
          ℹ️ {t('gatewaySimulationNotice')}
        </div>

        {query.loading ? (
          <Loading />
        ) : query.error ? (
          <ServiceErrorMessage error={query.error} retry={query.reload} />
        ) : financials ? (
          <form onSubmit={handleSimulate} className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500 block">{t('bookingValue')}</span>
                <span className="font-bold text-slate-900">{money(financials.totalPriceMinor)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t('outstanding')}</span>
                <span className="text-lg font-bold text-amber-700">{money(financials.outstandingMinor)}</span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
                {error}
              </div>
            )}
            {isSuspended && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
                {t('accountSuspendedNotice')}
              </div>
            )}
            {!isDemoMode && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                {t('gatewaySimulationNotice')}
              </div>
            )}

            <div className="space-y-3">
              <label className="form-label">
                {t('paymentMethod')}
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value as 'telebirr_gateway' | 'cbe_birr')}
                  className="form-input"
                  disabled={!isDemoMode || isSuspended}
                >
                  <option value="telebirr_gateway">{t('telebirr_gateway')}</option>
                  <option value="cbe_birr">{t('cbe_birr')}</option>
                </select>
              </label>

              <label className="form-label">
                {t('simulateOutcome')}
                <select
                  value={outcome}
                  onChange={e => setOutcome(e.target.value as 'succeed' | 'fail')}
                  className="form-input font-medium"
                  disabled={!isDemoMode || isSuspended}
                >
                  <option value="succeed">{t('simulateSuccess')}</option>
                  <option value="fail">{t('simulateFailure')}</option>
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="min-h-11 px-4 rounded-xl border border-slate-300 text-sm font-semibold hover:bg-slate-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={busy || financials.outstandingMinor <= 0 || isSuspended || !isDemoMode}
                className="action"
              >
                {busy ? t('processing') : t('simulatePayment')}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
