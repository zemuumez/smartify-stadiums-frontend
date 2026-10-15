'use client';
import { useOriginalCopy } from '@/i18n/original-copy';
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Building2, Calendar, Shield, MapPin, Star, Camera, Lightbulb, CheckCircle2, Play, Trophy, X, ArrowUpRight } from 'lucide-react';
import { contentService, venuesService } from '@/services';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { DemoMarker, Loading, ServiceErrorMessage } from './service-state';
import { Reservation } from './booking-form';
import type { Field, SiteHighlight } from '@/services/contracts';
export function VenueSite({ slug }: { slug: string }) {
  const copy = useOriginalCopy();
  const { t, date, locale } = useLanguage(); const params = useSearchParams();
  const [selected, setSelected] = useState<Field | null>(null); const [dismissed, setDismissed] = useState(false);
  const [preview, setPreview] = useState<SiteHighlight | null>(null);
  const query = useServiceQuery(useCallback(async signal => { const venue = await venuesService.get(slug, signal); const [fields, site] = await Promise.all([venuesService.fields(venue.id, signal), contentService.get(venue.id, signal)]); return { venue, fields, site }; }, [slug]));
  if (query.loading) return <Loading/>;
  if (query.error || !query.data) return <div className="p-8"><ServiceErrorMessage error={query.error} retry={query.reload}/><Link href="/stadiums" className="action mt-4">{t('venues')}</Link></div>;
  const { venue, fields: rawFields, site } = query.data;
  const fields = rawFields.map(f => ({ ...f, sport: f.sports.map(s => t(s)).join(' / '), price: (f.hourlyRateMinor / 100).toLocaleString(locale === 'am' ? 'am-ET' : 'en-ET') }));
  const matchHighlights = (site.highlights || []).map(h => ({...h, dur: h.duration, views: h.views || 0}));
  const events = (site.events || []).map(e => ({...e, sport: t(e.sport), date: date(e.date)}));
  const headingLead = site.tagline.split(' ').slice(0,2).join(' '); const headingAccent = site.tagline.split(' ').slice(2).join(' ');
  const handleOpenBooking = (field?: Field) => { if(field) setSelected(field); };
  const bookingField = selected || (!dismissed && params.get('book') === '1' ? rawFields.find(f=>f.id===params.get('field')) || rawFields[0] : null);
  return <main className="bg-[#f4f3ef] text-[#111]">
  <DemoMarker/>
    <header className="site-header"><div className="site-wrap flex flex-wrap justify-between items-center gap-4 py-4"><Link className="flex items-center gap-3" href={`/s/${slug}`}><span className="site-logo"><Building2 size={23}/></span><span><strong className="block">{venue.name} {venue.verified && <span className="ml-1 rounded-full bg-[#f0faf4] px-2 py-0.5 align-middle text-[9px] uppercase text-[#2d6a4f]">{copy("Verified")}</span>}</strong><small className="text-slate-500">{t('poweredBy')}</small></span></Link><nav className="flex flex-wrap gap-5 text-sm"><a href="#fields">{copy("Pitches & Courts")}</a><a href="#highlights">{t('matchReplays')}</a><a href="#contact">{t('locationContact')}</a></nav><div className="flex gap-2"><Link className="filter-pill" href={`/auth/login?returnTo=${encodeURIComponent(`/s/${slug}?book=1`)}`}>{t('signIn')}</Link><button className="site-button" disabled={!rawFields.length} onClick={()=>setSelected(rawFields[0])}><Calendar size={14}/>{t('bookPitch')}</button></div></div></header>
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={venue.image}
            alt={venue.name}
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1420px] mx-auto px-4 sm:px-8 lg:px-12 py-20 w-full text-white">
          <div className="max-w-2xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {venue.verified && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#2d6a4f] text-white shadow-sm">
                <Shield size={12} />{copy("ULS Certified Facility")}</span>}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20">
                <Star size={12} className="text-amber-400 fill-amber-400" /> {venue.rating ?? "—"} {t("ratingLabel")} ({venue.reviewCount} {t("reviews")})
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20">
                <MapPin size={12} className="text-[#74c69d]" /> {venue.city}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-4">
              {headingLead} <br />
              <span className="text-[#74c69d]">{headingAccent}</span>
            </h1>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-8 max-w-xl font-medium">
              {site.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOpenBooking(fields[0])}
                className="flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-sm shadow-xl hover:opacity-90 transition-all"
                style={{ background: "#2d6a4f" }}
              >
                <Calendar size={16} />{copy("Reserve a Pitch")}</button>

              <a
                href="#fields"
                className="px-6 py-4 rounded-full text-white font-bold text-sm bg-white/15 backdrop-blur-md border border-white/25 hover:bg-white/25 transition-all"
              >
                {t("exploreAll")} {fields.length} {t("pitchesLabel")} ↗
              </a>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 mt-12 border-t border-white/15">
              <div>
                <div className="text-3xl font-black text-white">{venue.publicStats?.bookings.toLocaleString() ?? "—"}</div>
                <div className="text-xs text-white/70 font-semibold mt-0.5">{copy("Total Bookings")}</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#74c69d]">{fields.length} {t("pitchesLabel")}</div>
                <div className="text-xs text-white/70 font-semibold mt-0.5">{copy("Multi-Sport Courts")}</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white">{venue.publicStats?.players.toLocaleString() ?? "—"}{venue.publicStats ? '+' : ''}</div>
                <div className="text-xs text-white/70 font-semibold mt-0.5">{copy("Active Players")}</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#74c69d]">{venue.publicStats?.stream || "—"}</div>
                <div className="text-xs text-white/70 font-semibold mt-0.5">{copy("Autonomous Stream")}</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION: AVAILABLE PITCHES & COURTS ── */}
      <section id="fields" className="py-20 max-w-[1420px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">{copy("Field Selection")}</div>
            <h2 className="text-3xl font-black text-[#111] tracking-tight">{copy("Operational Pitches & Courts")}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#7a7a7a] max-w-md">{copy("All fields include free access to locker rooms, fresh water stations, and automated match recording.")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fields.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-black/[0.05] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f0faf4] text-[#2d6a4f]">
                    {f.sport}
                  </span>
                  <span className="text-xs font-bold text-[#7a7a7a]">{f.size}</span>
                </div>

                <h3 className="text-base font-black text-[#111] mb-2">{f.name}</h3>
                <div className="text-2xl font-black text-[#111] mb-4">
                  {f.price}{" "}{copy("ETB")}{" "}<span className="text-xs font-normal text-[#7a7a7a]">{copy("/ hour")}</span>
                </div>

                <div className="space-y-2 pb-6 border-b border-black/[0.06] text-xs text-[#5a5a5a]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-[#2d6a4f]" />{copy("Surface:")}{" "}{f.surface}
                  </div>
                  {f.lighting && (
                    <div className="flex items-center gap-2">
                      <Lightbulb size={13} className="text-amber-600" />{copy("Night Game Floodlights")}</div>
                  )}
                  {f.camera && (
                    <div className="flex items-center gap-2">
                      <Camera size={13} className="text-[#2d6a4f]" />{copy("4K AI Camera Recording")}</div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenBooking(f)}
                className="w-full mt-6 py-3 rounded-full text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                style={{ background: "#2d6a4f" }}
              >
                <Calendar size={14} />{copy("Book This Pitch")}</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION: AI MATCH REPLAY HIGHLIGHTS ── */}
      <section id="highlights" className="py-20 bg-white border-y border-black/[0.06]">
        <div className="max-w-[1420px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">{copy("Autonomous 4K Broadcasting")}</div>
              <h2 className="text-3xl font-black text-[#111] tracking-tight">{copy("Recent Match Highlights & Goals")}</h2>
            </div>
            <button
              onClick={() => setPreview(matchHighlights[0] || null)}
              className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-1"
            >{copy("Sign In to View Your Match Video")}<ArrowUpRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matchHighlights.map((m) => (
              <div
                key={m.id}
                role="button" tabIndex={0} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setPreview(m); } }}
                className="bg-[#f4f3ef] rounded-3xl p-6 border border-black/[0.05] hover:bg-[#eae8e1] transition-colors group cursor-pointer"
                onClick={() => {
                  setPreview(m);
                }}
              >
                <div className="relative aspect-video rounded-2xl bg-black/10 overflow-hidden mb-4 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={20} className="ml-0.5" />
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[10px] font-bold">
                    {m.dur}
                  </span>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#2d6a4f] text-white text-[9px] font-bold uppercase tracking-wider">{copy("4K Replay")}</span>
                </div>

                <h3 className="font-black text-sm text-[#111] mb-1">{m.title}</h3>
                <div className="text-xs text-[#7a7a7a] flex items-center justify-between">
                  <span>{m.teams}</span>
                  <span>{m.views}{" "}{copy("views")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION: TOURNAMENTS & EVENTS ── */}
      <section id="events" className="py-20 max-w-[1420px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">{copy("Community Leagues")}</div>
            <h2 className="text-3xl font-black text-[#111] tracking-tight">{copy("Upcoming Tournaments & Events")}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#7a7a7a]">{copy("Register your team or corporate group for organized weekend cups.")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-3xl p-7 shadow-sm border border-black/[0.05] flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#f0faf4] text-[#2d6a4f] mb-4">
                  <Trophy size={20} />
                </div>
                <div className="text-xs font-bold text-[#2d6a4f] uppercase mb-1">{ev.sport}</div>
                <h3 className="font-black text-base text-[#111] mb-2">{ev.title}</h3>
                <div className="text-xs text-[#7a7a7a] mb-6">
                  📅 {ev.date} • ⏰ {ev.time} • 👥 {ev.spots}{" "}{copy("team spots open")}</div>
              </div>

              <button
                type="button"
                onClick={() => { window.location.href = `tel:${venue.phone}`; }}
                className="w-full py-2.5 rounded-full text-xs font-bold bg-[#f0faf4] text-[#2d6a4f] hover:bg-[#2d6a4f] hover:text-white transition-all text-center"
              >{copy("Register Team")}</button>
            </div>
          ))}
        </div>
      </section>

    <footer id="contact" className="bg-white py-10"><div className="site-wrap flex flex-wrap justify-between gap-6"><div><h2 className="font-bold text-xl">{venue.name}</h2><p className="my-3">{venue.address}</p><a href={`tel:${venue.phone}`} className="underline">{venue.phone}</a></div><div className="flex flex-col gap-4"><Link href={`/s/${slug}/manage`} className="site-button">{t('venueAdmin')}</Link><Link href="/stadiums" className="underline">{copy("ET Smart Fields ·")}{" "}{t('venues')}</Link></div></div></footer>
    {bookingField && <BookingDialog field={bookingField} fields={rawFields} slug={slug} onClose={()=>{setSelected(null);setDismissed(true);}}/>}
    {preview && <HighlightDialog highlight={preview} onClose={()=>setPreview(null)}/>}
  </main>;
}
function BookingDialog({field,fields,slug,onClose}:{field:Field;fields:Field[];slug:string;onClose:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null); const {t}=useLanguage();
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null; const dialog=ref.current; dialog?.showModal(); const overflow=document.body.style.overflow;document.body.style.overflow='hidden'; return()=>{dialog?.close(); document.body.style.overflow=overflow;previous?.focus();};},[]);
  return <dialog ref={ref} className="booking-dialog" onCancel={onClose} aria-labelledby="booking-dialog-title"><div className="flex justify-between items-center gap-4 mb-5"><h2 id="booking-dialog-title" className="font-black text-2xl">{t('bookPitch')}</h2><button className="min-h-11 min-w-11 flex items-center justify-center" aria-label={t('closeDialog')} onClick={onClose}><X/></button></div><Reservation key={field.id} fields={fields} initialFieldId={field.id} returnTo={`/s/${slug}?book=1&field=${field.id}`}/></dialog>;
}

function HighlightDialog({highlight,onClose}:{highlight:SiteHighlight;onClose:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null); const {t}=useLanguage();
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;ref.current?.showModal();return()=>previous?.focus();},[]);
  return <dialog ref={ref} className="booking-dialog" onCancel={onClose} aria-labelledby="highlight-title"><div className="flex justify-between gap-4"><h2 id="highlight-title" className="text-xl font-bold">{highlight.title}</h2><button className="min-h-11 min-w-11" onClick={onClose} aria-label={t('closePreview')}><X/></button></div>{highlight.playbackUrl?.startsWith('https://')?<video controls className="w-full mt-5" src={highlight.playbackUrl}/>:<p className="py-8">{t('previewOnly')}</p>}</dialog>;
}
