'use client';
import { useCallback, useState } from 'react';
import { adminService } from '@/services';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { Empty, Loading, ServiceErrorMessage } from './service-state';
export function AdminVenues() {
  const { t } = useLanguage(); const query = useServiceQuery(useCallback(() => adminService.venues(), []));
  const [reason, setReason] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState<unknown>();
  return <div className="space-y-6"><h1 className="text-3xl font-bold">{t('venues')}</h1><label className="form-label">{t('reviewReason')}<input className="form-input" required maxLength={300} value={reason} onChange={e => setReason(e.target.value)} /></label>{error ? <ServiceErrorMessage error={error} /> : null}{query.loading ? <Loading /> : query.error ? <ServiceErrorMessage error={query.error} retry={query.reload} /> : !query.data?.length ? <Empty /> : query.data.map(venue => <article key={venue.id} className="panel"><h2 className="text-xl font-bold">{venue.name}</h2><p className="my-3">{venue.city} · {t(venue.status)}</p><button className="action" disabled={busy || !reason.trim()} onClick={async () => { setBusy(true); setError(undefined); try { await adminService.review(venue.id, venue.status === 'active' ? 'suspended' : 'active', reason); setReason(''); query.reload(); } catch (error) { setError(error); } finally { setBusy(false); } }}>{t(venue.status === 'active' ? 'suspend' : 'approve')}</button></article>)}</div>;
}
export function AdminUsers() {
  const { t } = useLanguage(); const [search, setSearch] = useState(''); const query = useServiceQuery(useCallback(() => adminService.users(), []));
  return <div className="space-y-6"><h1 className="text-3xl font-bold">{t('users')}</h1><label className="form-label">{t('name')}<input className="form-input" value={search} onChange={e => setSearch(e.target.value)} /></label>{query.loading ? <Loading /> : query.error ? <ServiceErrorMessage error={query.error} retry={query.reload} /> : <div className="grid gap-4 sm:grid-cols-2">{query.data?.filter(user => user.full_name.toLowerCase().includes(search.toLowerCase())).map(user => <article key={user.id} className="panel"><h2 className="text-xl font-bold">{user.full_name}</h2><p>{t(user.role)}</p><p>{user.phone}</p></article>)}</div>}</div>;
}
export function AdminOverview() {
  const { t } = useLanguage(); const query = useServiceQuery(useCallback(() => adminService.audit(), []));
  return <div className="space-y-6"><h1 className="text-3xl font-bold">{t('audit')}</h1>{query.loading ? <Loading /> : query.error ? <ServiceErrorMessage error={query.error} retry={query.reload} /> : !query.data?.length ? <Empty /> : query.data.slice().reverse().map(entry => <article key={entry.id} className="panel break-words"><p className="font-semibold">{entry.action}</p><p className="text-sm">{entry.resourceId}</p><time className="text-xs text-slate-600">{entry.createdAt}</time></article>)}</div>;
}
