'use client';
import { useCallback, useState } from 'react';
import type { FinancialAnalytics, Sport, Venue } from '@/services/contracts';
import type { OwnerAnalyticsParams } from '@/services/billing.service';
import { supportedSports } from '@/services/sports';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { Loading, ServiceErrorMessage } from './service-state';

export function AnalyticsDashboard({
  title,
  venues,
  fetchAnalytics,
  isAdmin = false,
}: {
  title: string;
  venues: Venue[];
  fetchAnalytics: (params: OwnerAnalyticsParams, signal?: AbortSignal) => Promise<FinancialAnalytics>;
  isAdmin?: boolean;
}) {
  const { t, money } = useLanguage();
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [metricDateType, setMetricDateType] = useState<'booking_date' | 'transaction_date'>('booking_date');

  const queryParams: OwnerAnalyticsParams = {
    venueId: selectedVenueId || undefined,
    sport: (selectedSport as Sport) || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    metricDateType,
  };

  const queryKey = JSON.stringify(queryParams);

  const query = useServiceQuery(
    useCallback(signal => fetchAnalytics({
      venueId: selectedVenueId || undefined,
      sport: (selectedSport as Sport) || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      metricDateType,
    }, signal), [
      selectedVenueId,
      selectedSport,
      dateFrom,
      dateTo,
      metricDateType,
      fetchAnalytics,
    ]),
    queryKey
  );

  const data = query.data;
  const isZeroActivity =
    data &&
    data.totalBookingsCount === 0 &&
    data.recordedCollectionsMinor === 0 &&
    data.completedRefundsMinor === 0 &&
    data.grossBookingValueMinor === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isAdmin ? t('adminAnalyticsTitle') : t('ownerAnalyticsTitle')}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <section aria-label="Filters" className="panel p-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {venues.length > 0 && (
            <label className="form-label">
              {t('venue')}
              <select
                className="form-input"
                value={selectedVenueId}
                onChange={e => setSelectedVenueId(e.target.value)}
              >
                <option value="">{t('allVenues')}</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="form-label">
            {t('sport')}
            <select
              className="form-input"
              value={selectedSport}
              onChange={e => setSelectedSport(e.target.value)}
            >
              <option value="">{t('allSports')}</option>
              {supportedSports.map(s => (
                <option key={s} value={s}>
                  {t(s)}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            {t('dateFrom')}
            <input
              type="date"
              className="form-input"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
          </label>

          <label className="form-label">
            {t('dateTo')}
            <input
              type="date"
              className="form-input"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </label>

          <label className="form-label">
            {t('metricDateType')}
            <select
              className="form-input"
              value={metricDateType}
              onChange={e => setMetricDateType(e.target.value as 'booking_date' | 'transaction_date')}
            >
              <option value="booking_date">{t('bookingDate')}</option>
              <option value="transaction_date">{t('transactionDate')}</option>
            </select>
          </label>
        </div>

        {(selectedVenueId || selectedSport || dateFrom || dateTo || metricDateType !== 'booking_date') && (
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
              onClick={() => {
                setSelectedVenueId('');
                setSelectedSport('');
                setDateFrom('');
                setDateTo('');
                setMetricDateType('booking_date');
              }}
            >
              {t('cancel')}
            </button>
          </div>
        )}
      </section>

      {/* Date & Timezone Methodology Disclaimer */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-950 space-y-1">
        <p className="font-semibold">ℹ️ {t('metricDateType')}</p>
        <p>{t('timezoneNotice')}</p>
      </div>

      {query.loading ? (
        <Loading />
      ) : query.error ? (
        <ServiceErrorMessage error={query.error} retry={query.reload} />
      ) : !data || isZeroActivity ? (
        <div className="panel p-8 text-center space-y-2">
          <p className="text-base font-semibold text-slate-700">{t('zeroActivity')}</p>
          <p className="text-xs text-slate-500">
            {t('timezoneNotice')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Financial KPI Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="panel">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {t('grossBookingValue')}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {money(data.grossBookingValueMinor)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {data.totalBookingsCount} {t('booking')} ({data.completedBookingsCount} {t('completedBookings')})
              </p>
            </article>

            <article className="panel">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                {t('collected')}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                {money(data.recordedCollectionsMinor)}
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                {t('netRevenue')}: {money(data.netRevenueMinor)}
              </p>
            </article>

            <article className="panel">
              <p className="text-xs font-bold uppercase tracking-wide text-rose-700">
                {t('totalRefunds')}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-rose-700">
                {money(data.completedRefundsMinor)}
              </p>
              <p className="mt-1 text-xs text-rose-600">
                {data.cancelledBookingsCount} {t('cancelledBookings')}
              </p>
            </article>

            <article className="panel">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                {t('outstanding')}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-amber-700">
                {money(data.outstandingBalanceMinor)}
              </p>
              <p className="mt-1 text-xs text-amber-600">
                {t('bookingDate')}
              </p>
            </article>
          </div>

          {/* Provisional Commercial Commission Card */}
          <article className="panel space-y-2 border-l-4 border-l-amber-500">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                {t('bookingCommission')}
              </h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                {t('not_configured')}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {t('provisionalCommissionNotice')}
            </p>
          </article>

          {/* Sport Breakdown */}
          {data.sportBreakdown && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800">{t('sportBreakdownTitle')}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(data.sportBreakdown).map(([sportKey, sData]) => (
                  <div key={sportKey} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-900">{t(sportKey as Sport)}</span>
                      <span className="text-xs font-semibold text-slate-500">
                        {sData.bookings} {t('booking')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">{t('bookingValue')}</span>
                        <span className="font-bold text-slate-900">{money(sData.grossMinor)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">{t('collected')}</span>
                        <span className="font-bold text-emerald-700">{money(sData.collectedMinor)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
