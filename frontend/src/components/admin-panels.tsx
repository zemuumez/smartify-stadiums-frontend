'use client';
import { useCallback, useState } from 'react';
import { adminService, mediaService } from '@/services';
import type { CameraDevice, VenueReviewAction, VenueReviewRecord } from '@/services/contracts';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { Empty, Loading, ServiceErrorMessage } from './service-state';
import { AdminCertificationModal } from './camera-admin';
import { AnalyticsDashboard } from './analytics-dashboard';

export function AdminVenues() {
  const { t } = useLanguage();
  const query = useServiceQuery(useCallback(() => adminService.venues(), []));
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [activeHistoryVenueId, setActiveHistoryVenueId] = useState<string | null>(null);
  const [reviewsHistory, setReviewsHistory] = useState<Record<string, VenueReviewRecord[]>>({});
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = async (venueId: string) => {
    if (activeHistoryVenueId === venueId) {
      setActiveHistoryVenueId(null);
      return;
    }
    setActiveHistoryVenueId(venueId);
    setLoadingHistory(true);
    try {
      const records = await adminService.reviews(venueId);
      setReviewsHistory(prev => ({ ...prev, [venueId]: records }));
    } catch (err) {
      setError(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleReviewAction = async (venueId: string, action: VenueReviewAction) => {
    setBusy(true);
    setError(undefined);
    try {
      await adminService.reviewAction(venueId, {
        action,
        reason: reason.trim() || (action === 'approve' ? 'Approved by platform administrator' : ''),
        notes: notes.trim() || undefined,
      });
      setReason('');
      setNotes('');
      query.reload();
      if (activeHistoryVenueId === venueId) {
        const records = await adminService.reviews(venueId);
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('venues')}</h1>
          <p className="mt-1 text-sm text-slate-600">{t('cameraSeparationNotice')}</p>
        </div>
      </div>

      <div className="panel space-y-3">
        <label className="form-label">
          {t('reviewReason')}
          <input
            className="form-input"
            required
            maxLength={300}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Documentation verified / Inspection requirements not met"
          />
        </label>
        <label className="form-label">
          {t('notesOptional')}
          <input
            className="form-input"
            maxLength={500}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Internal compliance reference"
          />
        </label>
      </div>

      {error ? <ServiceErrorMessage error={error} /> : null}

      {query.loading ? (
        <Loading />
      ) : query.error ? (
        <ServiceErrorMessage error={query.error} retry={query.reload} />
      ) : !query.data?.length ? (
        <Empty />
      ) : (
        <div className="space-y-4">
          {query.data.map(venue => (
            <article key={venue.id} className="panel space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{venue.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {venue.city} · <span className="font-mono text-xs">{venue.id}</span>
                  </p>
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

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                {venue.status === 'active' ? (
                  <button
                    type="button"
                    className="action bg-rose-700 hover:bg-rose-800 text-white"
                    disabled={busy || !reason.trim()}
                    onClick={() => handleReviewAction(venue.id, 'suspend')}
                  >
                    {t('suspend')}
                  </button>
                ) : venue.status === 'suspended' ? (
                  <button
                    type="button"
                    className="action bg-emerald-700 hover:bg-emerald-800 text-white"
                    disabled={busy || !reason.trim()}
                    onClick={() => handleReviewAction(venue.id, 'reinstate')}
                  >
                    {t('reinstate')}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="action"
                      disabled={busy}
                      onClick={() => handleReviewAction(venue.id, 'approve')}
                    >
                      {t('approve')}
                    </button>
                    {venue.status === 'pending' && (
                      <button
                        type="button"
                        className="action bg-purple-700 hover:bg-purple-800 text-white"
                        disabled={busy || !reason.trim()}
                        onClick={() => handleReviewAction(venue.id, 'request_changes')}
                      >
                        {t('requestChanges')}
                      </button>
                    )}
                  </>
                )}

                <button
                  type="button"
                  className="min-h-11 rounded-xl border border-slate-300 px-4 text-xs font-semibold hover:bg-slate-50"
                  onClick={() => loadHistory(venue.id)}
                >
                  {t('reviewHistory')}
                </button>
              </div>

              {activeHistoryVenueId === venue.id && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">{t('reviewHistory')}</h3>
                  {loadingHistory ? (
                    <Loading />
                  ) : !reviewsHistory[venue.id]?.length ? (
                    <p className="text-xs text-slate-500">{t('noReviewsFound')}</p>
                  ) : (
                    <div className="space-y-2">
                      {reviewsHistory[venue.id].map(rev => (
                        <div key={rev.id} className="rounded-lg border border-slate-200 bg-white p-3 text-xs space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2 font-medium">
                            <span className="font-semibold text-slate-900">{rev.action.toUpperCase()}</span>
                            <time className="text-slate-500">{rev.createdAt}</time>
                          </div>
                          <p className="text-slate-600">
                            {t('previousStatus')}: {t(rev.previousStatus)} → {t('newStatus')}: {t(rev.newStatus)}
                          </p>
                          <p className="text-slate-800 font-medium">
                            {t('reason')}: {rev.reason}
                          </p>
                          {rev.notes && <p className="text-slate-600">{t('notes')}: {rev.notes}</p>}
                          <p className="text-slate-500">{t('reviewer')}: {rev.reviewerName}</p>
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
    </div>
  );
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

