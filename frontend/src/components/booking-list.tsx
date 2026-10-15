'use client';
import { useCallback, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { bookingsService, venuesService } from '@/services';
import type { Field } from '@/services/contracts';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { hourLabel, venueToday } from '@/services/sports';
import { AccessGate } from './access-gate';
import { DemoNotice, Empty, Loading, ServiceErrorMessage } from './service-state';
export function BookingList({ owner = false, bookingId, venueId }: { owner?: boolean; bookingId?: string; venueId?: string }) {
  return <AccessGate roles={owner ? ['owner', 'admin'] : ['player']}><BookingRecords owner={owner} venueId={venueId} bookingId={bookingId} /></AccessGate>;
}
function BookingRecords({ owner, bookingId, venueId }: { owner: boolean; bookingId?: string; venueId?: string }) {
  const { t, money, date: displayDate } = useLanguage();
  const [date, setDate] = useState(''); const [confirmId, setConfirmId] = useState<string | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState<unknown>();
  const query = useServiceQuery(useCallback(async signal => {
    const [bookings, venues] = await Promise.all([bookingsService.list(signal), owner ? venuesService.owned(signal) : venuesService.list(signal)]);
    const fields = (await Promise.all(venues.filter(v => v.status === 'active' && (!venueId || v.id === venueId)).map(v => venuesService.fields(v.id, signal)))).flat(); return { bookings, venues, fields };
  }, [owner, venueId]));
  const records = query.data?.bookings.filter(b => (!venueId || b.venueId === venueId) && (!bookingId || b.id === bookingId) && (!date || b.date === date)).sort((a, b) => `${a.date}${hourLabel(a.startHour)}`.localeCompare(`${b.date}${hourLabel(b.startHour)}`)) || [];
  return <div className="space-y-6"><DemoNotice /><div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-bold">{t(owner ? 'ownerBookings' : 'bookings')}</h1><Link href="/stadiums" className="action">{t('book')}</Link></div>
    {owner && <label className="form-label max-w-sm">{t('date')}<input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} /></label>}
    {error ? <ServiceErrorMessage error={error} /> : null}
    {query.loading ? <Loading /> : query.error ? <ServiceErrorMessage error={query.error} retry={query.reload} /> : !records.length ? <Empty /> : <div className="grid gap-4">{records.map(booking => <article key={booking.id} className="panel"><div className="flex flex-wrap items-start justify-between gap-3"><div><Link href={`${owner ? "/dashboard" : ""}/bookings/${booking.id}`} className="text-lg font-bold">{query.data?.fields.find(f => f.id === booking.fieldId)?.name || booking.fieldId}</Link><p className="text-sm text-slate-600">{query.data?.venues.find(v => v.id === booking.venueId)?.name || booking.venueId}</p></div><span className="rounded-full bg-green-50 px-3 py-1 text-green-950">{t(booking.status)}</span></div><p className="mt-3">{displayDate(booking.date)} · {hourLabel(booking.startHour)}–{hourLabel(booking.endHour)} · {t(booking.sport)}</p><p className="mt-2">{money(booking.totalMinor)} · {t('payment')}: {t(booking.paymentStatus)}</p><p className="mt-3 break-all text-xs text-slate-500">{t('bookingReference')}: {booking.id}</p>
      {booking.status === 'confirmed' && booking.paymentStatus === 'unpaid' && <div className="mt-4">{confirmId === booking.id ? <div className="rounded-xl border border-amber-200 p-3"><p>{t('confirmCancel')}</p><div className="mt-3 flex flex-wrap gap-3"><button disabled={busy} className="action" onClick={async () => { setBusy(true); setError(undefined); try { await bookingsService.cancel(booking.id); setConfirmId(null); query.reload(); } catch (error) { setError(error); } finally { setBusy(false); } }}>{t('confirm')}</button><button className="min-h-11 px-4 underline" disabled={busy} onClick={() => setConfirmId(null)}>{t('back')}</button></div></div> : <button className="min-h-11 rounded-xl border border-slate-400 px-4" onClick={() => setConfirmId(booking.id)}>{t('cancelBooking')}</button>}</div>}
    </article>)}</div>}
    {owner && query.data && <ClosureForm fields={query.data.fields} onSaved={query.reload} />}
  </div>;
}
function ClosureForm({ fields, onSaved }: { fields: Field[]; onSaved: () => void }) {
  const { t } = useLanguage(); const [fieldId, setFieldId] = useState(fields[0]?.id || ''); const [date, setDate] = useState(venueToday()); const [start, setStart] = useState(8); const [end, setEnd] = useState(9); const [reason, setReason] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState<unknown>(); const [saved, setSaved] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setSaved(false); setError(undefined); try { await bookingsService.close({ fieldId, date, startHour: start, endHour: end, reason }); setSaved(true); onSaved(); } catch (error) { setError(error); } finally { setBusy(false); } }
  return <form className="panel space-y-4" onSubmit={submit}><h2 className="text-xl font-bold">{t('closure')}</h2>{error ? <ServiceErrorMessage error={error} /> : null}{saved && <p role="status">{t('closureSaved')}</p>}<fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2"><label className="form-label">{t('field')}<select required value={fieldId} onChange={e => setFieldId(e.target.value)} className="form-input">{fields.map(field => <option key={field.id} value={field.id}>{field.name}</option>)}</select></label><label className="form-label">{t('date')}<input required type="date" min={venueToday()} value={date} onChange={e => setDate(e.target.value)} className="form-input" /></label><label className="form-label">{t('from')}<input required className="form-input" type="number" min={0} max={23} value={start} onChange={e => setStart(Number(e.target.value))} /></label><label className="form-label">{t('to')}<input required className="form-input" type="number" min={start + 1} max={24} value={end} onChange={e => setEnd(Number(e.target.value))} /></label><label className="form-label sm:col-span-2">{t('reason')}<input required maxLength={200} value={reason} onChange={e => setReason(e.target.value)} className="form-input" /></label><button disabled={busy || !fields.length} className="action" type="submit">{t('createClosure')}</button></fieldset></form>;
}
