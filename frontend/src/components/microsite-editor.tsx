'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { Microsite } from '@/services/contracts';
import { contentService, venuesService } from '@/services';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { SiteContentEditor } from './site-content-editor';
import { VenueSite } from './venue-site';
import { Empty, Loading, ServiceErrorMessage } from './service-state';

export function MicrositeEditor({ venueId }: { venueId?: string }) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState('');
  const [dirty, setDirty] = useState(false);
  const venues = useServiceQuery(useCallback(signal => venuesService.owned(signal), []));

  if (venues.loading) return <Loading />;
  if (venues.error) return <ServiceErrorMessage error={venues.error} retry={venues.reload} />;
  if (!venues.data?.length) return <Empty />;

  const allowed = venues.data.filter(v => !venueId || v.id === venueId);
  if (!allowed.length) return <p role="alert">{t('forbidden')}</p>;

  const venue = allowed.find(v => v.id === selectedId) || allowed[0];

  function handleVenueChange(nextId: string) {
    if (nextId === venue.id) return;
    if (dirty) {
      const proceed = window.confirm(t('switchVenueConfirm'));
      if (!proceed) return;
    }
    setDirty(false);
    setSelectedId(nextId);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{t('microsite')}</h1>
        <label className="form-label mb-0 sm:max-w-xs">
          <span className="sr-only">{t('chooseVenue')}</span>
          <select
            className="form-input"
            value={venue.id}
            onChange={e => handleVenueChange(e.target.value)}
          >
            {allowed.map(v => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Draft
        key={venue.id}
        venueId={venue.id}
        slug={venue.slug}
        onDirtyChange={setDirty}
      />
    </div>
  );
}

function Draft({
  venueId,
  slug,
  onDirtyChange,
}: {
  venueId: string;
  slug: string;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const query = useServiceQuery(useCallback(signal => contentService.draft(venueId, signal), [venueId]));
  if (query.loading) return <Loading />;
  if (query.error || !query.data) return <ServiceErrorMessage error={query.error} retry={query.reload} />;
  return <EditForm initial={query.data} slug={slug} onDirtyChange={onDirtyChange} />;
}

function EditForm({
  initial,
  slug,
  onDirtyChange,
}: {
  initial: Microsite;
  slug: string;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [message, setMessage] = useState<'saved' | 'publicationSuccess' | 'unpublishSuccess' | null>(null);
  const [error, setError] = useState<unknown>();

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  async function handleSave(publish = false) {
    setBusy(true);
    setError(undefined);
    setMessage(null);
    try {
      const result = await contentService.save(draft);
      setDraft(result);
      setSaved(result);
      if (publish) {
        const pubResult = await contentService.publish(initial.venueId);
        setDraft(pubResult);
        setSaved(pubResult);
        setMessage('publicationSuccess');
      } else {
        setMessage('saved');
      }
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function handleUnpublish() {
    if (!window.confirm(t('unpublishConfirm'))) return;
    setBusy(true);
    setError(undefined);
    setMessage(null);
    try {
      const result = await contentService.unpublish(initial.venueId);
      setDraft(result);
      setSaved(result);
      setMessage('unpublishSuccess');
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  function handleDiscard() {
    if (dirty && !window.confirm(t('discardConfirm'))) return;
    setDraft(saved);
    setError(undefined);
    setMessage(null);
  }

  return (
    <div className="space-y-6">
      {/* Top Header / Status bar & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === 'edit'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setMode('edit')}
            >
              {t('editorTab')}
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === 'preview'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setMode('preview')}
            >
              👁️ {t('livePreview')}
            </button>
          </div>

          {draft.published ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              {t('statusPublished')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              {t('statusUnpublished')}
            </span>
          )}

          {dirty && (
            <span role="status" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 animate-pulse">
              ● {t('unsaved')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/s/${slug}`} target="_blank" rel="noopener noreferrer" className="filter-pill text-xs">
            {t('viewSite')} ↗
          </Link>
        </div>
      </div>

      {mode === 'preview' ? (
        <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
          <VenueSite
            slug={slug}
            previewSite={draft}
            isDraftPreview
            onExitPreview={() => setMode('edit')}
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Main Edit Form */}
          <form
            className="panel space-y-5"
            onSubmit={event => {
              event.preventDefault();
              void handleSave(false);
            }}
          >
            <p className="text-sm text-slate-600">{t('draftHelp')}</p>

            {error ? <ServiceErrorMessage error={error} /> : null}
            {message && <p role="status" className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 text-sm font-medium">{t(message)}</p>}

            <fieldset disabled={busy} className="space-y-5">
              <label className="form-label">
                {t('tagline')}
                <input
                  className="form-input"
                  required
                  maxLength={120}
                  value={draft.tagline}
                  onChange={e => setDraft({ ...draft, tagline: e.target.value })}
                />
              </label>

              <label className="form-label">
                {t('description')}
                <textarea
                  className="form-input"
                  rows={4}
                  maxLength={5000}
                  value={draft.description}
                  onChange={e => setDraft({ ...draft, description: e.target.value })}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-label">
                  {t('color')}
                  <input
                    className="form-input h-11 cursor-pointer"
                    type="color"
                    value={draft.primaryColor}
                    onChange={e => setDraft({ ...draft, primaryColor: e.target.value })}
                  />
                </label>

                <label className="form-label">
                  {t('announcement')}
                  <input
                    className="form-input"
                    maxLength={200}
                    placeholder={t('announcementPlaceholder')}
                    value={draft.announcement || ''}
                    onChange={e => setDraft({ ...draft, announcement: e.target.value || null })}
                  />
                </label>
              </div>

              <label className="form-label">
                {t('heroImage')}
                <input
                  className="form-input"
                  placeholder="https://... or /venue-card-1.jpg"
                  value={draft.heroImage || ''}
                  onChange={e => setDraft({ ...draft, heroImage: e.target.value || null })}
                />
                <span className="text-xs text-slate-500 font-normal">{t('heroImageHelp')}</span>
              </label>

              <SiteContentEditor draft={draft} onChange={setDraft} />

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
                <button className="action" disabled={busy} type="submit">
                  {t('save')}
                </button>

                <button
                  className="min-h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 disabled:opacity-50 transition-colors"
                  disabled={busy || !draft.tagline.trim()}
                  type="button"
                  onClick={event => {
                    if (event.currentTarget.form?.reportValidity()) void handleSave(true);
                  }}
                >
                  {t('publish')}
                </button>

                {draft.published && (
                  <button
                    className="min-h-11 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 px-4 disabled:opacity-50 transition-colors text-sm font-semibold"
                    disabled={busy}
                    type="button"
                    onClick={() => void handleUnpublish()}
                  >
                    {t('unpublish')}
                  </button>
                )}

                <button
                  className="min-h-11 rounded-xl border px-4 disabled:opacity-50 text-sm"
                  disabled={busy || !dirty}
                  type="button"
                  onClick={handleDiscard}
                >
                  {t('discardChanges')}
                </button>

                <button
                  className="min-h-11 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 text-sm font-bold ml-auto"
                  type="button"
                  onClick={() => setMode('preview')}
                >
                  👁️ {t('livePreview')}
                </button>
              </div>
            </fieldset>
          </form>

          {/* Quick Preview Panel on side */}
          <div className="panel self-start space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-600">{t('draft')}</p>
              <button
                type="button"
                className="text-xs text-[#2d6a4f] font-bold hover:underline"
                onClick={() => setMode('preview')}
              >
                {t('livePreview')} ↗
              </button>
            </div>

            <div
              className="rounded-2xl border-l-8 p-5 bg-white shadow-sm"
              style={{ borderLeftColor: draft.primaryColor }}
            >
              {draft.announcement && (
                <div className="mb-3 text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg font-semibold">
                  📣 {draft.announcement}
                </div>
              )}
              <h2 className="break-words text-2xl font-bold">{draft.tagline}</h2>
              <p className="mt-3 whitespace-pre-wrap break-words text-slate-700 text-sm leading-relaxed">
                {draft.description}
              </p>
            </div>

            <div className="border-t pt-4 text-xs text-slate-500 space-y-2">
              <div className="flex justify-between">
                <span>{t('matchHighlights')}:</span>
                <span className="font-bold text-slate-800">{(draft.highlights || []).length}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('upcomingEvents')}:</span>
                <span className="font-bold text-slate-800">{(draft.events || []).length}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('status')}:</span>
                <span className="font-bold text-slate-800">
                  {draft.published ? t('statusPublished') : t('statusUnpublished')}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              onClick={() => setMode('preview')}
            >
              👁️ {t('livePreview')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
