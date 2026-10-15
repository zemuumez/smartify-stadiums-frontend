import { Suspense } from 'react';
import { VenueAdministration } from '@/components/venue-administration';
export default async function Page({params}:{params:Promise<{slug:string}>}) {const {slug}=await params;return <Suspense><VenueAdministration slug={slug}/></Suspense>;}
