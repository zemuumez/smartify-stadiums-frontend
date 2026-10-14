import { Suspense } from 'react';
import { VenueSite } from '@/components/venue-site';
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return <Suspense><VenueSite slug={slug} /></Suspense>; }
