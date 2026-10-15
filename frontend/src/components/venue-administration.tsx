'use client';
import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { venuesService } from '@/services';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { AccessGate } from './access-gate';
import { DemoNotice, Loading, ServiceErrorMessage } from './service-state';
import { BookingList } from './booking-list';
import { cleanHistoryTrap, MicrositeEditor } from './microsite-editor';
import { OwnerFields } from './owner-panels';
export function VenueAdministration({slug}:{slug:string}) {return <AccessGate roles={['owner','admin']}><Administration slug={slug}/></AccessGate>;}
function Administration({slug}:{slug:string}) {
  const {t}=useLanguage();const params=useSearchParams();const [tab,setTab]=useState<'bookings'|'fields'|'cms'>(params.get('tab')==='cms'?'cms':'bookings');
  const [cmsDirty, setCmsDirty] = useState(false);
  const query=useServiceQuery(useCallback(async signal=>{const venues=await venuesService.owned(signal);return venues.find(v=>v.slug===slug);},[slug]));
  if(query.loading)return <Loading/>;if(query.error)return <ServiceErrorMessage error={query.error} retry={query.reload}/>;if(!query.data)return <p className="p-10" role="alert">{t('forbidden')}</p>;

  async function handleTabChange(nextTab: 'bookings' | 'fields' | 'cms') {
    if (nextTab === tab) return;
    if (tab === 'cms' && cmsDirty) {
      const proceed = window.confirm(t('discardConfirm'));
      if (!proceed) return;
      await cleanHistoryTrap();
    }
    setCmsDirty(false);
    setTab(nextTab);
  }

  return (
    <main className="site-wrap py-8 pb-28">
      <DemoNotice/>
      <header className="flex flex-wrap justify-between items-center gap-4 my-6">
        <div>
          <p className="site-eyebrow">{t('venueAdmin')}</p>
          <h1 className="text-3xl font-black">{query.data.name}</h1>
        </div>
        <Link href={`/s/${slug}`} className="site-button">{t('viewSite')}</Link>
      </header>
      <nav className="flex gap-3 flex-wrap mb-8" aria-label={t('menu')}>
        {(['bookings','fields','cms'] as const).map(id=>(
          <button
            className={`filter-pill ${tab===id?'selected':''}`}
            aria-pressed={tab===id}
            key={id}
            onClick={()=>handleTabChange(id)}
          >
            {t(id==='cms'?'microsite':id)}
          </button>
        ))}
      </nav>
      {tab==='cms'?<MicrositeEditor venueId={query.data.id} onDirtyChange={setCmsDirty}/>:tab==='fields'?<OwnerFields venueId={query.data.id}/>:<BookingList owner venueId={query.data.id}/>}
    </main>
  );
}
