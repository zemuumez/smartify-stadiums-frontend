'use client';

import { useCallback, useEffect, useRef } from 'react';
import { mediaService } from '@/services';
import type { ReplayPlayback } from '@/services/contracts';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
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

export function ReplayModal({
  bookingId,
  onClose,
}: {
  bookingId: string;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const modalRef = useModalKeyboard(true, onClose);

  const query = useServiceQuery(
    useCallback(signal => mediaService.bookingReplay(bookingId, signal), [bookingId]),
    ['booking-replay', bookingId]
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="replay-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-3xl my-8 rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 id="replay-modal-title" className="text-2xl font-black text-slate-900">
              {t('matchReplay')}
            </h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
              4K Broadcast
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('closePlayer')}
            className="min-h-11 min-w-11 rounded-full text-slate-400 hover:text-slate-700 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {query.loading ? (
          <div className="py-16 text-center">
            <Loading />
          </div>
        ) : query.error ? (
          <div className="p-6">
            <ServiceErrorMessage error={query.error} retry={query.reload} />
          </div>
        ) : query.data ? (
          <ReplayContent playback={query.data} onClose={onClose} />
        ) : null}
      </div>
    </div>
  );
}

function ReplayContent({
  playback,
  onClose,
}: {
  playback: ReplayPlayback;
  onClose: () => void;
}) {
  const { t } = useLanguage();

  if (playback.canPlay && playback.playbackUrl) {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl bg-black shadow-lg">
          <video
            controls
            playsInline
            className="w-full aspect-video object-contain"
            src={playback.playbackUrl}
            poster={playback.thumbnailUrl}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{playback.title}</h3>
            <p className="text-sm text-slate-500">
              {playback.date} · {playback.durationLabel} · {t(playback.sport)}
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
            {t('recReady')}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">{t('replayProvenance')}</p>
        </div>

        <div className="flex justify-end pt-3">
          <button type="button" onClick={onClose} className="action">
            {t('closePlayer')}
          </button>
        </div>
      </div>
    );
  }

  // Not playable states: processing, failed, forbidden, expired, or unavailable
  return (
    <div className="py-12 px-4 text-center space-y-4">
      <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-slate-100 text-2xl">
        {playback.entitlementStatus === 'processing'
          ? '⚙'
          : playback.entitlementStatus === 'forbidden'
          ? '🔒'
          : playback.entitlementStatus === 'expired'
          ? '⌛'
          : '⚠️'}
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-900">
          {playback.entitlementStatus === 'processing'
            ? t('replayProcessing')
            : playback.entitlementStatus === 'forbidden'
            ? t('replayForbidden')
            : playback.entitlementStatus === 'expired'
            ? t('replayExpired')
            : playback.entitlementStatus === 'failed'
            ? t('replayFailed')
            : t('replayUnavailable')}
        </h3>
        {playback.reason && (
          <p className="text-sm text-slate-500 max-w-md mx-auto">{playback.reason}</p>
        )}
      </div>

      <div className="pt-4 flex justify-center">
        <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-slate-300 px-6 font-semibold hover:bg-slate-50">
          {t('closePlayer')}
        </button>
      </div>
    </div>
  );
}
