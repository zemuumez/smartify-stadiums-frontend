import { BookingList } from '@/components/booking-list';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <main className="mx-auto max-w-5xl px-4 pb-28 pt-28"><BookingList bookingId={id} /></main>; }
