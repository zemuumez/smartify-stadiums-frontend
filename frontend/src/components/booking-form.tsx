'use client';
import { useCallback, useRef, useState, type FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { bookingsService, venuesService } from '@/services';
import type { Field, Sport } from '@/services/contracts';
import { quoteMinor } from '@/services/bookings.service';
import { hourLabel, isSport, venueToday } from '@/services/sports';
import { useServiceQuery } from '@/lib/use-service-query';
import { useAuthStore } from '@/lib/auth-store';
import { useLanguage } from '@/i18n/provider';
import { DemoNotice, Loading, ServiceErrorMessage } from './service-state';

export function BookingForm() {
  const params = useSearchParams(); const { t } = useLanguage(); const slug = params.get('venue') || params.get('stadium') || '';
  const query = useServiceQuery(useCallback(async signal => {
    const venue = await venuesService.get(slug, signal); const fields = await venuesService.fields(venue.id, signal); return { venue, fields };
  }, [slug]));
  if (!slug) return <div className="mx-auto max-w-xl p-8 pt-28"><Link href="/stadiums" className="action">{t('chooseVenue')}</Link></div>;
  if (query.loading) return <div className="pt-28"><Loading /></div>;
  if (query.error || !query.data) return <div className="p-8 pt-28"><ServiceErrorMessage error={query.error} retry={query.reload} /></div>;
  const { venue, fields } = query.data;
  return <main className="mx-auto max-w-3xl px-4 pb-28 pt-28"><DemoNotice /><Link href={`/s/${venue.slug}`} className="underline">{venue.name}</Link><h1 className="my-6 text-3xl font-bold">{t('booking')}</h1><Reservation key={`${slug}:${params.get('field') || ''}`} fields={fields} /></main>;
}
export function Reservation({ fields, initialFieldId, returnTo }: { fields: Field[]; initialFieldId?: string; returnTo?: string }) {
  const params = useSearchParams(); const router = useRouter(); const { t, money } = useLanguage(); const { user, isLoading } = useAuthStore();
  const [fieldId, setFieldId] = useState(initialFieldId || params.get('field') || fields[0]?.id || '');
  const selected = fields.find(field => field.id === fieldId);
  const [sport, setSport] = useState<Sport | ''>(() => { const value = params.get('sport') || ''; return isSport(value) && selected?.sports.includes(value) ? value : selected?.sports[0] || ''; });
  const [date, setDate] = useState(params.get('date') || venueToday()); const [start, setStart] = useState<number | null>(null); const [duration, setDuration] = useState(1);
  const [busy, setBusy] = useState(false); const [error, setError] = useState<unknown>();
  const submitted = useRef<{ fingerprint: string; key: string } | null>(null); const submitting = useRef(false);
  const slots = useServiceQuery(useCallback(signal => bookingsService.availability(fieldId, date, signal), [fieldId, date]));
  const validStarts = (slots.data || []).filter(slot => Array.from({ length: duration }, (_, index) => slot.startHour + index).every(hour => slots.data?.some(s => s.startHour === hour && s.available)));
  const chosenStart = start !== null && validStarts.some(slot => slot.startHour === start) ? start : null;
  if (isLoading) return <Loading />;
  if (!user) return <div className="panel"><p className="mb-4">{t('accountRequired')}</p><Link className="action" href={`/auth/login?returnTo=${encodeURIComponent(returnTo || `/bookings/new?${params}`)}`}>{t('signIn')}</Link></div>;
  if (user.role !== 'player') return <p role="alert">{t('forbidden')}</p>;
  if (!selected) return <Link href="/stadiums" className="action">{t('chooseVenue')}</Link>;
  async function submit(event: FormEvent) {
    event.preventDefault(); if (submitting.current || chosenStart === null || !sport) return;
    submitting.current = true; setBusy(true); setError(undefined);
    const input = { fieldId, sport, date, startHour: chosenStart, endHour: chosenStart + duration };
    const fingerprint = JSON.stringify(input);
    if (submitted.current?.fingerprint !== fingerprint) submitted.current = { fingerprint, key: crypto.randomUUID() };
    try { const booking = await bookingsService.create({ ...input, idempotencyKey: submitted.current.key }); router.push(`/bookings/${booking.id}`); }
    catch (error) { setError(error); slots.reload(); } finally { submitting.current = false; setBusy(false); }
  }
  return <form className="panel space-y-5" onSubmit={submit}>{error ? <ServiceErrorMessage error={error} /> : null}<fieldset disabled={busy} className="space-y-5">
    <label className="form-label">{t('field')}<select className="form-input" value={fieldId} onChange={e => { setFieldId(e.target.value); setSport(fields.find(f => f.id === e.target.value)?.sports[0] || ''); setStart(null); }}>{fields.map(field => <option value={field.id} key={field.id}>{field.name}</option>)}</select></label>
    <div className="grid gap-5 sm:grid-cols-2"><label className="form-label">{t('sport')}<select className="form-input" value={sport} onChange={e => { if (isSport(e.target.value)) setSport(e.target.value); }}>{selected.sports.map(sport => <option value={sport} key={sport}>{t(sport)}</option>)}</select></label><label className="form-label">{t('date')}<input className="form-input" type="date" required min={venueToday()} value={date} onChange={e => { setDate(e.target.value); setStart(null); }} /></label></div>
    <label className="form-label">{t('duration')}<select className="form-input" value={duration} onChange={e => { setDuration(Number(e.target.value)); setStart(null); }}>{[1, 2, 3, 4].map(hours => <option value={hours} key={hours}>{hours} {t('hours')}</option>)}</select></label>
    <fieldset><legend className="mb-3 font-semibold">{t('start')}</legend>{slots.loading ? <Loading /> : slots.error ? <ServiceErrorMessage error={slots.error} retry={slots.reload} /> : !validStarts.length ? <p>{t('noSlots')}</p> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{validStarts.map(slot => <label key={slot.startHour} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border p-3 ${chosenStart === slot.startHour ? 'border-green-800 bg-green-50' : 'border-slate-300'}`}><input type="radio" name="start" checked={chosenStart === slot.startHour} onChange={() => setStart(slot.startHour)} />{hourLabel(slot.startHour)}</label>)}</div>}</fieldset>
    <div className="rounded-xl bg-green-50 p-4"><p>{t('total')}: <strong>{money(quoteMinor(selected.hourlyRateMinor, 0, duration))}</strong></p><p className="mt-2 text-sm">{t('pricingOpen')}</p></div><p className="text-sm">{t('manualSettlement')}</p><p className="text-sm text-slate-600">{t('demoPolicy')}</p>
    <button className="action w-full" disabled={busy || slots.loading || !!slots.error || chosenStart === null} type="submit">{t(busy ? 'loading' : 'reserve')}</button>
  </fieldset></form>;
}
