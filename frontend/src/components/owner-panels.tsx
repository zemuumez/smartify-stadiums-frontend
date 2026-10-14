'use client';
import { useCallback, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { billingService, fieldsService, mediaService, venuesService } from '@/services';
import type { Field, Venue } from '@/services/contracts';
import type { FieldInput } from '@/services/fields.service';
import { supportedSports, hourLabel } from '@/services/sports';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { useAuthStore } from '@/lib/auth-store';
import { Empty, Loading, ServiceErrorMessage } from './service-state';

export function OwnerOverview() {
  const { t, money } = useLanguage(); const query = useServiceQuery(useCallback(() => billingService.analytics(), []));
  if (query.loading) return <Loading />; if (query.error || !query.data) return <ServiceErrorMessage error={query.error} retry={query.reload} />;
  const data = query.data;
  return <div className="space-y-6"><h1 className="text-3xl font-bold">{t('overview')}</h1><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{ title: t('booking'), value: data.bookings }, { title: t('collected'), value: money(data.collectedMinor) }, { title: t('outstanding'), value: money(data.outstandingMinor) }, { title: t('cancelled'), value: data.cancelled }].map(item => <article className="panel" key={item.title}><p className="text-sm text-slate-600">{item.title}</p><p className="mt-3 break-words text-2xl font-bold">{item.value}</p></article>)}</div><Link className="action" href="/dashboard/bookings">{t('ownerBookings')}</Link></div>;
}
export function OwnerVenues() {
  const { t } = useLanguage(); const query = useServiceQuery(useCallback(signal => venuesService.owned(signal), []));
  const [busy, setBusy] = useState(false); const [error, setError] = useState<unknown>(); const [saved, setSaved] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); setBusy(true); setError(undefined); setSaved(false);
    try { await venuesService.create({ name: String(data.get('name')), city: String(data.get('city')), address: String(data.get('address')), description: String(data.get('description')), phone: String(data.get('phone')) }); form.reset(); setSaved(true); query.reload(); } catch (error) { setError(error); } finally { setBusy(false); }
  }
  return <div className="space-y-6"><h1 className="text-3xl font-bold">{t('venues')}</h1>{query.loading ? <Loading /> : query.error ? <ServiceErrorMessage error={query.error} retry={query.reload} /> : !query.data?.length ? <Empty /> : <div className="grid gap-4 sm:grid-cols-2">{query.data.map(venue => <article className="panel" key={venue.id}><h2 className="text-xl font-bold">{venue.name}</h2><p className="my-3">{venue.city} · {t(venue.status)}</p>{venue.status === 'active' && <Link href={`/s/${venue.slug}`} className="underline">{t('viewSite')}</Link>}</article>)}</div>}
    <form className="panel space-y-4" onSubmit={submit}><h2 className="text-xl font-bold">{t('submitVenue')}</h2>{error ? <ServiceErrorMessage error={error} /> : null}{saved && <p role="status">{t('submitted')}</p>}<fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">{(['name', 'city', 'address', 'phone'] as const).map(key => <label className="form-label" key={key}>{t(key === 'name' ? 'venueName' : key)}<input className="form-input" name={key} type={key === 'phone' ? 'tel' : 'text'} required maxLength={200} /></label>)}<label className="form-label sm:col-span-2">{t('description')}<textarea className="form-input" name="description" maxLength={5000} /></label><button className="action" type="submit" disabled={busy}>{t('submitVenue')}</button></fieldset></form>
  </div>;
}
export function OwnerFields() {
  const { t, money } = useLanguage(); const [editing, setEditing] = useState<Field | null>(null); const [adding, setAdding] = useState(false);
  const query = useServiceQuery(useCallback(async () => { const [fields, venues] = await Promise.all([fieldsService.list(), venuesService.owned()]); return { fields, venues }; }, []));
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
export function OwnerCameras() {
  const { t } = useLanguage(); const query = useServiceQuery(useCallback(() => mediaService.cameras(), []));
  return <div className="space-y-6"><h1 className="text-3xl font-bold">{t('cameras')}</h1><p>{t('privacyNotice')}</p>{query.loading ? <Loading /> : query.error ? <ServiceErrorMessage error={query.error} retry={query.reload} /> : !query.data?.length ? <Empty /> : query.data.map(camera => <article className="panel" key={camera.id}><h2 className="text-xl font-bold">{camera.name}</h2><p>{camera.model}</p><p className="mt-3">{t(camera.status === 'pending' ? 'awaitingCertification' : camera.status)}</p></article>)}</div>;
}
export function OwnerBilling() {
  const { t, money } = useLanguage(); const query = useServiceQuery(useCallback(() => billingService.invoices(), []));
  return <div className="space-y-6"><h1 className="text-3xl font-bold">{t('billing')}</h1><p>{t('pricingOpen')}</p>{query.loading ? <Loading /> : query.error ? <ServiceErrorMessage error={query.error} retry={query.reload} /> : !query.data?.length ? <Empty /> : query.data.map(invoice => <article className="panel" key={invoice.id}><h2>{invoice.id}</h2><p>{money(invoice.totalMinor)} · {t(invoice.status)}</p></article>)}</div>;
}
export function AccountSettings() {
  const { t } = useLanguage(); const { user } = useAuthStore();
  return <div className="panel space-y-4"><h1 className="text-3xl font-bold">{t('account')}</h1><dl><dt className="font-semibold">{t('name')}</dt><dd className="mb-4">{user?.full_name}</dd><dt className="font-semibold">{t('phone')}</dt><dd>{user?.phone}</dd></dl><p>{t('profileEditingPending')}</p><Link href="/contact" className="underline">{t('support')}</Link></div>;
}
