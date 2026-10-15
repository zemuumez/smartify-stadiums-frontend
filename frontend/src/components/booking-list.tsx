'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { bookingsService, venuesService } from '@/services';
import type { Booking, Closure, Field, Sport, Venue } from '@/services/contracts';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import {
  computeCourtQuote,
  getWeekDays,
  hourLabel,
  isValidDate,
  matchesBookingCriteria,
  resolveTargetCourt,
  shiftDays,
  venueToday,
} from '@/services/sports';
import { AccessGate } from './access-gate';
import { DemoNotice, Empty, Loading, ServiceErrorMessage } from './service-state';

function isFutureBooking(b: Booking): boolean {
  return Date.parse(`${b.date}T${String(b.startHour).padStart(2, '0')}:00:00+03:00`) > Date.now();
}

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

export function BookingList({ owner = false, bookingId, venueId }: { owner?: boolean; bookingId?: string; venueId?: string }) {
  return <AccessGate roles={owner ? ['owner', 'admin'] : ['player']}><BookingRecords owner={owner} venueId={venueId} bookingId={bookingId} /></AccessGate>;
}

function BookingRecords({ owner, bookingId, venueId }: { owner: boolean; bookingId?: string; venueId?: string }) {
  const { t, date: displayDate } = useLanguage();
  const [date, setDate] = useState(venueToday());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedVenueId, setSelectedVenueId] = useState(venueId || '');
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();

  const query = useServiceQuery(useCallback(async signal => {
    const [bookings, venues] = await Promise.all([
      bookingsService.list(signal),
      owner ? venuesService.owned(signal) : venuesService.list(signal),
    ]);
    const activeVenues = venues.filter(v => v.status === 'active' && (!venueId || v.id === venueId));
    const [fields, closures] = await Promise.all([
      Promise.all(activeVenues.map(v => venuesService.fields(v.id, signal))).then(res => res.flat()),
      owner ? Promise.all(activeVenues.map(v => bookingsService.closures(v.id))).then(res => res.flat()) : Promise.resolve([] as Closure[]),
    ]);
    return { bookings, venues, fields, closures };
  }, [owner, venueId]));

  const activeOwnedVenues = query.data?.venues.filter(v => v.status === 'active' && (!venueId || v.id === venueId)) || [];
  const effectiveVenueId = owner ? (venueId || selectedVenueId || (activeOwnedVenues[0]?.id ?? '')) : (venueId || '');
  const availableFields = query.data?.fields.filter(f => !effectiveVenueId || f.venueId === effectiveVenueId) || [];
  const effectiveDate = isValidDate(date) ? date : venueToday();
  const weekDays = getWeekDays(effectiveDate);

  const records = (query.data?.bookings || [])
    .filter(b => matchesBookingCriteria(b, {
      owner,
      bookingId,
      effectiveVenueId,
      selectedFieldId,
      viewMode,
      weekDays,
      date,
    }))
    .sort((a, b) => `${a.date}${hourLabel(a.startHour)}`.localeCompare(`${b.date}${hourLabel(b.startHour)}`));

  const venueClosures = (query.data?.closures || [])
    .filter(c => (!effectiveVenueId || query.data?.fields.some(f => f.id === c.fieldId && f.venueId === effectiveVenueId)) && (!selectedFieldId || c.fieldId === selectedFieldId) && (viewMode === 'week' ? weekDays.includes(c.date) : (!date || c.date === date)))
    .sort((a, b) => `${a.date}${hourLabel(a.startHour)}`.localeCompare(`${b.date}${hourLabel(b.startHour)}`));

  return (
    <div className="space-y-6">
      <DemoNotice />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{t(owner ? 'ownerBookings' : 'bookings')}</h1>
        <div className="flex flex-wrap items-center gap-3">
          {owner && (
            <button type="button" className="action" onClick={() => setShowWalkInModal(true)}>
              {t('walkInReservation')}
            </button>
          )}
          <Link href="/stadiums" className="min-h-11 inline-flex items-center rounded-xl border border-slate-300 px-4 font-semibold hover:bg-slate-50">
            {t('book')}
          </Link>
        </div>
      </div>

      {owner && (
        <section aria-label={t('ownerBookings')} className="panel space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('menu')}>
              <button
                type="button"
                className={`filter-pill ${viewMode === 'day' ? 'selected' : ''}`}
                aria-pressed={viewMode === 'day'}
                onClick={() => setViewMode('day')}
              >
                {t('dayView')}
              </button>
              <button
                type="button"
                className={`filter-pill ${viewMode === 'week' ? 'selected' : ''}`}
                aria-pressed={viewMode === 'week'}
                onClick={() => setViewMode('week')}
              >
                {t('weekView')}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold hover:bg-slate-50"
                onClick={() => setDate(viewMode === 'week' ? shiftDays(date, -7) : shiftDays(date, -1))}
                aria-label={t('prevWeek')}
              >
                ←
              </button>
              <button
                type="button"
                className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold hover:bg-slate-50"
                onClick={() => setDate(venueToday())}
              >
                {t('today')}
              </button>
              <button
                type="button"
                className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold hover:bg-slate-50"
                onClick={() => setDate(viewMode === 'week' ? shiftDays(date, 7) : shiftDays(date, 1))}
                aria-label={t('nextWeek')}
              >
                →
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!venueId && activeOwnedVenues.length > 1 && (
              <label className="form-label">
                {t('chooseVenue')}
                <select
                  className="form-input"
                  value={effectiveVenueId}
                  onChange={e => {
                    setSelectedVenueId(e.target.value);
                    setSelectedFieldId('');
                  }}
                >
                  {activeOwnedVenues.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="form-label">
              {t('field')}
              <select
                className="form-input"
                value={selectedFieldId}
                onChange={e => setSelectedFieldId(e.target.value)}
              >
                <option value="">{t('allCourts')}</option>
                {availableFields.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              {t('date')}
              <input
                className="form-input"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </label>
          </div>

          {viewMode === 'week' && (
            <p className="text-sm font-medium text-slate-600">
              {displayDate(weekDays[0])} – {displayDate(weekDays[6])}
            </p>
          )}
        </section>
      )}

      {error ? <ServiceErrorMessage error={error} /> : null}

      {query.loading ? (
        <Loading />
      ) : query.error ? (
        <ServiceErrorMessage error={query.error} retry={query.reload} />
      ) : (
        <div className="space-y-6">
          {owner && venueClosures.length > 0 && viewMode === 'day' && (
            <section aria-label={t('scheduledClosures')} className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-amber-900">{t('scheduledClosures')}</h2>
              <div className="grid gap-2">
                {venueClosures.map(closure => (
                  <div key={closure.id} className="flex flex-wrap items-center justify-between gap-2 text-sm text-amber-950">
                    <span className="font-semibold">
                      {query.data?.fields.find(f => f.id === closure.fieldId)?.name || closure.fieldId} · {hourLabel(closure.startHour)}–{hourLabel(closure.endHour)}
                    </span>
                    <span className="italic">{closure.reason}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {owner && viewMode === 'week' ? (
            <div className="grid gap-4">
              {weekDays.map(dayStr => {
                const dayBookings = records.filter(b => b.date === dayStr);
                const dayClosures = venueClosures.filter(c => c.date === dayStr);
                const isCurrentToday = dayStr === venueToday();
                return (
                  <div key={dayStr} className={`panel p-4 space-y-3 ${isCurrentToday ? 'border-2 border-emerald-600 bg-emerald-50/20' : ''}`}>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h2 className="font-bold text-slate-800">
                        {displayDate(dayStr)}
                        {isCurrentToday ? ` (${t('today')})` : ''}
                      </h2>
                      <span className="text-xs text-slate-500 font-medium">
                        {dayBookings.length} {t('booking')}
                      </span>
                    </div>

                    {dayClosures.map(closure => (
                      <div key={closure.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
                        <span className="font-bold">{t('maintenance')}:</span> {query.data?.fields.find(f => f.id === closure.fieldId)?.name} ({hourLabel(closure.startHour)}–{hourLabel(closure.endHour)}) — {closure.reason}
                      </div>
                    ))}

                    {!dayBookings.length && !dayClosures.length ? (
                      <p className="text-xs text-slate-400 py-1">{t('empty')}</p>
                    ) : (
                      <div className="grid gap-3">
                        {dayBookings.map(booking => (
                          <BookingCard
                            key={booking.id}
                            booking={booking}
                            owner={owner}
                            queryData={query.data}
                            confirmId={confirmId}
                            busy={busy}
                            setConfirmId={setConfirmId}
                            setBusy={setBusy}
                            setError={setError}
                            onCancelSuccess={() => query.reload()}
                            onRescheduleClick={b => setRescheduleBooking(b)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : !records.length ? (
            <Empty />
          ) : (
            <div className="grid gap-4">
              {records.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  owner={owner}
                  queryData={query.data}
                  confirmId={confirmId}
                  busy={busy}
                  setConfirmId={setConfirmId}
                  setBusy={setBusy}
                  setError={setError}
                  onCancelSuccess={() => query.reload()}
                  onRescheduleClick={b => setRescheduleBooking(b)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {owner && query.data && availableFields.length > 0 && (
        <ClosureForm key={effectiveVenueId} fields={availableFields} onSaved={query.reload} />
      )}

      {showWalkInModal && (
        <WalkInModal
          venues={activeOwnedVenues}
          fields={query.data?.fields || []}
          initialVenueId={effectiveVenueId}
          initialDate={date}
          onClose={() => setShowWalkInModal(false)}
          onSaved={query.reload}
        />
      )}

      {rescheduleBooking && (
        <RescheduleModal
          booking={rescheduleBooking}
          field={query.data?.fields.find(f => f.id === rescheduleBooking.fieldId)}
          venueName={query.data?.venues.find(v => v.id === rescheduleBooking.venueId)?.name}
          onClose={() => setRescheduleBooking(null)}
          onRescheduled={query.reload}
        />
      )}
    </div>
  );
}

function BookingCard({
  booking,
  owner,
  queryData,
  confirmId,
  busy,
  setConfirmId,
  setBusy,
  setError,
  onCancelSuccess,
  onRescheduleClick,
}: {
  booking: Booking;
  owner: boolean;
  queryData: { bookings: Booking[]; venues: Venue[]; fields: Field[]; closures: Closure[] } | undefined;
  confirmId: string | null;
  busy: boolean;
  setConfirmId: (id: string | null) => void;
  setBusy: (busy: boolean) => void;
  setError: (err: unknown) => void;
  onCancelSuccess: () => void;
  onRescheduleClick: (booking: Booking) => void;
}) {
  const { t, money, date: displayDate } = useLanguage();
  const fieldName = queryData?.fields.find(f => f.id === booking.fieldId)?.name || booking.fieldId;
  const venueName = queryData?.venues.find(v => v.id === booking.venueId)?.name || booking.venueId;
  const canModify = booking.status === 'confirmed' && booking.paymentStatus === 'unpaid' && isFutureBooking(booking);

  return (
    <article className="panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`${owner ? '/dashboard' : ''}/bookings/${booking.id}`} className="text-lg font-bold hover:underline">
            {fieldName}
          </Link>
          <p className="text-sm text-slate-600">{venueName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {booking.source === 'walk_in' ? (
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-900">
              {t('walkIn')}
            </span>
          ) : (
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-900">
              {t('online')}
            </span>
          )}
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              booking.status === 'confirmed'
                ? 'bg-emerald-100 text-emerald-900'
                : booking.status === 'cancelled'
                ? 'bg-rose-100 text-rose-900'
                : 'bg-slate-100 text-slate-800'
            }`}
          >
            {t(booking.status)}
          </span>
        </div>
      </div>

      {booking.source === 'walk_in' && booking.guestName && (
        <p className="mt-2 text-sm font-medium text-slate-700">
          {t('guest')}: {booking.guestName}
          {booking.guestPhone ? ` · ${booking.guestPhone}` : ''}
        </p>
      )}

      <p className="mt-3 text-slate-800">
        {displayDate(booking.date)} · {hourLabel(booking.startHour)}–{hourLabel(booking.endHour)} · {t(booking.sport)}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-700">
        <span>{money(booking.totalMinor)}</span>
        <span>·</span>
        <span>
          {t('payment')}:{' '}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              booking.paymentStatus === 'paid'
                ? 'bg-emerald-100 text-emerald-900'
                : booking.paymentStatus === 'unpaid'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-slate-100 text-slate-800'
            }`}
          >
            {t(booking.paymentStatus)}
          </span>
        </span>
      </div>

      {booking.originalSchedule && (
        <p className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-900">
          {t('rescheduledFrom')} {displayDate(booking.originalSchedule.date)} · {hourLabel(booking.originalSchedule.startHour)}–{hourLabel(booking.originalSchedule.endHour)}
        </p>
      )}

      <p className="mt-3 break-all text-xs text-slate-500">
        {t('bookingReference')}: {booking.id}
      </p>

      {canModify && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {confirmId === booking.id ? (
            <div className="w-full rounded-xl border border-amber-200 bg-amber-50/50 p-3">
              <p className="text-sm text-amber-900">{t('confirmCancel')}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy}
                  className="action"
                  onClick={async () => {
                    setBusy(true);
                    setError(undefined);
                    try {
                      await bookingsService.cancel(booking.id);
                      setConfirmId(null);
                      onCancelSuccess();
                    } catch (err) {
                      setError(err);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {t('confirm')}
                </button>
                <button
                  type="button"
                  className="min-h-11 px-4 underline text-sm"
                  disabled={busy}
                  onClick={() => setConfirmId(null)}
                >
                  {t('back')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="action"
                onClick={() => onRescheduleClick(booking)}
              >
                {t('reschedule')}
              </button>
              <button
                type="button"
                className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50"
                onClick={() => setConfirmId(booking.id)}
              >
                {t('cancelBooking')}
              </button>
            </>
          )}
        </div>
      )}
    </article>
  );
}

function RescheduleModal({
  booking,
  field,
  venueName,
  onClose,
  onRescheduled,
}: {
  booking: Booking;
  field?: Field;
  venueName?: string;
  onClose: () => void;
  onRescheduled: () => void;
}) {
  const modalRef = useModalKeyboard(true, onClose);
  const { t, money } = useLanguage();
  const [date, setDate] = useState(booking.date >= venueToday() ? booking.date : venueToday());
  const [startHour, setStartHour] = useState(booking.startHour);
  const [endHour, setEndHour] = useState(booking.endHour);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [success, setSuccess] = useState(false);
  const idempotencyKey = useRef(crypto.randomUUID());

  const slotsQuery = useServiceQuery(
    useCallback(signal => bookingsService.availability(booking.fieldId, date, signal), [booking.fieldId, date])
  );

  const openHour = field?.openHour ?? 0;
  const closeHour = field?.closeHour ?? 24;
  const quote = computeCourtQuote(field, startHour, endHour);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (quote === null || !field) return;
    setBusy(true);
    setError(undefined);
    try {
      await bookingsService.reschedule(booking.id, {
        date,
        startHour,
        endHour,
        idempotencyKey: idempotencyKey.current,
      });
      setSuccess(true);
      onRescheduled();
      setTimeout(onClose, 800);
    } catch (err) {
      setError(err);
      slotsQuery.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-title"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={modalRef} tabIndex={-1} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto outline-none">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h2 id="reschedule-title" className="text-xl font-bold text-slate-900">
              {t('rescheduleBooking')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {field?.name || booking.fieldId} · {venueName}
            </p>
          </div>
          <button
            type="button"
            className="min-h-11 rounded-full p-2 text-slate-400 hover:text-slate-700"
            onClick={onClose}
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-slate-600">{t('rescheduleHelp')}</p>

        {error ? <ServiceErrorMessage error={error} /> : null}
        {success && <p role="status" className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm font-semibold text-emerald-900">{t('rescheduleSuccess')}</p>}

        <form onSubmit={submit} className="space-y-4">
          <fieldset disabled={busy || success} className="space-y-4">
            <label className="form-label">
              {t('date')}
              <input
                required
                type="date"
                min={venueToday()}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="form-input"
              />
            </label>

            {slotsQuery.loading ? (
              <Loading />
            ) : slotsQuery.error ? (
              <ServiceErrorMessage error={slotsQuery.error} retry={slotsQuery.reload} />
            ) : slotsQuery.data ? (
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase text-slate-500">{t('selectSlot')}</span>
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 max-h-36 overflow-y-auto p-1 border border-slate-200 rounded-xl">
                  {slotsQuery.data.map(slot => {
                    const isCurrentSlot = date === booking.date && slot.startHour >= booking.startHour && slot.endHour <= booking.endHour;
                    const isAvailable = slot.available || isCurrentSlot;
                    const isSelected = slot.startHour >= startHour && slot.endHour <= endHour;
                    return (
                      <button
                        type="button"
                        key={slot.startHour}
                        disabled={!isAvailable}
                        onClick={() => {
                          setStartHour(slot.startHour);
                          setEndHour(slot.startHour + 1);
                        }}
                        className={`min-h-11 rounded-lg text-xs font-semibold p-1 transition ${
                          isSelected
                            ? 'bg-emerald-700 text-white'
                            : isAvailable
                            ? 'bg-slate-100 hover:bg-emerald-100 text-slate-800'
                            : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                        }`}
                      >
                        {hourLabel(slot.startHour)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <label className="form-label">
                {t('from')}
                <input
                  required
                  className="form-input"
                  type="number"
                  min={openHour}
                  max={closeHour - 1}
                  value={startHour}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setStartHour(val);
                    if (endHour <= val) setEndHour(val + 1);
                  }}
                />
              </label>

              <label className="form-label">
                {t('to')}
                <input
                  required
                  className="form-input"
                  type="number"
                  min={startHour + 1}
                  max={closeHour}
                  value={endHour}
                  onChange={e => setEndHour(Number(e.target.value))}
                />
              </label>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">{t('total')}:</span>
              <span className="text-base font-bold text-emerald-800">
                {quote !== null ? money(quote) : '—'}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button disabled={busy || success || endHour <= startHour || quote === null || !field} className="action flex-1" type="submit">
                {t('confirmReschedule')}
              </button>
              <button type="button" className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50" onClick={onClose}>
                {t('cancel')}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

function WalkInModal({
  venues,
  fields,
  initialVenueId,
  initialDate,
  onClose,
  onSaved,
}: {
  venues: Venue[];
  fields: Field[];
  initialVenueId: string;
  initialDate: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const modalRef = useModalKeyboard(true, onClose);
  const { t, money } = useLanguage();
  const [venueId, setVenueId] = useState(initialVenueId || venues[0]?.id || '');
  const venueFields = fields.filter(f => f.venueId === venueId && f.active);
  const [fieldId, setFieldId] = useState(venueFields[0]?.id || '');
  const currentField = venueFields.find(f => f.id === fieldId) || venueFields[0];
  const supportedSports = currentField?.sports || [];
  const [sport, setSport] = useState<Sport>(supportedSports[0] || 'football');
  const [date, setDate] = useState(initialDate >= venueToday() ? initialDate : venueToday());
  const [startHour, setStartHour] = useState(currentField?.openHour || 8);
  const [endHour, setEndHour] = useState((currentField?.openHour || 8) + 1);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const idempotencyKey = useRef(crypto.randomUUID());

  const quote = computeCourtQuote(currentField, startHour, endHour);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!guestName.trim() || !currentField || quote === null) return;
    setBusy(true);
    setError(undefined);
    try {
      await bookingsService.createWalkIn({
        venueId,
        fieldId: currentField.id,
        sport,
        date,
        startHour,
        endHour,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim() || undefined,
        idempotencyKey: idempotencyKey.current,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkin-title"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={modalRef} tabIndex={-1} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto outline-none">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
          <h2 id="walkin-title" className="text-xl font-bold text-slate-900">
            {t('walkInReservation')}
          </h2>
          <button
            type="button"
            className="min-h-11 rounded-full p-2 text-slate-400 hover:text-slate-700"
            onClick={onClose}
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        {error ? <ServiceErrorMessage error={error} /> : null}

        <form onSubmit={submit} className="space-y-4">
          <fieldset disabled={busy} className="space-y-4">
            {venues.length > 1 && (
              <label className="form-label">
                {t('chooseVenue')}
                <select
                  required
                  className="form-input"
                  value={venueId}
                  onChange={e => {
                    const newVenueId = e.target.value;
                    setVenueId(newVenueId);
                    const newFields = fields.filter(f => f.venueId === newVenueId && f.active);
                    if (newFields[0]) {
                      setFieldId(newFields[0].id);
                      setSport(newFields[0].sports[0] || 'football');
                    }
                  }}
                >
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="form-label">
              {t('field')}
              <select
                required
                className="form-input"
                value={fieldId || currentField?.id}
                onChange={e => {
                  const id = e.target.value;
                  setFieldId(id);
                  const f = venueFields.find(item => item.id === id);
                  if (f && f.sports[0]) setSport(f.sports[0]);
                }}
              >
                {venueFields.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              {t('sport')}
              <select
                required
                className="form-input"
                value={sport}
                onChange={e => setSport(e.target.value as Sport)}
              >
                {supportedSports.map(s => (
                  <option key={s} value={s}>
                    {t(s)}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              {t('date')}
              <input
                required
                type="date"
                min={venueToday()}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="form-input"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="form-label">
                {t('from')}
                <input
                  required
                  className="form-input"
                  type="number"
                  min={currentField?.openHour || 0}
                  max={(currentField?.closeHour || 24) - 1}
                  value={startHour}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setStartHour(val);
                    if (endHour <= val) setEndHour(val + 1);
                  }}
                />
              </label>

              <label className="form-label">
                {t('to')}
                <input
                  required
                  className="form-input"
                  type="number"
                  min={startHour + 1}
                  max={currentField?.closeHour || 24}
                  value={endHour}
                  onChange={e => setEndHour(Number(e.target.value))}
                />
              </label>
            </div>

            <label className="form-label">
              {t('guestName')}
              <input
                required
                maxLength={100}
                className="form-input"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="e.g. Dawit Kebede"
              />
            </label>

            <label className="form-label">
              {t('guestPhone')}
              <input
                type="tel"
                maxLength={30}
                className="form-input"
                value={guestPhone}
                onChange={e => setGuestPhone(e.target.value)}
                placeholder="+251 9..."
              />
            </label>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">{t('total')}:</span>
              <span className="text-base font-bold text-emerald-800">
                {quote !== null ? money(quote) : '—'}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button disabled={busy || !guestName.trim() || !venueFields.length || quote === null} className="action flex-1" type="submit">
                {t('saveWalkIn')}
              </button>
              <button type="button" className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50" onClick={onClose}>
                {t('cancel')}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

function ClosureForm({ fields, onSaved }: { fields: Field[]; onSaved: () => void }) {
  const { t } = useLanguage();
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [date, setDate] = useState(venueToday());
  const [start, setStart] = useState(8);
  const [end, setEnd] = useState(9);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [saved, setSaved] = useState(false);

  const targetFieldId = resolveTargetCourt(fields, selectedFieldId);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!targetFieldId) return;
    setBusy(true);
    setSaved(false);
    setError(undefined);
    try {
      await bookingsService.close({ fieldId: targetFieldId, date, startHour: start, endHour: end, reason });
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel space-y-4" onSubmit={submit}>
      <h2 className="text-xl font-bold">{t('closure')}</h2>
      {error ? <ServiceErrorMessage error={error} /> : null}
      {saved && <p role="status">{t('closureSaved')}</p>}
      <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
        <label className="form-label">
          {t('field')}
          <select required value={targetFieldId} onChange={e => setSelectedFieldId(e.target.value)} className="form-input">
            {fields.map(field => (
              <option key={field.id} value={field.id}>
                {field.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          {t('date')}
          <input required type="date" min={venueToday()} value={date} onChange={e => setDate(e.target.value)} className="form-input" />
        </label>
        <label className="form-label">
          {t('from')}
          <input required className="form-input" type="number" min={0} max={23} value={start} onChange={e => setStart(Number(e.target.value))} />
        </label>
        <label className="form-label">
          {t('to')}
          <input required className="form-input" type="number" min={start + 1} max={24} value={end} onChange={e => setEnd(Number(e.target.value))} />
        </label>
        <label className="form-label sm:col-span-2">
          {t('reason')}
          <input required maxLength={200} value={reason} onChange={e => setReason(e.target.value)} className="form-input" />
        </label>
        <button disabled={busy || !fields.length} className="action" type="submit">
          {t('createClosure')}
        </button>
      </fieldset>
    </form>
  );
}

