'use client';
import { useCallback, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { billingService, fieldsService, venuesService, supportService } from '@/services';
import type { Field, Venue, VenueReviewRecord, SupportCase, SupportCaseCategory } from '@/services/contracts';
import type { FieldInput } from '@/services/fields.service';
import { supportedSports, hourLabel } from '@/services/sports';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { useAuthStore } from '@/lib/auth-store';
import { Empty, Loading, ServiceErrorMessage } from './service-state';

import { AnalyticsDashboard } from './analytics-dashboard';
import type { OwnerAnalyticsParams } from '@/services/billing.service';

export function OwnerOverview() {
  const { t } = useLanguage();
  const venuesQuery = useServiceQuery(useCallback(signal => venuesService.owned(signal), []));
  const fetchAnalytics = useCallback(async (params: OwnerAnalyticsParams, signal?: AbortSignal) => {
    const res = await billingService.analytics(params, signal);
    return res.detailed!;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link className="action" href="/dashboard/bookings">
          {t('ownerBookings')}
        </Link>
      </div>
      <AnalyticsDashboard
        title={t('overview')}
        venues={venuesQuery.data || []}
        fetchAnalytics={fetchAnalytics}
        isAdmin={false}
      />
    </div>
  );
}
export function OwnerVenues() {
  const { t } = useLanguage();
  const query = useServiceQuery(useCallback(signal => venuesService.owned(signal), []));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [saved, setSaved] = useState(false);
  const [submittingVenueId, setSubmittingVenueId] = useState<string | null>(null);
  const [submitNotes, setSubmitNotes] = useState('');
  const [activeHistoryVenueId, setActiveHistoryVenueId] = useState<string | null>(null);
  const [reviewsHistory, setReviewsHistory] = useState<Record<string, VenueReviewRecord[]>>({});
  const [loadingHistory, setLoadingHistory] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError(undefined);
    setSaved(false);
    try {
      await venuesService.create({
        name: String(data.get('name')),
        city: String(data.get('city')),
        address: String(data.get('address')),
        description: String(data.get('description')),
        phone: String(data.get('phone')),
      });
      form.reset();
      setSaved(true);
      query.reload();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  const loadHistory = async (venueId: string) => {
    if (activeHistoryVenueId === venueId) {
      setActiveHistoryVenueId(null);
      return;
    }
    setActiveHistoryVenueId(venueId);
    setLoadingHistory(true);
    try {
      const records = await venuesService.reviews(venueId);
      setReviewsHistory(prev => ({ ...prev, [venueId]: records }));
    } catch (err) {
      setError(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmitForReview = async (venueId: string) => {
    setBusy(true);
    setError(undefined);
    try {
      await venuesService.submitForReview(venueId, submitNotes.trim() || undefined);
      setSubmittingVenueId(null);
      setSubmitNotes('');
      query.reload();
      if (activeHistoryVenueId === venueId) {
        const records = await venuesService.reviews(venueId);
        setReviewsHistory(prev => ({ ...prev, [venueId]: records }));
      }
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('venues')}</h1>
      {error ? <ServiceErrorMessage error={error} /> : null}

      {query.loading ? (
        <Loading />
      ) : query.error ? (
        <ServiceErrorMessage error={query.error} retry={query.reload} />
      ) : !query.data?.length ? (
        <Empty />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {query.data.map(venue => (
            <article className="panel space-y-4" key={venue.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold">{venue.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{venue.city}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    venue.status === 'active'
                      ? 'bg-emerald-100 text-emerald-900'
                      : venue.status === 'suspended'
                      ? 'bg-rose-100 text-rose-900'
                      : venue.status === 'changes_requested'
                      ? 'bg-purple-100 text-purple-900'
                      : venue.status === 'pending'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {t(venue.status)}
                </span>
              </div>

              {venue.status === 'suspended' && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                  {t('venueSuspensionNotice')}
                </div>
              )}

              {venue.status === 'changes_requested' && (
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-xs text-purple-900">
                  <p className="font-semibold">{t('changes_requested')}</p>
                  <p className="mt-1 text-slate-700">Check review history below for admin feedback and submit an update when ready.</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                {venue.status === 'active' && (
                  <Link href={`/s/${venue.slug}`} className="underline text-sm font-semibold">
                    {t('viewSite')}
                  </Link>
                )}

                {(venue.status === 'draft' || venue.status === 'changes_requested') && (
                  submittingVenueId === venue.id ? (
                    <div className="w-full space-y-2 pt-2">
                      <label className="form-label">
                        {t('notesOptional')}
                        <input
                          className="form-input text-xs"
                          placeholder="e.g. Updated photos and facility address"
                          value={submitNotes}
                          onChange={e => setSubmitNotes(e.target.value)}
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="action text-xs"
                          disabled={busy}
                          onClick={() => handleSubmitForReview(venue.id)}
                        >
                          {t('submitForReview')}
                        </button>
                        <button
                          type="button"
                          className="min-h-11 rounded-xl border px-3 text-xs"
                          onClick={() => setSubmittingVenueId(null)}
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="action text-xs"
                      disabled={busy}
                      onClick={() => {
                        setSubmittingVenueId(venue.id);
                        setSubmitNotes('');
                      }}
                    >
                      {t('submitForReview')}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="min-h-11 rounded-xl border border-slate-300 px-3 text-xs font-semibold hover:bg-slate-50"
                  onClick={() => loadHistory(venue.id)}
                >
                  {t('reviewHistory')}
                </button>
              </div>

              {activeHistoryVenueId === venue.id && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900">{t('reviewHistory')}</h3>
                  {loadingHistory ? (
                    <Loading />
                  ) : !reviewsHistory[venue.id]?.length ? (
                    <p className="text-xs text-slate-500">{t('noReviewsFound')}</p>
                  ) : (
                    <div className="space-y-2">
                      {reviewsHistory[venue.id].map(rev => (
                        <div key={rev.id} className="rounded border border-slate-200 bg-white p-2.5 text-xs space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-1 font-semibold text-slate-900">
                            <span>{rev.action.toUpperCase()}</span>
                            <time className="text-slate-500 font-normal">{rev.createdAt}</time>
                          </div>
                          <p className="text-slate-600">
                            {t('previousStatus')}: {t(rev.previousStatus)} → {t('newStatus')}: {t(rev.newStatus)}
                          </p>
                          <p className="text-slate-800">
                            <span className="font-semibold">{t('reason')}:</span> {rev.reason}
                          </p>
                          {rev.notes && (
                            <p className="text-slate-600">
                              <span className="font-semibold">{t('notes')}:</span> {rev.notes}
                            </p>
                          )}
                          <p className="text-slate-500 text-[11px]">{t('reviewer')}: {rev.reviewerName}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <form className="panel space-y-4" onSubmit={submit}>
        <h2 className="text-xl font-bold">{t('submitVenue')}</h2>
        {saved && <p role="status">{t('submitted')}</p>}
        <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
          {(['name', 'city', 'address', 'phone'] as const).map(key => (
            <label className="form-label" key={key}>
              {t(key === 'name' ? 'venueName' : key)}
              <input className="form-input" name={key} type={key === 'phone' ? 'tel' : 'text'} required maxLength={200} />
            </label>
          ))}
          <label className="form-label sm:col-span-2">
            {t('description')}
            <textarea className="form-input" name="description" maxLength={5000} />
          </label>
          <button className="action" type="submit" disabled={busy}>
            {t('submitVenue')}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
export function OwnerFields({ venueId }: { venueId?: string }) {
  const { t, money } = useLanguage(); const [editing, setEditing] = useState<Field | null>(null); const [adding, setAdding] = useState(false);
  const query = useServiceQuery(useCallback(async () => { const [fields, venues] = await Promise.all([fieldsService.list(), venuesService.owned()]); return { fields: fields.filter(f => !venueId || f.venueId === venueId), venues: venues.filter(v => !venueId || v.id === venueId) }; }, [venueId]));
  if (query.loading) return <Loading />; if (query.error || !query.data) return <ServiceErrorMessage error={query.error} retry={query.reload} />;
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">{t('fields')}</h1><button className="action" disabled={!query.data.venues.length} onClick={() => { setEditing(null); setAdding(true); }}>{t('addField')}</button></div>{(editing || adding) && <FieldForm key={editing?.id || 'new'} initial={editing} venues={query.data.venues} onCancel={() => { setEditing(null); setAdding(false); }} onSaved={() => { setEditing(null); setAdding(false); query.reload(); }} />}
    {!query.data.fields.length ? <Empty /> : <div className="grid gap-4 md:grid-cols-2">{query.data.fields.map(field => <article className="panel" key={field.id}><h2 className="text-xl font-bold">{field.name}</h2><p className="mt-2 text-slate-600">{query.data?.venues.find(v => v.id === field.venueId)?.name}</p><p className="my-3">{field.sports.map(sport => t(sport)).join(' · ')}</p><p>{hourLabel(field.openHour)}–{hourLabel(field.closeHour)} · {money(field.hourlyRateMinor)} / {t('perHour')}</p><p className="my-3">{t(field.active ? 'active' : 'inactive')}</p><button className="min-h-11 rounded-xl border px-4" onClick={() => { setEditing(field); setAdding(false); }}>{t('edit')}</button></article>)}</div>}
  </div>;
}
function FieldForm({ initial, venues, onSaved, onCancel }: { initial: Field | null; venues: Venue[]; onSaved: () => void; onCancel: () => void }) {
  const { t } = useLanguage();
  const [input, setInput] = useState<FieldInput>(() => initial || { venueId: venues[0]?.id || '', name: '', sports: [], surface: '', hourlyRateMinor: 0, lighting: false, changingRoom: false, camera: false, active: true, openHour: 6, closeHour: 22 });
  const [busy, setBusy] = useState(false); const [error, setError] = useState<unknown>();
  return <form className="panel space-y-4" onSubmit={async event => { event.preventDefault(); setBusy(true); setError(undefined); try { if (initial) await fieldsService.update(initial.id, input); else await fieldsService.create(input); onSaved(); } catch (error) { setError(error); } finally { setBusy(false); } }}>{error ? <ServiceErrorMessage error={error} /> : null}<fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2"><label className="form-label">{t('chooseVenue')}<select className="form-input" disabled={!!initial} value={input.venueId} onChange={e => setInput({ ...input, venueId: e.target.value })}>{venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></label><label className="form-label">{t('name')}<input className="form-input" value={input.name} required maxLength={120} onChange={e => setInput({ ...input, name: e.target.value })} /></label><fieldset className="sm:col-span-2"><legend className="font-semibold">{t('sport')}</legend><div className="flex flex-wrap gap-3">{supportedSports.map(sport => <label key={sport} className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={input.sports.includes(sport)} onChange={e => setInput({ ...input, sports: e.target.checked ? [...input.sports, sport] : input.sports.filter(s => s !== sport) })} />{t(sport)}</label>)}</div></fieldset><label className="form-label">{t('surface')}<input className="form-input" value={input.surface} required maxLength={100} onChange={e => setInput({ ...input, surface: e.target.value })} /></label><label className="form-label">{t('rate')} (ETB)<input className="form-input" required type="number" min={0} max={1000000} step="0.01" value={input.hourlyRateMinor / 100} onChange={e => setInput({ ...input, hourlyRateMinor: Math.round(Number(e.target.value) * 100) })} /></label><label className="form-label">{t('from')}<input className="form-input" required type="number" min={0} max={23} value={input.openHour} onChange={e => setInput({ ...input, openHour: Number(e.target.value) })} /></label><label className="form-label">{t('to')}<input className="form-input" required type="number" min={input.openHour + 1} max={24} value={input.closeHour} onChange={e => setInput({ ...input, closeHour: Number(e.target.value) })} /></label><label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={input.active} onChange={e => setInput({ ...input, active: e.target.checked })} />{t('active')}</label><label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={input.lighting} onChange={e => setInput({ ...input, lighting: e.target.checked })} />{t('lighting')}</label><button className="action" disabled={busy || !input.sports.length} type="submit">{t('save')}</button><button className="min-h-11 underline" disabled={busy} type="button" onClick={onCancel}>{t('cancel')}</button></fieldset></form>;
}
export { OwnerCameras } from './camera-admin';
export function OwnerBilling() {
  const { t, money } = useLanguage();
  const query = useServiceQuery(useCallback(() => billingService.invoices(), []));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('billing')}</h1>
          <p className="mt-1 text-slate-600">{t('pricingOpen')}</p>
        </div>
        <Link href="/dashboard/bookings" className="action">
          {t('viewLedger')}
        </Link>
      </div>

      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-sm text-sky-950 space-y-1">
        <p className="font-semibold">{t('paymentReceipts')}</p>
        <p>{t('subscriptionInvoicesNotice')}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">{t('subscriptionInvoices')}</h2>

        {query.loading ? (
          <Loading />
        ) : query.error ? (
          <ServiceErrorMessage error={query.error} retry={query.reload} />
        ) : !query.data?.length ? (
          <Empty />
        ) : (
          <div className="grid gap-4">
            {query.data.map(invoice => (
              <article className="panel space-y-3" key={invoice.id}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{invoice.id}</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {invoice.periodStart} – {invoice.periodEnd}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                    {t(invoice.status)}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-700">{t('venue')}:</span> {invoice.venueId}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">{t('referenceNumber')}:</span> {invoice.id}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2">
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    {t('features')}
                  </div>
                  <div className="divide-y divide-slate-200/60 text-xs">
                    {(invoice.lineItems || []).map((line, idx) => (
                      <div key={idx} className="py-1.5 flex justify-between items-center text-slate-700">
                        <span>{line.description} (x{line.quantity})</span>
                        <span className="font-medium text-slate-500">
                          {line.totalMinor !== null ? money(line.totalMinor) : t('not_configured')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 font-bold text-sm">
                  <span>{t('invoice')}</span>
                  <span className="text-amber-800">
                    {invoice.totalMinor !== null ? money(invoice.totalMinor) : t('not_configured')}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
export function AccountSettings() {
  const { t } = useLanguage(); const { user } = useAuthStore();
  return <div className="panel space-y-4"><h1 className="text-3xl font-bold">{t('account')}</h1><dl><dt className="font-semibold">{t('name')}</dt><dd className="mb-4">{user?.full_name}</dd><dt className="font-semibold">{t('phone')}</dt><dd>{user?.phone}</dd></dl><p>{t('profileEditingPending')}</p><Link href="/contact" className="underline">{t('support')}</Link></div>;
}

export function OwnerSupportPanel() {
  const { t, date: displayDate } = useLanguage();
  const { user } = useAuthStore();
  const isSuspended = user?.status === 'suspended';

  const venuesQuery = useServiceQuery(useCallback(signal => venuesService.owned(signal), []));
  const casesQuery = useServiceQuery(useCallback(signal => supportService.list(undefined, signal), []));

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVenueId, setNewVenueId] = useState('');
  const [newCategory, setNewCategory] = useState<SupportCaseCategory>('facility_issue');
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const selectedCase = casesQuery.data?.find(c => c.id === selectedCaseId);
  const venues = venuesQuery.data || [];

  const handleSendReply = async () => {
    if (!selectedCaseId || !replyMessage.trim() || isSuspended) return;
    setBusy(true);
    setError(undefined);
    try {
      await supportService.addMessage(selectedCaseId, {
        message: replyMessage.trim(),
      });
      setReplyMessage('');
      casesQuery.reload();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateStatus = async (status: SupportCase['status']) => {
    if (!selectedCaseId || isSuspended) return;
    setBusy(true);
    setError(undefined);
    try {
      await supportService.update(selectedCaseId, { status });
      casesQuery.reload();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleCreateCase = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim() || isSuspended) return;
    setBusy(true);
    setError(undefined);
    try {
      const created = await supportService.create({
        venueId: newVenueId || (venues[0]?.id),
        category: newCategory,
        subject: newSubject.trim(),
        message: newMessage.trim(),
        priority: 'medium',
      });
      setNewSubject('');
      setNewMessage('');
      setShowCreateModal(false);
      setSelectedCaseId(created.id);
      casesQuery.reload();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('supportCases')}</h1>
          <p className="mt-1 text-sm text-slate-600">Stadium operations, player disputes, and platform inquiries</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          disabled={isSuspended}
          className="action"
        >
          + {t('support')}
        </button>
      </div>

      {isSuspended && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">
          {t('accountSuspendedNotice')}
        </div>
      )}

      {error ? <ServiceErrorMessage error={error} /> : null}

      {casesQuery.loading ? (
        <Loading />
      ) : casesQuery.error ? (
        <ServiceErrorMessage error={casesQuery.error} retry={casesQuery.reload} />
      ) : !casesQuery.data?.length ? (
        <div className="panel text-center py-12 space-y-3">
          <p className="text-slate-500">{t('empty')}</p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            disabled={isSuspended}
            className="action"
          >
            + {t('support')}
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-3 lg:col-span-2">
            {casesQuery.data.map(sc => (
              <article
                key={sc.id}
                onClick={() => setSelectedCaseId(sc.id)}
                className={`panel cursor-pointer space-y-2 transition-colors ${
                  selectedCaseId === sc.id ? 'ring-2 ring-emerald-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700">{sc.caseNumber}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      sc.status === 'open'
                        ? 'bg-amber-100 text-amber-900'
                        : sc.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-900'
                        : sc.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {t(sc.status)}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 line-clamp-1">{sc.subject}</h3>
                <p className="text-xs text-slate-600">
                  {sc.authorName} ({t(sc.authorRole)}) · {t(sc.category)}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>{sc.messages.length} {t('messagesCount')}</span>
                  <time>{displayDate(sc.updatedAt.slice(0, 10))}</time>
                </div>
              </article>
            ))}
          </div>

          <div className="lg:col-span-3">
            {selectedCase ? (
              <div className="panel space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs text-slate-500">{selectedCase.caseNumber}</span>
                    <h2 className="text-xl font-bold text-slate-900">{selectedCase.subject}</h2>
                    <p className="text-xs text-slate-600">
                      {selectedCase.authorName} · {t(selectedCase.category)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedCase.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('resolved')}
                        disabled={busy || isSuspended}
                        className="min-h-9 px-3 text-xs font-bold rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                      >
                        {t('resolved')}
                      </button>
                    )}
                    {selectedCase.status !== 'closed' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('closed')}
                        disabled={busy || isSuspended}
                        className="min-h-9 px-3 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700"
                      >
                        {t('closed')}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {selectedCase.messages.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="rounded-xl p-3 text-sm space-y-1 bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-800">
                          {m.senderName} ({t(m.senderRole)})
                        </span>
                        <time>{displayDate(m.createdAt.slice(0, 10))}</time>
                      </div>
                      <p className="text-slate-800 whitespace-pre-wrap">{m.message}</p>
                    </div>
                  ))}
                </div>

                {selectedCase.status !== 'closed' && (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <label className="form-label">
                      {t('reply')}
                      <textarea
                        rows={3}
                        required
                        disabled={busy || isSuspended}
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        placeholder={t('ownerReplyPlaceholder')}
                        className="form-input text-sm"
                      />
                    </label>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={busy || isSuspended || !replyMessage.trim()}
                        onClick={handleSendReply}
                        className="action"
                      >
                        {busy ? t('processing') : t('sendReply')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="panel text-center py-12 text-slate-500">
                {t('selectCasePrompt')}
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-slate-900">{t('support')}</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCase} className="space-y-3">
              <label className="form-label">
                {t('venues')}
                <select
                  value={newVenueId}
                  onChange={e => setNewVenueId(e.target.value)}
                  className="form-input"
                >
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-label">
                {t('category')}
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as SupportCaseCategory)}
                  className="form-input"
                >
                  <option value="facility_issue">{t('facility_issue')}</option>
                  <option value="payment_issue">{t('payment_issue')}</option>
                  <option value="booking_inquiry">{t('booking_inquiry')}</option>
                  <option value="general">{t('general')}</option>
                </select>
              </label>

              <label className="form-label">
                {t('subject')}
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder={t('ownerSubjectPlaceholder')}
                  className="form-input"
                />
              </label>

              <label className="form-label">
                {t('description')}
                <textarea
                  required
                  rows={4}
                  maxLength={2000}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={t('ownerDescriptionPlaceholder')}
                  className="form-input"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="min-h-11 px-4 rounded-xl border border-slate-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={busy || isSuspended}
                  className="action"
                >
                  {busy ? t('processing') : t('confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
