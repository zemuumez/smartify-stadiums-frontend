'use client';
import { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { venuesService } from '@/services';
import { supportedSports, venueToday } from '@/services/sports';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { DemoNotice, Empty, Loading, ServiceErrorMessage } from './service-state';
export function Marketplace() {
  const { t } = useLanguage(); const params = useSearchParams();
  const query = useServiceQuery(useCallback(signal => venuesService.list(signal), []));
  const text = (params.get('q') || '').trim().toLowerCase(); const sport = params.get('sport') || '';
  const results = query.data?.filter(venue => (!text || `${venue.name} ${venue.city}`.toLowerCase().includes(text)) && (!sport || venue.sports.some(item => item === sport))) || [];
  const context = new URLSearchParams(); if (sport) context.set('sport', sport); if (params.get('date')) context.set('date', params.get('date')!);
  return <main className="mx-auto max-w-6xl px-4 pb-28 pt-28 sm:px-8"><DemoNotice /><header className="mb-8"><p className="font-semibold text-green-800">ET Smart Fields</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">{t('discoverTitle')}</h1><p className="mt-4 text-slate-600">{t('discoverDescription')}</p></header>
    <form action="/stadiums" className="panel mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="form-label">{t('search')}<input name="q" defaultValue={params.get('q') || ''} placeholder={t('searchHint')} className="form-input" /></label>
      <label className="form-label">{t('sport')}<select name="sport" defaultValue={sport} className="form-input"><option value="">{t('allSports')}</option>{supportedSports.map(sport => <option key={sport} value={sport}>{t(sport)}</option>)}</select></label>
      <label className="form-label">{t('date')}<input type="date" name="date" defaultValue={params.get('date') || venueToday()} min={venueToday()} className="form-input" /></label>
      <button className="action self-end" type="submit">{t('search')}</button>
    </form>
    {query.loading ? <Loading /> : query.error ? <ServiceErrorMessage error={query.error} retry={query.reload} /> : !results.length ? <Empty /> : <div className="grid gap-6 md:grid-cols-2">{results.map(venue => <article key={venue.id} className="overflow-hidden rounded-3xl border border-green-900/10 bg-white shadow-sm"><div className="relative h-56"><Image fill sizes="(max-width: 768px) 100vw, 50vw" src={venue.image} alt={venue.name} className="object-cover" /></div><div className="p-6"><p className="text-sm text-green-800">{venue.city}</p><h2 className="mt-1 text-2xl font-bold">{venue.name}</h2><p className="my-3 text-slate-600">{venue.description}</p><div className="mb-5 flex flex-wrap gap-2">{venue.sports.map(sport => <span key={sport} className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-900">{t(sport)}</span>)}</div><Link className="action" href={`/s/${venue.slug}?${context}`}>{t('viewVenue')}</Link></div></article>)}</div>}
  </main>;
}
