'use client';
import { useCallback, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { teamsService } from '@/services';
import { supportedSports, isSport } from '@/services/sports';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { AccessGate } from './access-gate';
import { DemoNotice, Empty, Loading, ServiceErrorMessage } from './service-state';
export function TeamDirectory({ id }: { id?: string }) {
  const { t } = useLanguage(); const [sport, setSport] = useState('');
  const query = useServiceQuery(useCallback(async () => id ? [await teamsService.get(id)] : teamsService.list(), [id]));
  const teams = query.data?.filter(team => !sport || team.sport === sport) || [];
  return <main className="mx-auto max-w-5xl px-4 pb-28 pt-28"><DemoNotice /><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-bold">{t('teams')}</h1><Link href="/teams/create" className="action">{t('createTeam')}</Link></div><label className="form-label mb-5">{t('sport')}<select className="form-input" value={sport} onChange={e => setSport(e.target.value)}><option value="">{t('allSports')}</option>{supportedSports.map(s => <option key={s} value={s}>{t(s)}</option>)}</select></label>{query.loading ? <Loading /> : query.error ? <ServiceErrorMessage error={query.error} retry={query.reload} /> : !teams.length ? <Empty /> : <div className="grid gap-4 sm:grid-cols-2">{teams.map(team => <article className="panel" key={team.id}><Link href={`/teams/${team.id}`} className="text-xl font-bold underline">{team.name}</Link><p className="mt-3">{t(team.sport)} · {team.city}</p><p className="mt-2">{t('members')}: {team.memberIds.length}</p></article>)}</div>}</main>;
}
export function CreateTeam() { return <main className="mx-auto max-w-xl px-4 pb-28 pt-28"><AccessGate roles={['player']}><TeamForm /></AccessGate></main>; }
function TeamForm() {
  const { t } = useLanguage(); const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState<unknown>();
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const sport = String(data.get('sport')); if (!isSport(sport)) return; setBusy(true); setError(undefined); try { const team = await teamsService.create({ name: String(data.get('name')), city: String(data.get('city')), sport }); router.push(`/teams/${team.id}`); } catch (error) { setError(error); } finally { setBusy(false); } }
  return <form className="panel space-y-5" onSubmit={submit}><h1 className="text-3xl font-bold">{t('createTeam')}</h1><DemoNotice />{error ? <ServiceErrorMessage error={error} /> : null}<fieldset disabled={busy} className="space-y-5"><label className="form-label">{t('teamName')}<input name="name" className="form-input" required maxLength={120} /></label><label className="form-label">{t('city')}<input name="city" className="form-input" required maxLength={100} /></label><label className="form-label">{t('sport')}<select name="sport" className="form-input">{supportedSports.map(s => <option key={s} value={s}>{t(s)}</option>)}</select></label><button className="action w-full" disabled={busy} type="submit">{t('createTeam')}</button></fieldset></form>;
}
