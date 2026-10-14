import { TeamDirectory } from '@/components/team-panels';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <TeamDirectory id={id} />; }
