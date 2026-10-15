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
import type { Field, Microsite, SiteHighlight, Venue } from '@/services/contracts';
import { isSupportedImageUrl } from '@/services/media-policy';
export function VenueSite({
  slug,
  previewSite,
  previewVenue,
  previewFields,
  isDraftPreview,
  onExitPreview,
}: {
  slug: string;
  previewSite?: Microsite;
  previewVenue?: Venue;
  previewFields?: Field[];
  isDraftPreview?: boolean;
  onExitPreview?: () => void;
}) {
  const copy = useOriginalCopy();
  const { t, date, locale } = useLanguage(); const params = useSearchParams();
  const [selected, setSelected] = useState<Field | null>(null); const [dismissed, setDismissed] = useState(false);
  const [preview, setPreview] = useState<SiteHighlight | null>(null);
  const query = useServiceQuery(useCallback(async signal => {
    const venue = previewVenue || await venuesService.get(slug, signal);
    const fields = previewFields !== undefined ? previewFields : await venuesService.fields(venue.id, signal);
    const site = previewSite || await contentService.get(venue.id, signal);
    return { venue, fields, site };
  }, [slug, previewVenue, previewFields, previewSite]));
  if (query.loading) return <Loading/>;
  if (query.error || !query.data) {
    const isNotFound = (query.error as { code?: string })?.code === 'not_found' || (query.error as { status?: number })?.status === 404;
    if (isNotFound) {
      return (
        <main className="bg-[#f4f3ef] min-h-[70vh] flex items-center justify-center p-6 text-[#111]">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-sm border border-black/5 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#f0faf4] text-[#2d6a4f] flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <h1 className="text-2xl font-black">{t('unpublishedNotice')}</h1>
            <p className="text-sm text-slate-600">{copy("Pitches & Courts")}</p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/stadiums" className="action">
                {t('browseDirectory')}
              </Link>
              <Link href={`/s/${slug}/manage`} className="filter-pill text-center">
                {t('manageThisVenue')}
              </Link>
            </div>
          </div>
        </main>
      );
    }
    return <div className="p-8"><ServiceErrorMessage error={query.error} retry={query.reload}/><Link href="/stadiums" className="action mt-4">{t('venues')}</Link></div>;
  }
  const { venue, fields: rawFields, site } = query.data;
  const brandColor = site.primaryColor || '#2d6a4f';
  const heroImageSrc = (site.heroImage && isSupportedImageUrl(site.heroImage)) ? site.heroImage : venue.image;
  const logoImageSrc = (site.logoUrl && isSupportedImageUrl(site.logoUrl)) ? site.logoUrl : null;
  const fields = rawFields.map(f => ({ ...f, sport: f.sports.map(s => t(s)).join(' / '), price: (f.hourlyRateMinor / 100).toLocaleString(locale === 'am' ? 'am-ET' : 'en-ET') }));
  const matchHighlights = (site.highlights || []).map(h => ({...h, dur: h.duration, views: h.views || 0}));
  const events = (site.events || []).map(e => ({...e, sport: t(e.sport), date: date(e.date)}));
  const headingLead = site.tagline.split(' ').slice(0,2).join(' '); const headingAccent = site.tagline.split(' ').slice(2).join(' ');
  const handleOpenBooking = (field?: Field) => { if(field) setSelected(field); };
  const bookingField = selected || (!dismissed && params.get('book') === '1' ? rawFields.find(f=>f.id===params.get('field')) || rawFields[0] : null);
  return <main className="bg-[#f4f3ef] text-[#111]">
  {isDraftPreview && (
    <div className="bg-amber-900 text-amber-100 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="font-bold uppercase tracking-wider bg-amber-800 text-amber-200 px-2 py-0.5 rounded text-[10px]">
          {t('previewMode')}
        </span>
        <span>{t('previewDraftHelp')}</span>
        <span className="ml-2 font-medium bg-black/20 px-2 py-0.5 rounded">
          {site.published ? t('statusPublished') : t('statusUnpublished')}
        </span>
      </div>
      {onExitPreview && (
        <button
          type="button"
          onClick={onExitPreview}
          className="bg-white text-amber-950 font-bold px-3 py-1 rounded-full hover:bg-amber-100 transition-colors"
        >
          {t('exitPreview')}
        </button>
      )}
    </div>
  )}
  {site.announcement && (
    <div style={{ backgroundColor: brandColor }} className="text-white px-4 py-2 text-center text-xs font-semibold">
      📣 {site.announcement}
    </div>
  )}
  <DemoMarker/>
    <header className="site-header"><div className="site-wrap flex flex-wrap justify-between items-center gap-4 py-4"><Link className="flex items-center gap-3" href={`/s/${slug}`}><span className="site-logo overflow-hidden relative flex items-center justify-center">{logoImageSrc ? <Image src={logoImageSrc} alt={`${venue.name} logo`} width={32} height={32} className="object-cover w-full h-full rounded-full" /> : <Building2 size={23}/>}</span><span><strong className="block">{venue.name} {venue.verified && <span className="ml-1 rounded-full px-2 py-0.5 align-middle text-[9px] uppercase" style={{ backgroundColor: `${brandColor}18`, color: brandColor }}>{copy("Verified")}</span>}</strong><small className="text-slate-500">{t('poweredBy')}</small></span></Link><nav className="flex flex-wrap gap-5 text-sm"><a href="#fields">{copy("Pitches & Courts")}</a><a href="#highlights">{t('matchReplays')}</a><a href="#contact">{t('locationContact')}</a></nav><div className="flex gap-2"><Link className="filter-pill" href={`/auth/login?returnTo=${encodeURIComponent(`/s/${slug}?book=1`)}`}>{t('signIn')}</Link><button className="site-button" style={{ background: brandColor }} disabled={!rawFields.length} onClick={()=>setSelected(rawFields[0])}><Calendar size={14}/>{t('bookPitch')}</button></div></div></header>
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImageSrc}
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
              {venue.verified && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm" style={{ background: brandColor }}>
                <Shield size={12} />{copy("ULS Certified Facility")}</span>}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20">
                <Star size={12} className="text-amber-400 fill-amber-400" /> {venue.rating ?? "—"} {t("ratingLabel")} ({venue.reviewCount} {t("reviews")})
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20">
                <MapPin size={12} style={{ color: brandColor }} /> {venue.city}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-4">
              {headingLead} <br />
              <span style={{ color: brandColor }}>{headingAccent}</span>
            </h1>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-8 max-w-xl font-medium">
              {site.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOpenBooking(fields[0])}
                className="flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-sm shadow-xl hover:opacity-90 transition-all"
                style={{ background: brandColor }}
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
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: brandColor }}>{copy("Field Selection")}</div>
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
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${brandColor}18`, color: brandColor }}>
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
                    <CheckCircle2 size={13} style={{ color: brandColor }} />{copy("Surface:")}{" "}{f.surface}
                  </div>
                  {f.lighting && (
                    <div className="flex items-center gap-2">
                      <Lightbulb size={13} className="text-amber-600" />{copy("Night Game Floodlights")}</div>
                  )}
                  {f.camera && (
                    <div className="flex items-center gap-2">
                      <Camera size={13} style={{ color: brandColor }} />{copy("4K AI Camera Recording")}</div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenBooking(f)}
                className="w-full mt-6 py-3 rounded-full text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                style={{ background: brandColor }}
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
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: brandColor }}>{copy("Autonomous 4K Broadcasting")}</div>
              <h2 className="text-3xl font-black text-[#111] tracking-tight">{copy("Recent Match Highlights & Goals")}</h2>
            </div>
            <button
              onClick={() => setPreview(matchHighlights[0] || null)}
              className="text-xs font-bold hover:underline flex items-center gap-1"
              style={{ color: brandColor }}
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
                  <div className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform" style={{ background: brandColor }}>
                    <Play size={20} className="ml-0.5" />
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[10px] font-bold">
                    {m.dur}
                  </span>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-[9px] font-bold uppercase tracking-wider" style={{ background: brandColor }}>{copy("4K Replay")}</span>
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
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: brandColor }}>{copy("Community Leagues")}</div>
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
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColor}18`, color: brandColor }}>
                  <Trophy size={20} />
                </div>
                <div className="text-xs font-bold uppercase mb-1" style={{ color: brandColor }}>{ev.sport}</div>
                <h3 className="font-black text-base text-[#111] mb-2">{ev.title}</h3>
                <div className="text-xs text-[#7a7a7a] mb-6">
                  📅 {ev.date} • ⏰ {ev.time} • 👥 {ev.spots}{" "}{copy("team spots open")}</div>
              </div>

              <button
                type="button"
                onClick={() => { window.location.href = `tel:${site.contactPhone || venue.phone}`; }}
                className="w-full py-2.5 rounded-full text-xs font-bold border transition-all text-center hover:opacity-90"
                style={{ borderColor: brandColor, color: brandColor, backgroundColor: `${brandColor}0d` }}
              >{copy("Register Team")}</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION: FACILITY GALLERY ── */}
      {site.gallery && site.gallery.length > 0 && (
        <section id="gallery" className="py-20 max-w-[1420px] mx-auto px-4 sm:px-8 lg:px-12 border-t border-black/[0.06]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: brandColor }}>{t('gallery')}</div>
              <h2 className="text-3xl font-black text-[#111] tracking-tight">{t('facilityGallery')}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {site.gallery.filter(g => isSupportedImageUrl(g.url)).map(img => (
              <div key={img.id} className="group relative aspect-video rounded-3xl overflow-hidden bg-black/10 shadow-sm border border-black/5">
                <Image src={img.url} alt={img.caption || venue.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white text-xs font-medium">
                    {img.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER: LOCATION, CONTACT & SOCIAL ── */}
      <footer id="contact" className="bg-white py-12 border-t border-black/[0.06]">
        <div className="site-wrap flex flex-wrap justify-between gap-8">
          <div className="max-w-md">
            <h2 className="font-bold text-xl">{venue.name}</h2>
            <p className="my-2 text-slate-600 text-sm">{venue.address}</p>
            <div className="space-y-1 text-sm mt-3">
              <div>
                <span className="text-slate-500 font-medium">{t('phone')}: </span>
                <a href={`tel:${site.contactPhone || venue.phone}`} className="underline font-bold">
                  {site.contactPhone || venue.phone}
                </a>
              </div>
              {site.contactEmail && (
                <div>
                  <span className="text-slate-500 font-medium">{t('email')}: </span>
                  <a href={`mailto:${site.contactEmail}`} className="underline font-bold">
                    {site.contactEmail}
                  </a>
                </div>
              )}
            </div>
            {site.socialLinks && site.socialLinks.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {site.socialLinks.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-black transition-colors"
                  >
                    <span className="capitalize">{s.platform}</span> ↗
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <Link href={`/s/${slug}/manage`} className="site-button" style={{ background: brandColor }}>
              {t('venueAdmin')}
            </Link>
            <Link href="/stadiums" className="underline text-sm">
              {copy("ET Smart Fields ·")}{" "}{t('venues')}
            </Link>
          </div>
        </div>
      </footer>
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
