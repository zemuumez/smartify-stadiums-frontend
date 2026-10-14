'use client';
import { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { contentService, venuesService } from '@/services';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { hourLabel } from '@/services/sports';
import { DemoNotice, Loading, ServiceErrorMessage } from './service-state';
export function VenueSite({ slug }: { slug: string }) {
  const { t, money } = useLanguage(); const params = useSearchParams();
  const query = useServiceQuery(useCallback(async signal => {
    const venue = await venuesService.get(slug, signal);
    const [fields, site] = await Promise.all([venuesService.fields(venue.id, signal), contentService.get(venue.id, signal)]);
    return { venue, fields, site };
  }, [slug]));
  if (query.loading) return <Loading />;
  if (query.error || !query.data) return <div className="p-8"><ServiceErrorMessage error={query.error} retry={query.reload} /><Link href="/stadiums" className="action mt-4">{t('venues')}</Link></div>;
  const { venue, fields, site } = query.data;
  return <main className="min-h-screen pb-28"><header className="border-b bg-white p-4"><nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3"><Link href="/stadiums" className="font-bold text-green-900">ET Smart Fields</Link><span className="font-semibold">{venue.name}</span><Link className="min-h-11 rounded-xl border px-4 py-3" href="/bookings">{t('bookings')}</Link></nav></header><div className="mx-auto max-w-6xl px-4 py-6 sm:px-8"><DemoNotice /></div>
    <section className="relative isolate overflow-hidden bg-green-950 px-4 py-20 text-white sm:py-28"><Image src={venue.image} fill priority sizes="100vw" alt={venue.name} className="object-cover opacity-25" /><div className="relative mx-auto max-w-6xl"><p className="text-green-100">{venue.city} {venue.verified ? `• ${t('verified')}` : ''}</p><h1 className="mt-3 max-w-3xl text-4xl font-black sm:text-6xl">{site.tagline}</h1><p className="mt-5 max-w-2xl text-lg">{site.description}</p><a href="#fields" className="action mt-8 border border-white/40">{t('book')}</a></div></section>
    <section id="fields" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-12 sm:px-8"><h2 className="mb-6 text-3xl font-bold">{t('fields')}</h2><div className="grid gap-5 md:grid-cols-2">{fields.map(field => {
      const context = new URLSearchParams({ venue: venue.slug, field: field.id }); const selectedSport = params.get('sport');
      if (selectedSport && field.sports.some(item => item === selectedSport)) context.set('sport', selectedSport);
      if (params.get('date')) context.set('date', params.get('date')!);
      return <article key={field.id} className="panel"><h3 className="text-xl font-bold">{field.name}</h3><p className="my-3 text-green-800">{field.sports.map(sport => t(sport)).join(' · ')}</p><p>{field.surface}</p><p className="mt-2">{t('open')}: {hourLabel(field.openHour)}–{hourLabel(field.closeHour)}</p><p className="my-5 text-lg font-bold">{money(field.hourlyRateMinor)} <span className="text-sm font-normal">/ {t('perHour')}</span></p><Link className="action" href={`/bookings/new?${context}`}>{t('book')}</Link></article>;
    })}</div></section><section className="mx-auto max-w-6xl px-4 sm:px-8"><div className="panel"><h2 className="text-xl font-bold">{t('contact')}</h2><p className="mt-3">{venue.address}</p><a href={`tel:${venue.phone}`} className="mt-3 inline-block min-h-11 underline">{venue.phone}</a><p className="mt-3 text-sm text-slate-600">{t('privacyNotice')}</p></div></section>
  </main>;
}
