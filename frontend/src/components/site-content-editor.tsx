'use client';
import type { Microsite } from '@/services/contracts';
import { supportedSports, isSport } from '@/services/sports';
import { useLanguage } from '@/i18n/provider';
export function SiteContentEditor({draft,onChange}:{draft:Microsite;onChange:(value:Microsite)=>void}) {
  const {t}=useLanguage(); const highlights=draft.highlights||[];const events=draft.events||[];

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

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-bold">{t('matchHighlights')}</h2>
        {highlights.map((h, i) => (
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
            <label className="form-label">{t('videoUrl')}<input className="form-input" type="url" placeholder="https://..." pattern="https://.*" value={h.playbackUrl||''} onChange={e=>onChange({...draft,highlights:highlights.map(x=>x.id===h.id?{...x,playbackUrl:e.target.value||null}:x)})}/></label>
            <button type="button" className="text-xs text-red-700 underline hover:text-red-900" onClick={()=>onChange({...draft,highlights:highlights.filter(x=>x.id!==h.id)})}>{t('removeItem')}</button>
          </fieldset>
        ))}
        <button type="button" className="filter-pill" onClick={()=>onChange({...draft,highlights:[...highlights,{id:crypto.randomUUID(),title:'',teams:'',duration:'',playbackUrl:null}]})}>{t('addHighlight')}</button>
      </section>

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
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="form-label">{t('sport')}<select className="form-input" value={e.sport} onChange={ev=>{const sport=ev.target.value;if(isSport(sport))onChange({...draft,events:events.map(x=>x.id===e.id?{...x,sport}:x)});}}>{supportedSports.map(s=><option key={s} value={s}>{t(s)}</option>)}</select></label>
              <label className="form-label">{t('teamSpots')}<input className="form-input" type="number" min={0} max={1000} required value={e.spots} onChange={ev=>onChange({...draft,events:events.map(x=>x.id===e.id?{...x,spots:Number(ev.target.value)}:x)})}/></label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="form-label">{t('date')}<input className="form-input" type="date" required value={e.date} onChange={ev=>onChange({...draft,events:events.map(x=>x.id===e.id?{...x,date:ev.target.value}:x)})}/></label>
              <label className="form-label">{t('eventTime')}<input className="form-input" type="time" required value={e.time} onChange={ev=>onChange({...draft,events:events.map(x=>x.id===e.id?{...x,time:ev.target.value}:x)})}/></label>
            </div>
            <button type="button" className="text-xs text-red-700 underline hover:text-red-900" onClick={()=>onChange({...draft,events:events.filter(x=>x.id!==e.id)})}>{t('removeItem')}</button>
          </fieldset>
        ))}
        <button className="filter-pill" type="button" onClick={()=>onChange({...draft,events:[...events,{id:crypto.randomUUID(),title:'',sport:'football',date:'',time:'10:00',spots:0}]})}>{t('addEvent')}</button>
      </section>
    </div>
  );
}
