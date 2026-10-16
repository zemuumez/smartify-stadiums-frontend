'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { mediaService, venuesService } from '@/services';
import type {
  CameraCertificationStatus,
  CameraConnectivityStatus,
  CameraDevice,
  Field,
  MatchRecording,
  MediaVisibility,
  PrivacyBlurStatus,
  PrivacyConsentStatus,
  RecordingStatus,
} from '@/services/contracts';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import type { MessageKey } from '@/i18n/en';
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

export function OwnerCameras({ venueId }: { venueId?: string }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'cameras' | 'recordings'>('cameras');
  const [selectedVenueId, setSelectedVenueId] = useState(venueId || '');
  const [editingCamera, setEditingCamera] = useState<CameraDevice | null>(null);
  const [isAddingCamera, setIsAddingCamera] = useState(false);
  const [inspectingRecording, setInspectingRecording] = useState<MatchRecording | null>(null);
  const [actionError, setActionError] = useState<unknown>();
  const [busy, setBusy] = useState(false);

  const query = useServiceQuery(
    useCallback(async signal => {
      const [ownedVenues, cameras, recordings] = await Promise.all([
        venuesService.owned(signal),
        mediaService.cameras(venueId, signal),
        mediaService.recordings(venueId, signal),
      ]);
      const activeVenues = ownedVenues.filter(v => v.status === 'active' && (!venueId || v.id === venueId));
      const fields = await Promise.all(
        activeVenues.map(v => venuesService.fields(v.id, signal))
      ).then(res => res.flat());
      return { venues: activeVenues, cameras, recordings, fields };
    }, [venueId])
  );

  const effectiveVenueId = venueId || selectedVenueId || (query.data?.venues[0]?.id ?? '');
  const venueCourts = query.data?.fields.filter(f => f.venueId === effectiveVenueId) || [];
  const venueCameras = query.data?.cameras.filter(c => c.venueId === effectiveVenueId) || [];
  const venueRecordings = query.data?.recordings.filter(r => r.venueId === effectiveVenueId) || [];

  if (query.loading && !query.data) return <Loading />;
  if (query.error || !query.data) return <ServiceErrorMessage error={query.error} retry={query.reload} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('cameras')}</h1>
          <p className="mt-1 text-sm text-slate-600">{t('privacyNotice')}</p>
        </div>
        {!venueId && query.data.venues.length > 1 && (
          <label className="form-label min-w-[200px]">
            {t('chooseVenue')}
            <select
              className="form-input mt-1"
              value={effectiveVenueId}
              onChange={e => setSelectedVenueId(e.target.value)}
            >
              {query.data.venues.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav aria-label="Media sub-tabs" className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('cameras')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === 'cameras'
              ? 'border-green-900 text-green-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('camerasTab')} ({venueCameras.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('recordings')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === 'recordings'
              ? 'border-green-900 text-green-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('recordingsTab')} ({venueRecordings.length})
        </button>
      </nav>

      {actionError ? <ServiceErrorMessage error={actionError} /> : null}

      {activeTab === 'cameras' ? (
        <section aria-label={t('camerasTab')} className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">{t('deviceSecretsNotice')}</p>
            <button
              type="button"
              className="action"
              disabled={!effectiveVenueId}
              onClick={() => {
                setEditingCamera(null);
                setIsAddingCamera(true);
              }}
            >
              {t('addCamera')}
            </button>
          </div>

          {venueCameras.length === 0 ? (
            <div className="panel text-center py-12">
              <p className="text-slate-500">{t('noCamerasYet')}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {venueCameras.map(camera => {
                const court = venueCourts.find(f => f.id === camera.fieldId);
                return (
                  <article key={camera.id} className="panel space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{camera.name}</h2>
                        <p className="text-sm font-medium text-slate-600">{camera.model}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">S/N: {camera.serialNumber}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <CertificationBadge status={camera.certificationStatus} />
                        <ConnectivityBadge status={camera.connectivityStatus} />
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                      <span className="font-semibold">{t('assignedCourt')}: </span>
                      {court ? court.name : <span className="italic text-slate-400">{t('unassignedCourt')}</span>}
                    </div>

                    {camera.certificationStatus === 'failed' && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900 space-y-1">
                        <p className="font-bold">{t('failureReason')}: {camera.failureReason || 'Verification check failed'}</p>
                        <p>{t('recoveryGuidance')}: {camera.recoveryGuidance || 'Contact support for sensor recalibration.'}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50"
                        onClick={() => {
                          setEditingCamera(camera);
                          setIsAddingCamera(false);
                        }}
                      >
                        {t('editCamera')}
                      </button>
                      {camera.certificationStatus !== 'passed' && (
                        <div className="flex flex-col gap-0.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                          <span className="font-semibold text-slate-800">{t('adminCertificationRequired')}</span>
                          <span className="text-slate-500">{t('adminCertNotice')}</span>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section aria-label={t('recordingsTab')} className="space-y-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
            {t('storageNotice')}
          </div>

          {venueRecordings.length === 0 ? (
            <div className="panel text-center py-12">
              <p className="text-slate-500">{t('noRecordingsYet')}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {venueRecordings.map(rec => {
                const court = venueCourts.find(f => f.id === rec.fieldId);
                return (
                  <article key={rec.id} className="panel space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {court?.name || rec.fieldId} · {t(rec.sport)}
                        </h2>
                        <p className="text-xs text-slate-500">
                          {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : ''} · {rec.duration}
                        </p>
                        {rec.teamName && (
                          <span className="inline-block mt-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                            {rec.teamName}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <RecordingStatusBadge status={rec.status} />
                        <VisibilityBadge visibility={rec.publication.visibility} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      <div>
                        <span className="font-semibold block">{t('participantConsent')}:</span>
                        <ConsentStatusBadge status={rec.consent.status} />
                      </div>
                      <div>
                        <span className="font-semibold block">{t('faceBlurStatus')}:</span>
                        <BlurStatusBadge status={rec.privacy.faceBlurStatus} />
                      </div>
                    </div>

                    {rec.status === 'failed' && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900 space-y-2">
                        <p className="font-semibold">{t('failureReason')}: {rec.failureReason || 'Processing pipeline error'}</p>
                        {rec.retryEligible && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={async () => {
                              setBusy(true);
                              setActionError(undefined);
                              try {
                                await mediaService.retryRecording(rec.id);
                                query.reload();
                              } catch (err) {
                                setActionError(err);
                              } finally {
                                setBusy(false);
                              }
                            }}
                            className="action text-xs"
                          >
                            {t('retryProcessing')}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-400 font-mono">
                        {t('linkedBooking')}: {rec.bookingId}
                      </span>
                      <button
                        type="button"
                        className="action text-xs"
                        onClick={() => setInspectingRecording(rec)}
                      >
                        {t('recordingDetails')}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Add or Edit Camera Modal */}
      {(isAddingCamera || editingCamera) && (
        <CameraFormModal
          camera={editingCamera}
          venueId={effectiveVenueId}
          fields={venueCourts}
          onClose={() => {
            setIsAddingCamera(false);
            setEditingCamera(null);
          }}
          onSaved={() => {
            setIsAddingCamera(false);
            setEditingCamera(null);
            query.reload();
          }}
        />
      )}

      {/* Inspect & Manage Recording Modal */}
      {inspectingRecording && (
        <RecordingDetailModal
          recording={inspectingRecording}
          courtName={venueCourts.find(f => f.id === inspectingRecording.fieldId)?.name}
          cameraName={venueCameras.find(c => c.id === inspectingRecording.cameraId)?.name}
          onClose={() => setInspectingRecording(null)}
          onUpdated={() => {
            query.reload();
            // Refresh local inspecting recording
            mediaService.recordingDetail(inspectingRecording.id).then(r => setInspectingRecording(r)).catch(() => {});
          }}
        />
      )}
    </div>
  );
}

function CertificationBadge({ status }: { status: CameraCertificationStatus }) {
  const { t } = useLanguage();
  switch (status) {
    case 'passed':
      return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">✓ {t('certPassed')}</span>;
    case 'pending':
      return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">⏳ {t('certPending')}</span>;
    case 'failed':
      return <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-900">✕ {t('certFailed')}</span>;
    case 'revoked':
      return <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-800">⊘ {t('certRevoked')}</span>;
  }
}

function ConnectivityBadge({ status }: { status: CameraConnectivityStatus }) {
  const { t } = useLanguage();
  switch (status) {
    case 'online':
      return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />{t('connOnline')}</span>;
    case 'offline':
      return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><span className="h-2 w-2 rounded-full bg-slate-400" />{t('connOffline')}</span>;
    case 'unknown':
      return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600"><span className="h-2 w-2 rounded-full bg-amber-400" />{t('connUnknown')}</span>;
  }
}

function RecordingStatusBadge({ status }: { status: RecordingStatus }) {
  const { t } = useLanguage();
  switch (status) {
    case 'scheduled':
      return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">{t('recScheduled')}</span>;
    case 'recording':
      return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-900 animate-pulse">● {t('recRecording')}</span>;
    case 'uploading':
      return <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-900">↑ {t('recUploading')}</span>;
    case 'processing':
      return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">⚙ {t('recProcessing')}</span>;
    case 'ready':
      return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">✓ {t('recReady')}</span>;
    case 'failed':
      return <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-900">✕ {t('recFailed')}</span>;
  }
}

function VisibilityBadge({ visibility }: { visibility: MediaVisibility }) {
  const { t } = useLanguage();
  switch (visibility) {
    case 'private':
      return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">🔒 {t('visPrivate')}</span>;
    case 'unlisted':
      return <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-900">🔗 {t('visUnlisted')}</span>;
    case 'public':
      return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-900">🌐 {t('visPublic')}</span>;
  }
}

function ConsentStatusBadge({ status }: { status: PrivacyConsentStatus }) {
  const { t } = useLanguage();
  switch (status) {
    case 'granted':
      return <span className="text-emerald-700 font-semibold">{t('consentGranted')}</span>;
    case 'pending':
      return <span className="text-amber-700 font-semibold">{t('consentPending')}</span>;
    case 'denied':
      return <span className="text-rose-700 font-semibold">{t('consentDenied')}</span>;
    case 'revoked':
      return <span className="text-slate-600 font-semibold">{t('consentRevoked')}</span>;
  }
}

function BlurStatusBadge({ status }: { status: PrivacyBlurStatus }) {
  const { t } = useLanguage();
  switch (status) {
    case 'completed':
      return <span className="text-emerald-700 font-semibold">{t('blurCompleted')}</span>;
    case 'processing':
      return <span className="text-sky-700 font-semibold">{t('blurProcessing')}</span>;
    case 'pending':
      return <span className="text-amber-700 font-semibold">{t('blurPending')}</span>;
    case 'failed':
      return <span className="text-rose-700 font-semibold">{t('blurFailed')}</span>;
  }
}

function CameraFormModal({
  camera,
  venueId,
  fields,
  onClose,
  onSaved,
}: {
  camera: CameraDevice | null;
  venueId: string;
  fields: Field[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const modalRef = useModalKeyboard(true, onClose);
  const [name, setName] = useState(camera?.name || '');
  const [model, setModel] = useState(camera?.model || '');
  const [serialNumber, setSerialNumber] = useState(camera?.serialNumber || '');
  const [fieldId, setFieldId] = useState(camera?.fieldId || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      if (camera) {
        await mediaService.updateCamera(camera.id, {
          name,
          model,
          fieldId: fieldId || (fields[0]?.id || ''),
        });
      } else {
        await mediaService.registerCamera({
          venueId,
          name,
          model,
          serialNumber: serialNumber || undefined,
          fieldId: fieldId || (fields[0]?.id || ''),
        });
      }
      onSaved();
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
      aria-labelledby="camera-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div ref={modalRef} tabIndex={-1} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="camera-modal-title" className="text-2xl font-bold">
            {t(camera ? 'editCamera' : 'addCamera')}
          </h2>
          <button type="button" onClick={onClose} className="min-h-11 min-w-11 text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        {error ? <ServiceErrorMessage error={error} /> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={busy} className="space-y-3">
            <label className="form-label">
              {t('cameraName')}
              <input
                required
                maxLength={100}
                className="form-input mt-1"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Court A High Cam"
              />
            </label>

            <label className="form-label">
              {t('cameraModel')}
              <input
                required
                maxLength={100}
                className="form-input mt-1"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="e.g. Veo Cam 3 4K"
              />
            </label>

            <label className="form-label">
              {t('cameraSerial')}
              <input
                required
                maxLength={100}
                className="form-input mt-1 font-mono text-sm"
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                placeholder="e.g. VEO-4K-ETH-1029"
              />
            </label>

            <label className="form-label">
              {t('assignedCourt')}
              <select
                className="form-input mt-1"
                value={fieldId}
                onChange={e => setFieldId(e.target.value)}
              >
                <option value="">{t('unassignedCourt')}</option>
                {fields.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.sports.map(s => t(s)).join(', ')})
                  </option>
                ))}
              </select>
            </label>

            <p className="text-xs text-slate-500 pt-1">
              {t('deviceSecretsNotice')}
            </p>
          </fieldset>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" disabled={busy} onClick={onClose} className="min-h-11 rounded-xl border px-4 text-sm font-semibold">
              {t('cancel')}
            </button>
            <button type="submit" disabled={busy} className="action">
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminCertificationModal({
  camera,
  onClose,
  onCertified,
}: {
  camera: CameraDevice;
  onClose: () => void;
  onCertified: () => void;
}) {
  const { t } = useLanguage();
  const modalRef = useModalKeyboard(true, onClose);
  const [decision, setDecision] = useState<'passed' | 'failed' | 'revoked'>(
    camera.certificationStatus === 'failed' || camera.certificationStatus === 'revoked'
      ? camera.certificationStatus
      : 'passed'
  );
  const [failureReason, setFailureReason] = useState(camera.failureReason || '');
  const [recoveryGuidance, setRecoveryGuidance] = useState(camera.recoveryGuidance || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();

  async function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await mediaService.certifyCamera(camera.id, {
        certificationStatus: decision,
        failureReason: decision === 'failed' ? failureReason : undefined,
        recoveryGuidance: decision === 'failed' ? recoveryGuidance : undefined,
      });
      onCertified();
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
      aria-labelledby="cert-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div ref={modalRef} tabIndex={-1} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="cert-modal-title" className="text-2xl font-bold text-purple-950">
            {t('adminReviewTitle')}
          </h2>
          <button type="button" onClick={onClose} className="min-h-11 min-w-11 text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-xs text-purple-900">
          <span className="font-bold">{t('demoSimulationOnly')}: </span>
          {t('adminCertExplanation')}
        </div>

        {error ? <ServiceErrorMessage error={error} /> : null}

        <form onSubmit={handleReview} className="space-y-4">
          <fieldset disabled={busy} className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">{camera.name}</p>
              <p className="text-xs text-slate-500">{camera.model} · {camera.serialNumber}</p>
            </div>

            <label className="form-label">
              {t('reviewDecision')}
              <select
                className="form-input mt-1"
                value={decision}
                onChange={e => setDecision(e.target.value as 'passed' | 'failed' | 'revoked')}
              >
                <option value="passed">{t('certPassed')} (Passed)</option>
                <option value="failed">{t('certFailed')} (Failed)</option>
                <option value="revoked">{t('certRevoked')} (Revoked)</option>
              </select>
            </label>

            {decision === 'failed' && (
              <>
                <label className="form-label">
                  {t('failureReason')}
                  <input
                    required
                    maxLength={200}
                    className="form-input mt-1"
                    value={failureReason}
                    onChange={e => setFailureReason(e.target.value)}
                    placeholder="e.g. Unstable mount vibrated during windy conditions"
                  />
                </label>

                <label className="form-label">
                  {t('recoveryGuidance')}
                  <input
                    required
                    maxLength={300}
                    className="form-input mt-1"
                    value={recoveryGuidance}
                    onChange={e => setRecoveryGuidance(e.target.value)}
                    placeholder="e.g. Reinforce mast clamp and re-run calibration"
                  />
                </label>
              </>
            )}
          </fieldset>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" disabled={busy} onClick={onClose} className="min-h-11 rounded-xl border px-4 text-sm font-semibold">
              {t('cancel')}
            </button>
            <button type="submit" disabled={busy} className="action bg-purple-900 hover:bg-purple-950">
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecordingDetailModal({
  recording,
  courtName,
  cameraName,
  onClose,
  onUpdated,
}: {
  recording: MatchRecording;
  courtName?: string;
  cameraName?: string;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { t } = useLanguage();
  const modalRef = useModalKeyboard(true, onClose);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [targetVisibility, setTargetVisibility] = useState<MediaVisibility>(recording.publication.visibility);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rec-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-2xl my-8 rounded-3xl bg-white p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="rec-modal-title" className="text-2xl font-bold text-slate-900">
              {courtName || recording.fieldId} · {t(recording.sport)}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {recording.id}</p>
          </div>
          <button type="button" onClick={onClose} className="min-h-11 min-w-11 text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        {error ? <ServiceErrorMessage error={error} /> : null}

        {/* Video Player or Processing State */}
        <div className="rounded-2xl overflow-hidden bg-slate-950 p-1">
          {recording.status === 'ready' && recording.playbackUrl ? (
            <div className="space-y-2">
              <video
                controls
                className="w-full aspect-video rounded-xl object-contain bg-black"
                src={recording.playbackUrl}
                poster={recording.thumbnailUrl || undefined}
              />
              <p className="px-3 pb-2 text-[11px] text-slate-400">
                {t('replayProvenance')}
              </p>
            </div>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center text-center p-6 text-slate-300">
              <div className="text-3xl mb-3">
                {recording.status === 'recording' ? '●' : recording.status === 'failed' ? '✕' : '⚙'}
              </div>
              <p className="font-semibold text-white">
                {t(`rec${recording.status.charAt(0).toUpperCase() + recording.status.slice(1)}` as MessageKey)}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {recording.status === 'failed'
                  ? recording.failureReason || t('replayFailed')
                  : t('replayProcessing')}
              </p>
            </div>
          )}
        </div>

        {/* Recording Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div className="panel p-3">
            <span className="text-xs text-slate-500 block">{t('status')}</span>
            <RecordingStatusBadge status={recording.status} />
          </div>
          <div className="panel p-3">
            <span className="text-xs text-slate-500 block">{t('assignedCourt')}</span>
            <span className="font-semibold">{courtName || recording.fieldId}</span>
          </div>
          <div className="panel p-3">
            <span className="text-xs text-slate-500 block">{t('cameras')}</span>
            <span className="font-semibold">{cameraName || recording.cameraId || 'N/A'}</span>
          </div>
          <div className="panel p-3">
            <span className="text-xs text-slate-500 block">{t('linkedBooking')}</span>
            <span className="font-semibold">{recording.bookingId}</span>
          </div>
          <div className="panel p-3">
            <span className="text-xs text-slate-500 block">{t('playbackDuration')}</span>
            <span className="font-semibold">{recording.duration}</span>
          </div>
          <div className="panel p-3">
            <span className="text-xs text-slate-500 block">{t('publicationStatus')}</span>
            <VisibilityBadge visibility={recording.publication.visibility} />
          </div>
        </div>

        {/* State Advancement Simulator */}
        {isDemoMode && (
          <section aria-label={t('demoSimulationOnly')} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800">{t('advanceSimState')}</h3>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                {t('demoSimulationOnly')}
              </span>
            </div>
            <p className="text-xs text-slate-500">{t('storageNotice')}</p>
            <div className="flex flex-wrap gap-2">
              {(['scheduled', 'recording', 'uploading', 'processing', 'ready', 'failed'] as const).map(nextStatus => (
                <button
                  key={nextStatus}
                  type="button"
                  disabled={busy || recording.status === nextStatus}
                  onClick={async () => {
                    setBusy(true);
                    setError(undefined);
                    try {
                      await mediaService.advanceRecordingDemoState(
                        recording.id,
                        nextStatus,
                        nextStatus === 'failed' ? 'Simulated AI tracking failure' : undefined
                      );
                      onUpdated();
                    } catch (err) {
                      setError(err);
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className={`min-h-9 px-3 py-1 rounded-xl text-xs font-semibold border ${
                    recording.status === nextStatus
                      ? 'bg-slate-300 text-slate-800 border-slate-400'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  → {nextStatus}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Privacy & Consent Operations */}
        <section aria-label={t('privacyConsent')} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          <h3 className="font-bold text-sm text-slate-800">{t('privacyConsent')}</h3>

          {/* Participant Consent */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block">{t('participantConsent')}</span>
              <ConsentStatusBadge status={recording.consent.status} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || recording.consent.status === 'granted'}
                onClick={async () => {
                  setBusy(true);
                  setError(undefined);
                  try {
                    await mediaService.updateConsent(recording.id, { status: 'granted' });
                    onUpdated();
                  } catch (err) {
                    setError(err);
                  } finally {
                    setBusy(false);
                  }
                }}
                className="min-h-9 px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
              >
                {t('consentGranted')}
              </button>
              <button
                type="button"
                disabled={busy || recording.consent.status === 'denied'}
                onClick={async () => {
                  setBusy(true);
                  setError(undefined);
                  try {
                    await mediaService.updateConsent(recording.id, { status: 'denied' });
                    onUpdated();
                  } catch (err) {
                    setError(err);
                  } finally {
                    setBusy(false);
                  }
                }}
                className="min-h-9 px-3 rounded-xl border border-rose-300 bg-rose-50 text-xs font-semibold text-rose-900 hover:bg-rose-100"
              >
                {t('consentDenied')}
              </button>
              <button
                type="button"
                disabled={busy || recording.consent.status === 'revoked'}
                onClick={async () => {
                  setBusy(true);
                  setError(undefined);
                  try {
                    await mediaService.updateConsent(recording.id, { status: 'revoked' });
                    onUpdated();
                  } catch (err) {
                    setError(err);
                  } finally {
                    setBusy(false);
                  }
                }}
                className="min-h-9 px-3 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                {t('consentRevoked')}
              </button>
            </div>
          </div>

          {/* Minor Guardian Consent */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  disabled={busy}
                  checked={recording.consent.requiresGuardian}
                  onChange={async e => {
                    setBusy(true);
                    setError(undefined);
                    try {
                      await mediaService.updateConsent(recording.id, {
                        minorParticipant: e.target.checked,
                        guardianStatus: e.target.checked ? (recording.consent.guardianConsentStatus || 'pending') : undefined,
                      });
                      onUpdated();
                    } catch (err) {
                      setError(err);
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
                {t('minorParticipantsPresent')}
              </label>
              {recording.consent.requiresGuardian && (
                <div className="mt-1">
                  <span className="text-xs text-slate-500 block">{t('guardianConsent')}:</span>
                  <ConsentStatusBadge status={recording.consent.guardianConsentStatus || 'pending'} />
                </div>
              )}
            </div>

            {recording.consent.requiresGuardian && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || recording.consent.guardianConsentStatus === 'granted'}
                  onClick={async () => {
                    setBusy(true);
                    setError(undefined);
                    try {
                      await mediaService.updateConsent(recording.id, {
                        minorParticipant: true,
                        guardianStatus: 'granted',
                      });
                      onUpdated();
                    } catch (err) {
                      setError(err);
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="min-h-9 px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
                >
                  {t('guardianGrant')}
                </button>
                <button
                  type="button"
                  disabled={busy || recording.consent.guardianConsentStatus === 'denied'}
                  onClick={async () => {
                    setBusy(true);
                    setError(undefined);
                    try {
                      await mediaService.updateConsent(recording.id, {
                        minorParticipant: true,
                        guardianStatus: 'denied',
                      });
                      onUpdated();
                    } catch (err) {
                      setError(err);
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="min-h-9 px-3 rounded-xl border border-rose-300 bg-rose-50 text-xs font-semibold text-rose-900 hover:bg-rose-100"
                >
                  {t('guardianDeny')}
                </button>
              </div>
            )}
          </div>

          {/* Privacy Face Blur Simulation */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block">{t('faceBlurStatus')}</span>
              <BlurStatusBadge status={recording.privacy.faceBlurStatus} />
            </div>
            <button
              type="button"
              disabled={busy || recording.privacy.faceBlurStatus === 'completed'}
              onClick={async () => {
                setBusy(true);
                setError(undefined);
                try {
                  await mediaService.completePrivacyBlur(recording.id);
                  onUpdated();
                } catch (err) {
                  setError(err);
                } finally {
                  setBusy(false);
                }
              }}
              className="min-h-9 px-3 rounded-xl border border-sky-300 bg-sky-50 text-xs font-semibold text-sky-900 hover:bg-sky-100"
            >
              {t('completeBlurAction')}
            </button>
          </div>
        </section>

        {/* Publication Controls */}
        <section aria-label={t('publicationStatus')} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t('publicationStatus')}</h3>
              <p className="text-xs text-slate-500">
                {t('privacyPolicyInvariant')}
              </p>
            </div>
            <VisibilityBadge visibility={recording.publication.visibility} />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <select
              className="form-input flex-1 min-w-[200px]"
              value={targetVisibility}
              onChange={e => setTargetVisibility(e.target.value as MediaVisibility)}
            >
              <option value="private">{t('visPrivate')}</option>
              <option value="unlisted">{t('visUnlisted')}</option>
              <option value="public">{t('visPublic')}</option>
            </select>

            <button
              type="button"
              disabled={busy || targetVisibility === recording.publication.visibility}
              onClick={async () => {
                setBusy(true);
                setError(undefined);
                try {
                  await mediaService.updatePublication(recording.id, { visibility: targetVisibility });
                  onUpdated();
                } catch (err: unknown) {
                  setError(err);
                } finally {
                  setBusy(false);
                }
              }}
              className="action"
            >
              {t('save')}
            </button>

            {recording.publication.visibility !== 'private' && (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError(undefined);
                  try {
                    await mediaService.unpublishRecording(recording.id);
                    setTargetVisibility('private');
                    onUpdated();
                  } catch (err) {
                    setError(err);
                  } finally {
                    setBusy(false);
                  }
                }}
                className="min-h-11 rounded-xl border border-rose-300 bg-rose-50 px-4 text-xs font-semibold text-rose-900 hover:bg-rose-100"
              >
                {t('unpublishRecording')}
              </button>
            )}
          </div>
        </section>

        <div className="flex justify-end pt-2">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border px-5 text-sm font-semibold">
            {t('closePlayer')}
          </button>
        </div>
      </div>
    </div>
  );
}
