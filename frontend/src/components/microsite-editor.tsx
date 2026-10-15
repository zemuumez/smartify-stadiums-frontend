'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { Microsite } from '@/services/contracts';
import { contentService, venuesService } from '@/services';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { SiteContentEditor } from './site-content-editor';
import { Empty, Loading, ServiceErrorMessage } from './service-state';
export function MicrositeEditor({ venueId }: { venueId?: string }) {
  const { t } = useLanguage(); const [selectedId, setSelectedId] = useState('');
  const venues = useServiceQuery(useCallback(signal => venuesService.owned(signal), []));
  if (venues.loading) return <Loading />;
  if (venues.error) return <ServiceErrorMessage error={venues.error} retry={venues.reload} />;
  if (!venues.data?.length) return <Empty />;
  const allowed = venues.data.filter(v => !venueId || v.id === venueId);
  if (!allowed.length) return <p role="alert">{t('forbidden')}</p>;
  const venue = allowed.find(v => v.id === selectedId) || allowed[0];
  return <div className="space-y-6"><h1 className="text-3xl font-bold">{t('microsite')}</h1><label className="form-label">{t('chooseVenue')}<select className="form-input" value={venue.id} onChange={e => setSelectedId(e.target.value)}>{allowed.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></label><Draft key={venue.id} venueId={venue.id} slug={venue.slug} /></div>;
}
function Draft({ venueId, slug }: { venueId: string; slug: string }) {
  const query = useServiceQuery(useCallback(() => contentService.draft(venueId), [venueId]));
  if (query.loading) return <Loading />;
  if (query.error || !query.data) return <ServiceErrorMessage error={query.error} retry={query.reload} />;
  return <EditForm initial={query.data} slug={slug} />;
}
function EditForm({ initial, slug }: { initial: Microsite; slug: string }) {
  const { t } = useLanguage(); const [draft, setDraft] = useState(initial); const [saved, setSaved] = useState(initial); const [busy, setBusy] = useState(false); const [message, setMessage] = useState<'saved' | 'publicationSuccess' | null>(null); const [error, setError] = useState<unknown>();
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [dirty]);
  async function save(publish = false) { setBusy(true); setError(undefined); setMessage(null); try { const result = await contentService.save(draft); setDraft(result); setSaved(result); if (publish) await contentService.publish(initial.venueId); setMessage(publish ? 'publicationSuccess' : 'saved'); } catch (error) { setError(error); } finally { setBusy(false); } }
  return <div className="grid gap-6 lg:grid-cols-2"><form className="panel space-y-5" onSubmit={event => { event.preventDefault(); void save(); }}><p>{t('draftHelp')}</p>{dirty && <p role="status" className="text-amber-800">{t('unsaved')}</p>}{error ? <ServiceErrorMessage error={error} /> : null}{message && <p role="status" className="text-green-800">{t(message)}</p>}<fieldset disabled={busy} className="space-y-5"><label className="form-label">{t('tagline')}<input className="form-input" required maxLength={120} value={draft.tagline} onChange={e => setDraft({ ...draft, tagline: e.target.value })} /></label><label className="form-label">{t('description')}<textarea className="form-input" rows={5} maxLength={5000} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></label><label className="form-label">{t('color')}<input className="form-input" type="color" value={draft.primaryColor} onChange={e => setDraft({ ...draft, primaryColor: e.target.value })} /></label><SiteContentEditor draft={draft} onChange={setDraft} /><div className="flex flex-wrap gap-3"><button className="action" disabled={busy} type="submit">{t('save')}</button><button className="min-h-11 rounded-xl border px-4" disabled={busy || !draft.tagline.trim()} type="button" onClick={event => { if (event.currentTarget.form?.reportValidity()) void save(true); }}>{t('publish')}</button></div></fieldset></form><div className="panel self-start"><p className="text-sm text-slate-600">{t('draft')}</p><div className="my-4 rounded-xl border-l-8 p-5" style={{ borderLeftColor: draft.primaryColor }}><h2 className="break-words text-2xl font-bold">{draft.tagline}</h2><p className="mt-3 whitespace-pre-wrap break-words">{draft.description}</p></div><Link href={`/s/${slug}`} className="underline">{t('viewSite')}</Link></div></div>;
}
