'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Field, Microsite, Venue } from '@/services/contracts';
import { contentService, fieldsService, venuesService } from '@/services';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { isSupportedImageUrl } from '@/services/media-policy';
import { SiteContentEditor } from './site-content-editor';
import { VenueSite } from './venue-site';
import { Empty, Loading, ServiceErrorMessage } from './service-state';
import { cleanHistoryTrap, handleTrapPopState } from '@/services/history-trap';

export { cleanHistoryTrap };

export function MicrositeEditor({
  venueId,
  onDirtyChange,
}: {
  venueId?: string;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState('');
  const [dirty, setDirty] = useState(false);
  const venues = useServiceQuery(useCallback(signal => venuesService.owned(signal), []));

  const handleDirty = useCallback((isDirty: boolean) => {
    setDirty(isDirty);
    onDirtyChange?.(isDirty);
  }, [onDirtyChange]);

  if (venues.loading) return <Loading />;
  if (venues.error) return <ServiceErrorMessage error={venues.error} retry={venues.reload} />;
  if (!venues.data?.length) return <Empty />;

  const allowed = venues.data.filter(v => !venueId || v.id === venueId);
  if (!allowed.length) return <p role="alert">{t('forbidden')}</p>;

  const venue = allowed.find(v => v.id === selectedId) || allowed[0];

  async function handleVenueChange(nextId: string) {
    if (nextId === venue.id) return;
    if (dirty) {
      const proceed = window.confirm(t('switchVenueConfirm'));
      if (!proceed) return;
      const cleaned = await cleanHistoryTrap();
      if (!cleaned) return;
    }
    setDirty(false);
    onDirtyChange?.(false);
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
        venue={venue}
        onDirtyChange={handleDirty}
      />
    </div>
  );
}

function Draft({
  venue,
  onDirtyChange,
}: {
  venue: Venue;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const query = useServiceQuery(useCallback(async signal => {
    const [draft, allFields] = await Promise.all([
      contentService.draft(venue.id, signal),
      fieldsService.list(signal),
    ]);
    return { draft, fields: allFields.filter(f => f.venueId === venue.id) };
  }, [venue.id]));

  if (query.loading) return <Loading />;
  if (query.error || !query.data) return <ServiceErrorMessage error={query.error} retry={query.reload} />;
  return (
    <EditForm
      initial={query.data.draft}
      venue={venue}
      fields={query.data.fields}
      onDirtyChange={onDirtyChange}
    />
  );
}

function EditForm({
  initial,
  venue,
  fields,
  onDirtyChange,
}: {
  initial: Microsite;
  venue: Venue;
  fields: Field[];
  onDirtyChange: (dirty: boolean) => void;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [message, setMessage] = useState<'saved' | 'publicationSuccess' | 'unpublishSuccess' | null>(null);
  const [error, setError] = useState<unknown>();

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const isHeroImageInvalid = Boolean(draft.heroImage && !isSupportedImageUrl(draft.heroImage));
  const isLogoUrlInvalid = Boolean(draft.logoUrl && !isSupportedImageUrl(draft.logoUrl));

  const isTrapActiveRef = useRef(false);
  const isCleaningUpRef = useRef(false);
  const isConfirmedExitRef = useRef(false);
  const editorUrlRef = useRef<string>('');

  useEffect(() => {
    editorUrlRef.current = window.location.href;
  }, []);

  useEffect(() => {
    onDirtyChange(dirty);

    if (dirty && !isTrapActiveRef.current && !isConfirmedExitRef.current) {
      // Capture and preserve Next.js history state, adding trap flag
      const baseState = (typeof window !== 'undefined' && window.history.state) || {};
      window.history.pushState(
        { ...baseState, __cmsTrap: true },
        '',
        editorUrlRef.current || window.location.href
      );
      isTrapActiveRef.current = true;
    } else if (!dirty && isTrapActiveRef.current) {
      // Clean up the trap entry on save or discard so duplicate entries never accumulate
      isTrapActiveRef.current = false;
      cleanHistoryTrap();
    }
  }, [dirty, onDirtyChange]);

  // Protected navigation: beforeunload, client-side clicks, and browser back/forward
  useEffect(() => {
    // 1. Browser tab close / reload
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
      }
    };
    window.addEventListener('beforeunload', warn);

    // 2. Client-side navigation clicks (Next.js Links, dashboard management tabs, header links)
    const handleCaptureClick = async (event: MouseEvent) => {
      if (!dirty) return;
      const anchor = (event.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || anchor.target === '_blank') return;
      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);
        if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) {
          return;
        }
      } catch {
        // malformed URL
      }
      const confirmed = window.confirm(tRef.current('discardConfirm'));
      if (!confirmed) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const cleaned = await cleanHistoryTrap();
      if (!cleaned) {
        return;
      }
      isConfirmedExitRef.current = true;
      const targetUrl = new URL(anchor.href, window.location.href);
      if (targetUrl.origin === window.location.origin) {
        router.push(targetUrl.pathname + targetUrl.search + targetUrl.hash);
      } else {
        window.location.assign(anchor.href);
      }
    };
    document.addEventListener('click', handleCaptureClick, true);

    // 3. Browser Back / Forward buttons (popstate)
    const handlePopState = () => {
      if (isCleaningUpRef.current) {
        isCleaningUpRef.current = false;
        return;
      }
      if (isConfirmedExitRef.current) {
        return;
      }
      const handled = handleTrapPopState({
        isDirty: dirty,
        onRestoreTrap: () => {
          const baseState = (typeof window !== 'undefined' && window.history.state) || {};
          window.history.pushState(
            { ...baseState, __cmsTrap: true },
            '',
            editorUrlRef.current || window.location.href
          );
          isTrapActiveRef.current = true;
        },
      });
      if (handled) {
        return;
      }
      if (isTrapActiveRef.current) {
        const confirmed = window.confirm(tRef.current('discardConfirm'));
        if (!confirmed) {
          // Cancel: stay in editor and restore trap entry with preserved Next.js state
          const baseState = (typeof window !== 'undefined' && window.history.state) || {};
          window.history.pushState(
            { ...baseState, __cmsTrap: true },
            '',
            editorUrlRef.current || window.location.href
          );
        } else {
          // Confirm discard: the trap entry was already popped by this Back action.
          // Discard local edits so dirty becomes false, and continue to the preceding page!
          setDraft(saved);
          isTrapActiveRef.current = false;
          isConfirmedExitRef.current = true;
          window.history.back();
        }
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', warn);
      document.removeEventListener('click', handleCaptureClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [dirty, router, saved]);

  async function handleSave(publish = false) {
    if (isHeroImageInvalid || isLogoUrlInvalid) return;
    setBusy(true);
    setError(undefined);
    setMessage(null);
    try {
      const result = await contentService.save(draft);
      setDraft(result);
      setSaved(result);
      if (publish) {
        const pubResult = await contentService.publish(venue.id);
        setDraft(pubResult);
        setSaved(pubResult);
        setMessage('publicationSuccess');
      } else {
        setMessage('saved');
      }
    } catch (err) {
      // Failed saves preserve in-memory edits and dirty state!
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function handleUnpublish() {
    const confirmMsg = dirty ? t('unpublishConfirmDirty') : t('unpublishConfirm');
    if (!window.confirm(confirmMsg)) return;
    setBusy(true);
    setError(undefined);
    setMessage(null);
    try {
      const result = await contentService.unpublish(venue.id);
      setSaved(result);
      // Preserve local edits in draft while updating publication status
      setDraft(prev => ({
        ...prev,
        published: false,
        updatedAt: result.updatedAt,
      }));
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
          <Link href={`/s/${venue.slug}`} target="_blank" rel="noopener noreferrer" className="filter-pill text-xs">
            {t('viewSite')} ↗
          </Link>
        </div>
      </div>

      {mode === 'preview' ? (
        <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
          <VenueSite
            slug={venue.slug}
            previewVenue={venue}
            previewSite={draft}
            previewFields={fields}
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

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-label">
                  {t('heroImage')}
                  <input
                    className="form-input"
                    placeholder="/venues/... or https://images.unsplash.com/..."
                    value={draft.heroImage || ''}
                    aria-invalid={isHeroImageInvalid}
                    onChange={e => setDraft({ ...draft, heroImage: e.target.value || null })}
                  />
                  <span className="text-xs text-slate-500 font-normal">{t('heroImageHelp')}</span>
                  {isHeroImageInvalid && (
                    <p role="alert" className="text-xs text-rose-700 font-medium mt-1">
                      {t('heroImageError')}
                    </p>
                  )}
                </label>

                <label className="form-label">
                  {t('logoUrl')}
                  <input
                    className="form-input"
                    placeholder="/venues/logo.png or https://images.unsplash.com/..."
                    value={draft.logoUrl || ''}
                    aria-invalid={isLogoUrlInvalid}
                    onChange={e => setDraft({ ...draft, logoUrl: e.target.value || null })}
                  />
                  <span className="text-xs text-slate-500 font-normal">{t('logoUrlHelp')}</span>
                  {isLogoUrlInvalid && (
                    <p role="alert" className="text-xs text-rose-700 font-medium mt-1">
                      {t('logoUrlError')}
                    </p>
                  )}
                </label>
              </div>

              {/* Inquiry Contacts */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-label">
                  {t('contactPhone')}
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="+251 91 123 4567"
                    maxLength={30}
                    value={draft.contactPhone || ''}
                    onChange={e => setDraft({ ...draft, contactPhone: e.target.value || null })}
                  />
                </label>

                <label className="form-label">
                  {t('contactEmail')}
                  <input
                    className="form-input"
                    type="email"
                    placeholder="info@stadium.et"
                    maxLength={100}
                    value={draft.contactEmail || ''}
                    onChange={e => setDraft({ ...draft, contactEmail: e.target.value || null })}
                  />
                </label>
              </div>

              <SiteContentEditor draft={draft} onChange={setDraft} />

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
                <button className="action" disabled={busy || isHeroImageInvalid || isLogoUrlInvalid} type="submit">
                  {t('save')}
                </button>

                <button
                  className="min-h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 disabled:opacity-50 transition-colors"
                  disabled={busy || !draft.tagline.trim() || isHeroImageInvalid || isLogoUrlInvalid}
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
                <span>{t('gallery')}:</span>
                <span className="font-bold text-slate-800">{(draft.gallery || []).length}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('socialLinks')}:</span>
                <span className="font-bold text-slate-800">{(draft.socialLinks || []).length}</span>
              </div>
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
