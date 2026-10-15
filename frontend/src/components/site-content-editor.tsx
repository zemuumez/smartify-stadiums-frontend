'use client';
import type { Microsite, ParticipationFormat, SocialLink } from '@/services/contracts';
import { supportedSports, isSport } from '@/services/sports';
import { useLanguage } from '@/i18n/provider';
import { isSupportedImageUrl, isSupportedVideoUrl } from '@/services/media-policy';

const PLATFORMS: SocialLink['platform'][] = ['telegram', 'instagram', 'facebook', 'tiktok', 'youtube', 'website'];

export function SiteContentEditor({draft,onChange}:{draft:Microsite;onChange:(value:Microsite)=>void}) {
  const {t}=useLanguage();
  const highlights=draft.highlights||[];
  const events=draft.events||[];
  const gallery=draft.gallery||[];
  const socialLinks=draft.socialLinks||[];

  function moveHighlight(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= highlights.length) return;
    const next = [...highlights];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    onChange({ ...draft, highlights: next });
  }

  function moveEvent(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= events.length) return;
    const next = [...events];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    onChange({ ...draft, events: next });
  }

  function moveGallery(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= gallery.length) return;
    const next = [...gallery];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    onChange({ ...draft, gallery: next });
  }

  return (
    <div className="space-y-8">
      {/* ── PHOTO GALLERY SECTION ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('gallery')}</h2>
          <span className="text-xs text-slate-500 font-medium">({gallery.length}/30)</span>
        </div>
        {gallery.map((g, i) => {
          const isInvalid = g.url.trim() !== '' && !isSupportedImageUrl(g.url);
          return (
            <fieldset key={g.id} className="border rounded-2xl p-4 space-y-3 bg-white/50">
              <div className="flex items-center justify-between">
                <legend className="font-bold text-xs uppercase text-slate-500">#{i + 1} {t('gallery')}</legend>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={i === 0}
                    className="px-2 py-1 text-xs border rounded disabled:opacity-30 hover:bg-slate-100"
                    onClick={() => moveGallery(i, -1)}
                    aria-label={`${t('moveUp')} #${i + 1}`}
                  >
                    ↑ {t('moveUp')}
                  </button>
                  <button
                    type="button"
                    disabled={i === gallery.length - 1}
                    className="px-2 py-1 text-xs border rounded disabled:opacity-30 hover:bg-slate-100"
                    onClick={() => moveGallery(i, 1)}
                    aria-label={`${t('moveDown')} #${i + 1}`}
                  >
                    ↓ {t('moveDown')}
                  </button>
                </div>
              </div>
              <label className="form-label">
                URL
                <input
                  className="form-input"
                  required
                  placeholder="/venues/... or https://images.unsplash.com/..."
                  value={g.url}
                  aria-invalid={isInvalid}
                  onChange={e => onChange({ ...draft, gallery: gallery.map(x => x.id === g.id ? { ...x, url: e.target.value } : x) })}
                />
              </label>
              {isInvalid && (
                <p role="alert" className="text-xs text-rose-700 font-medium">
                  {t('heroImageError')}
                </p>
              )}
              <label className="form-label">
                {t('imageCaption')}
                <input
                  className="form-input"
                  maxLength={200}
                  placeholder="e.g. Floodlit pitch under evening lights"
                  value={g.caption || ''}
                  onChange={e => onChange({ ...draft, gallery: gallery.map(x => x.id === g.id ? { ...x, caption: e.target.value || undefined } : x) })}
                />
              </label>
              <button
                type="button"
                className="text-xs text-red-700 underline hover:text-red-900"
                onClick={() => onChange({ ...draft, gallery: gallery.filter(x => x.id !== g.id) })}
              >
                {t('removeItem')}
              </button>
            </fieldset>
          );
        })}
        <button
          className="filter-pill"
          type="button"
          onClick={() => onChange({ ...draft, gallery: [...gallery, { id: crypto.randomUUID(), url: '', caption: '' }] })}
        >
          + {t('addGalleryImage')}
        </button>
      </section>

      {/* ── SOCIAL LINKS SECTION ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('socialLinks')}</h2>
          <span className="text-xs text-slate-500 font-medium">({socialLinks.length}/10)</span>
        </div>
        {socialLinks.map((s, i) => {
          const isInvalid = s.url.trim() !== '' && !s.url.startsWith('https://');
          return (
            <fieldset key={i} className="border rounded-2xl p-4 space-y-3 bg-white/50">
              <div className="flex items-center justify-between">
                <legend className="font-bold text-xs uppercase text-slate-500">#{i + 1} {t('socialLinks')}</legend>
                <button
                  type="button"
                  className="text-xs text-red-700 underline hover:text-red-900"
                  onClick={() => onChange({ ...draft, socialLinks: socialLinks.filter((_, idx) => idx !== i) })}
                >
                  {t('removeItem')}
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="form-label">
                  {t('platform')}
                  <select
                    className="form-input capitalize"
                    value={s.platform}
                    onChange={e => onChange({
                      ...draft,
                      socialLinks: socialLinks.map((x, idx) => idx === i ? { ...x, platform: e.target.value as SocialLink['platform'] } : x)
                    })}
                  >
                    {PLATFORMS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </label>
                <label className="form-label">
                  URL
                  <input
                    className="form-input"
                    type="url"
                    placeholder="https://..."
                    value={s.url}
                    aria-invalid={isInvalid}
                    onChange={e => onChange({
                      ...draft,
                      socialLinks: socialLinks.map((x, idx) => idx === i ? { ...x, url: e.target.value } : x)
                    })}
                  />
                </label>
              </div>
              {isInvalid && (
                <p role="alert" className="text-xs text-rose-700 font-medium">
                  {t('mediaUrlError')}
                </p>
              )}
            </fieldset>
          );
        })}
        <button
          className="filter-pill"
          type="button"
          onClick={() => onChange({ ...draft, socialLinks: [...socialLinks, { platform: 'telegram', url: 'https://t.me/' }] })}
        >
          + {t('addSocialLink')}
        </button>
      </section>

      {/* ── HIGHLIGHTS SECTION ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">{t('matchHighlights')}</h2>
        {highlights.map((h, i) => {
          const isInvalidVideo = Boolean(h.playbackUrl && !isSupportedVideoUrl(h.playbackUrl));
          return (
            <fieldset key={h.id} className="border rounded-2xl p-4 space-y-3 bg-white/50">
              <div className="flex items-center justify-between">
                <legend className="font-bold text-xs uppercase text-slate-500">#{i + 1} {t('matchHighlights')}</legend>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={i === 0}
                    className="px-2 py-1 text-xs border rounded disabled:opacity-30 hover:bg-slate-100"
                    onClick={() => moveHighlight(i, -1)}
                    aria-label={`${t('moveUp')} #${i + 1}`}
                  >
                    ↑ {t('moveUp')}
                  </button>
                  <button
                    type="button"
                    disabled={i === highlights.length - 1}
                    className="px-2 py-1 text-xs border rounded disabled:opacity-30 hover:bg-slate-100"
                    onClick={() => moveHighlight(i, 1)}
                    aria-label={`${t('moveDown')} #${i + 1}`}
                  >
                    ↓ {t('moveDown')}
                  </button>
                </div>
              </div>
              <label className="form-label">{t('contentTitle')}<input className="form-input" required maxLength={200} value={h.title} onChange={e=>onChange({...draft,highlights:highlights.map(x=>x.id===h.id?{...x,title:e.target.value}:x)})}/></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="form-label">{t('teams')}<input className="form-input" maxLength={200} value={h.teams} onChange={e=>onChange({...draft,highlights:highlights.map(x=>x.id===h.id?{...x,teams:e.target.value}:x)})}/></label>
                <label className="form-label">{t('durationLabel')}<input className="form-input" maxLength={10} placeholder="e.g. 1:45" value={h.duration} onChange={e=>onChange({...draft,highlights:highlights.map(x=>x.id===h.id?{...x,duration:e.target.value}:x)})}/></label>
              </div>
              <label className="form-label">
                {t('videoUrl')}
                <input
                  className="form-input"
                  type="url"
                  placeholder="https://..."
                  aria-invalid={isInvalidVideo}
                  value={h.playbackUrl||''}
                  onChange={e=>onChange({...draft,highlights:highlights.map(x=>x.id===h.id?{...x,playbackUrl:e.target.value||null}:x)})}
                />
              </label>
              {isInvalidVideo && (
                <p role="alert" className="text-xs text-rose-700 font-medium">
                  {t('mediaUrlError')}
                </p>
              )}
              <button type="button" className="text-xs text-red-700 underline hover:text-red-900" onClick={()=>onChange({...draft,highlights:highlights.filter(x=>x.id!==h.id)})}>{t('removeItem')}</button>
            </fieldset>
          );
        })}
        <button type="button" className="filter-pill" onClick={()=>onChange({...draft,highlights:[...highlights,{id:crypto.randomUUID(),title:'',teams:'',duration:'',playbackUrl:null}]})}>{t('addHighlight')}</button>
      </section>

      {/* ── EVENTS SECTION ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">{t('upcomingEvents')}</h2>
        {events.map((e, i) => (
          <fieldset key={e.id} className="border rounded-2xl p-4 space-y-3 bg-white/50">
            <div className="flex items-center justify-between">
              <legend className="font-bold text-xs uppercase text-slate-500">#{i + 1} {t('upcomingEvents')}</legend>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-30 hover:bg-slate-100"
                  onClick={() => moveEvent(i, -1)}
                  aria-label={`${t('moveUp')} #${i + 1}`}
                >
                  ↑ {t('moveUp')}
                </button>
                <button
                  type="button"
                  disabled={i === events.length - 1}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-30 hover:bg-slate-100"
                  onClick={() => moveEvent(i, 1)}
                  aria-label={`${t('moveDown')} #${i + 1}`}
                >
                  ↓ {t('moveDown')}
                </button>
              </div>
            </div>
            <label className="form-label">{t('contentTitle')}<input className="form-input" required maxLength={200} value={e.title} onChange={ev=>onChange({...draft,events:events.map(x=>x.id===e.id?{...x,title:ev.target.value}:x)})}/></label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="form-label">
                {t('sport')}
                <select className="form-input" value={e.sport} onChange={ev => {
                  const sport = ev.target.value;
                  if (isSport(sport)) onChange({ ...draft, events: events.map(x => x.id === e.id ? { ...x, sport } : x) });
                }}>
                  {supportedSports.map(s => <option key={s} value={s}>{t(s)}</option>)}
                </select>
              </label>

              <label className="form-label">
                {t('participationFormat')}
                <select
                  className="form-input"
                  value={e.format || (['tennis', 'badminton'].includes(e.sport) ? 'singles' : 'team')}
                  onChange={ev => {
                    const format = ev.target.value as ParticipationFormat;
                    onChange({ ...draft, events: events.map(x => x.id === e.id ? { ...x, format } : x) });
                  }}
                >
                  <option value="team">{t('formatTeam')}</option>
                  <option value="singles">{t('formatSingles')}</option>
                  <option value="doubles">{t('formatDoubles')}</option>
                </select>
              </label>

              <label className="form-label">
                {e.format === 'doubles' ? t('capacityDoubles') : e.format === 'singles' ? t('capacitySingles') : t('capacityTeams')}
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  max={1000}
                  required
                  value={e.spots}
                  onChange={ev => onChange({ ...draft, events: events.map(x => x.id === e.id ? { ...x, spots: Number(ev.target.value) } : x) })}
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="form-label">{t('date')}<input className="form-input" type="date" required value={e.date} onChange={ev=>onChange({...draft,events:events.map(x=>x.id===e.id?{...x,date:ev.target.value}:x)})}/></label>
              <label className="form-label">{t('eventTime')}<input className="form-input" type="time" required value={e.time} onChange={ev=>onChange({...draft,events:events.map(x=>x.id===e.id?{...x,time:ev.target.value}:x)})}/></label>
            </div>
            <button type="button" className="text-xs text-red-700 underline hover:text-red-900" onClick={()=>onChange({...draft,events:events.filter(x=>x.id!==e.id)})}>{t('removeItem')}</button>
          </fieldset>
        ))}
        <button className="filter-pill" type="button" onClick={()=>onChange({...draft,events:[...events,{id:crypto.randomUUID(),title:'',sport:'football',format:'team',date:'',time:'10:00',spots:0}]})}>{t('addEvent')}</button>
      </section>
    </div>
  );
}
