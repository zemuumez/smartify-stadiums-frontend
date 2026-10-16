'use client';
import { useCallback, useState } from 'react';
import { adminService, mediaService } from '@/services';
import type { CameraDevice } from '@/services/contracts';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { Empty, Loading, ServiceErrorMessage } from './service-state';
import { AdminCertificationModal } from './camera-admin';
import { AnalyticsDashboard } from './analytics-dashboard';

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

export function AdminAnalytics() {
  const { t } = useLanguage();
  const venuesQuery = useServiceQuery(useCallback(signal => adminService.venues(signal), []));
  const fetchAnalytics = useCallback(async (params: Parameters<typeof adminService.analytics>[0], signal?: AbortSignal) => {
    return adminService.analytics(params, signal);
  }, []);

  return (
    <AnalyticsDashboard
      title={t('adminAnalyticsTitle')}
      venues={venuesQuery.data || []}
      fetchAnalytics={fetchAnalytics}
      isAdmin={true}
    />
  );
}

export function AdminCameras() {
  const { t } = useLanguage();
  const [certifyingCamera, setCertifyingCamera] = useState<CameraDevice | null>(null);
  const query = useServiceQuery(useCallback((signal: AbortSignal) => mediaService.adminCameras(signal), []));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('adminCamerasTitle')}</h1>
          <p className="mt-1 text-sm text-slate-600">{t('allVenuesCameras')}</p>
        </div>
      </div>

      {query.loading ? (
        <Loading />
      ) : query.error ? (
        <ServiceErrorMessage error={query.error} retry={query.reload} />
      ) : !query.data?.length ? (
        <Empty />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {query.data.map(camera => (
            <article key={camera.id} className="panel space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{camera.name}</h2>
                  <p className="text-sm text-slate-600">
                    {camera.model} · <span className="font-mono text-xs">{camera.serialNumber}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Venue: {camera.venueId} · Field: {camera.fieldId || 'Unassigned'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      camera.certificationStatus === 'passed'
                        ? 'bg-emerald-100 text-emerald-900'
                        : camera.certificationStatus === 'failed'
                        ? 'bg-rose-100 text-rose-900'
                        : camera.certificationStatus === 'revoked'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {camera.certificationStatus.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-slate-500">Status: {camera.status}</span>
                </div>
              </div>

              {camera.certificationStatus === 'failed' && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900 space-y-1">
                  <p className="font-bold">{t('failureReason')}: {camera.failureReason || 'Verification check failed'}</p>
                  <p>{t('recoveryGuidance')}: {camera.recoveryGuidance || 'Contact support for sensor recalibration.'}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  data-testid={`certify-camera-${camera.id}`}
                  className="action bg-purple-900 hover:bg-purple-950 text-white text-xs font-semibold px-4 py-2"
                  onClick={() => setCertifyingCamera(camera)}
                >
                  {t('reviewAndCertify')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {certifyingCamera && (
        <AdminCertificationModal
          camera={certifyingCamera}
          onClose={() => setCertifyingCamera(null)}
          onCertified={() => {
            setCertifyingCamera(null);
            query.reload();
          }}
        />
      )}
    </div>
  );
}

