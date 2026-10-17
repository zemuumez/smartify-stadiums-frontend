'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { supportService } from '@/services';
import type { SupportCaseCategory } from '@/services/contracts';
import { useLanguage } from '@/i18n/provider';
import { useAuthStore } from '@/lib/auth-store';
import { useServiceQuery } from '@/lib/use-service-query';
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

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  return containerRef;
}

export function SupportCaseModal({
  bookingId,
  venueId,
  onClose,
}: {
  bookingId?: string;
  venueId?: string;
  onClose: () => void;
}) {
  const modalRef = useModalKeyboard(true, onClose);
  const { t, date: displayDate } = useLanguage();
  const { user } = useAuthStore();
  const isSuspended = user?.status === 'suspended';

  const [category, setCategory] = useState<SupportCaseCategory>('booking_inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();

  const listQuery = useServiceQuery(
    useCallback(signal => supportService.list(venueId ? { venueId } : undefined, signal), [venueId])
  );

  const cases = listQuery.data || [];
  const bookingCases = bookingId ? cases.filter(c => c.bookingId === bookingId) : cases;
  const currentCase = activeCaseId
    ? cases.find(c => c.id === activeCaseId)
    : (bookingCases[0] || null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (isSuspended) return;
    if (!subject.trim() || !message.trim()) return;

    setBusy(true);
    setError(undefined);
    try {
      const created = await supportService.create({
        bookingId,
        venueId,
        category,
        subject: subject.trim(),
        message: message.trim(),
        priority: 'medium',
      });
      setSubject('');
      setMessage('');
      setIsCreating(false);
      setActiveCaseId(created.id);
      listQuery.reload();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function handleReply(e: FormEvent) {
    e.preventDefault();
    if (isSuspended || !currentCase || !replyText.trim()) return;

    setBusy(true);
    setError(undefined);
    try {
      await supportService.addMessage(currentCase.id, {
        message: replyText.trim(),
      });
      setReplyText('');
      listQuery.reload();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 id="support-modal-title" className="text-xl font-bold text-slate-900">
              {t('supportCases')}
            </h2>
            {bookingId && <p className="text-xs text-slate-500 font-mono mt-0.5">{bookingId}</p>}
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

        {error ? <ServiceErrorMessage error={error} /> : null}

        {isSuspended && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
            {t('accountSuspendedNotice')}
          </div>
        )}

        {listQuery.loading ? (
          <Loading />
        ) : listQuery.error ? (
          <ServiceErrorMessage error={listQuery.error} retry={listQuery.reload} />
        ) : (
          <div className="space-y-4">
            {/* If there are existing cases for this booking/user, show selector tabs */}
            {bookingCases.length > 0 && !isCreating && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {bookingCases.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveCaseId(c.id)}
                      className={`min-h-9 px-3 text-xs font-semibold rounded-lg border ${
                        (currentCase?.id === c.id)
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {c.caseNumber} ({t(c.status)})
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  disabled={isSuspended}
                  className="min-h-9 px-3 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  + {t('support')}
                </button>
              </div>
            )}

            {/* Case conversation view */}
            {currentCase && !isCreating ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700">{currentCase.caseNumber}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        currentCase.status === 'open'
                          ? 'bg-amber-100 text-amber-900'
                          : currentCase.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-900'
                          : currentCase.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t(currentCase.status)}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{currentCase.subject}</h3>
                  <p className="text-xs text-slate-600">
                    {t(currentCase.category)} · {displayDate(currentCase.createdAt.slice(0, 10))}
                  </p>
                </div>

                {/* Message Thread */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {currentCase.messages.map((m, idx) => {
                    const isSelf = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id || idx}
                        className={`rounded-xl p-3 text-sm space-y-1 ${
                          isSelf
                            ? 'bg-emerald-50/80 border border-emerald-200 ml-6'
                            : 'bg-slate-100/80 border border-slate-200 mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-semibold text-slate-800">
                            {m.senderName} ({t(m.senderRole)})
                          </span>
                          <time>{displayDate(m.createdAt.slice(0, 10))}</time>
                        </div>
                        <p className="text-slate-800 whitespace-pre-wrap">{m.message}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                {currentCase.status !== 'closed' && (
                  <form onSubmit={handleReply} className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="form-label">
                      {t('reply')}
                      <textarea
                        required
                        rows={2}
                        maxLength={1000}
                        disabled={busy || isSuspended}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder={t('replyPlaceholder')}
                        className="form-input text-sm"
                      />
                    </label>
                    <div className="flex justify-end gap-2">
                      <button
                        type="submit"
                        disabled={busy || isSuspended || !replyText.trim()}
                        className="min-h-11 px-4 text-xs font-bold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        {busy ? t('processing') : t('sendReply')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* Create new case form */
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="form-label">
                    {t('category')}
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as SupportCaseCategory)}
                      className="form-input"
                      disabled={isSuspended}
                    >
                      <option value="booking_inquiry">{t('booking_inquiry')}</option>
                      <option value="refund_request">{t('refund_request')}</option>
                      <option value="payment_issue">{t('payment_issue')}</option>
                      <option value="facility_issue">{t('facility_issue')}</option>
                      <option value="general">{t('general')}</option>
                    </select>
                  </label>

                  <label className="form-label">
                    {t('subject')}
                    <input
                      type="text"
                      required
                      maxLength={120}
                      disabled={isSuspended}
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder={t('subjectPlaceholder')}
                      className="form-input"
                    />
                  </label>
                </div>

                <label className="form-label">
                  {t('description')}
                  <textarea
                    required
                    rows={4}
                    maxLength={2000}
                    disabled={isSuspended}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={t('descriptionPlaceholder')}
                    className="form-input"
                  />
                </label>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  {bookingCases.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="min-h-11 px-4 rounded-xl border border-slate-300 text-sm font-semibold hover:bg-slate-50"
                    >
                      {t('back')}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={busy || isSuspended}
                    className="action"
                  >
                    {busy ? t('processing') : t('confirm')}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
