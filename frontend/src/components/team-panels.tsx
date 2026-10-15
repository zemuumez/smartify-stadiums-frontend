'use client';

import { useCallback, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService, teamsService } from '@/services';
import type { Account, TeamJoinRequest } from '@/services/contracts';
import { supportedSports, isSport } from '@/services/sports';
import { useServiceQuery } from '@/lib/use-service-query';
import { useLanguage } from '@/i18n/provider';
import { AccessGate } from './access-gate';
import { DemoNotice, Empty, Loading, ServiceErrorMessage } from './service-state';

export function TeamDirectory({ id }: { id?: string }) {
  if (id) {
    return <TeamDetail id={id} />;
  }
  return <TeamList />;
}

function TeamList() {
  const { t } = useLanguage();
  const [sport, setSport] = useState('');
  const query = useServiceQuery(useCallback(async () => teamsService.list(), []));
  const teams = query.data?.filter(team => !sport || team.sport === sport) || [];

  return (
    <main className="mx-auto max-w-5xl px-4 pb-28 pt-28">
      <DemoNotice />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('teams')}</h1>
          <p className="mt-1 text-sm text-stone-600">{t('discoverDescription')}</p>
        </div>
        <Link href="/teams/create" className="action">
          {t('createTeam')}
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label className="form-label mb-0 flex-1 sm:max-w-xs">
          {t('sport')}
          <select
            className="form-input mt-1"
            value={sport}
            onChange={e => setSport(e.target.value)}
          >
            <option value="">{t('allSports')}</option>
            {supportedSports.map(s => (
              <option key={s} value={s}>{t(s)}</option>
            ))}
          </select>
        </label>
      </div>

      {query.loading ? (
        <Loading />
      ) : query.error ? (
        <ServiceErrorMessage error={query.error} retry={query.reload} />
      ) : !teams.length ? (
        <Empty />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map(team => (
            <article className="panel flex flex-col justify-between" key={team.id}>
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/teams/${team.id}`} className="text-xl font-bold hover:underline">
                    {team.name}
                  </Link>
                  <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800">
                    {t(team.sport)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-600">{team.city}</p>
                {team.description ? (
                  <p className="mt-3 text-sm text-stone-700">{team.description}</p>
                ) : null}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-3 text-xs text-stone-500">
                <span>{t('captain')}: {team.captainName || team.captainId}</span>
                <span>{team.memberIds.length} {t('members')}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export function TeamDetail({ id }: { id: string }) {
  const { t, money } = useLanguage();
  const router = useRouter();
  const query = useServiceQuery(
    useCallback(async (signal: AbortSignal) => {
      let me: Account | null = null;
      try {
        me = await authService.current();
      } catch {
        me = null;
      }
      const [teamData, bookingsData] = await Promise.all([
        teamsService.get(id, signal),
        teamsService.listBookings(id, signal),
      ]);
      let reqs: TeamJoinRequest[] = [];
      if (me && (teamData.captainId === me.id || me.role === 'admin')) {
        try {
          reqs = await teamsService.listRequests(id, signal);
        } catch {
          reqs = [];
        }
      }
      let myReq: TeamJoinRequest | null = null;
      if (me && !teamData.memberIds.includes(me.id)) {
        try {
          myReq = await teamsService.myRequest(id, signal);
        } catch {
          myReq = null;
        }
      }
      return { me, team: teamData, bookings: bookingsData, requests: reqs, myRequest: myReq };
    }, [id])
  );

  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<unknown>();
  const [pendingRequested, setPendingRequested] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);

  if (query.loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-28 pt-28">
        <Loading />
      </main>
    );
  }

  if (query.error || !query.data?.team) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-28 pt-28">
        <ServiceErrorMessage error={query.error || new Error('Team not found')} retry={query.reload} />
      </main>
    );
  }

  const { me: currentUser, team, bookings, requests, myRequest } = query.data;

  const isCaptain = currentUser ? team.captainId === currentUser.id || currentUser.role === 'admin' : false;
  const isMember = currentUser ? team.memberIds.includes(currentUser.id) : false;
  const isPending = pendingRequested || myRequest?.status === 'pending';

  async function handleJoin() {
    setActionBusy(true);
    setActionError(undefined);
    try {
      await teamsService.join(team!.id);
      setPendingRequested(true);
    } catch (err) {
      setActionError(err);
    } finally {
      setActionBusy(false);
    }
  }

  async function handleLeave() {
    setActionBusy(true);
    setActionError(undefined);
    try {
      await teamsService.leave(team.id);
      setConfirmLeave(false);
      if (team.captainId === currentUser?.id && team.memberIds.length === 1) {
        router.push('/teams');
      } else {
        query.reload();
      }
    } catch (err) {
      setActionError(err);
    } finally {
      setActionBusy(false);
    }
  }

  async function handleApprove(requestId: string) {
    setActionBusy(true);
    setActionError(undefined);
    try {
      await teamsService.approveRequest(team.id, requestId);
      query.reload();
    } catch (err) {
      setActionError(err);
    } finally {
      setActionBusy(false);
    }
  }

  async function handleReject(requestId: string) {
    setActionBusy(true);
    setActionError(undefined);
    try {
      await teamsService.rejectRequest(team.id, requestId);
      query.reload();
    } catch (err) {
      setActionError(err);
    } finally {
      setActionBusy(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    setActionBusy(true);
    setActionError(undefined);
    try {
      await teamsService.removeMember(team.id, memberId);
      setRemoveMemberId(null);
      query.reload();
    } catch (err) {
      setActionError(err);
    } finally {
      setActionBusy(false);
    }
  }

  const memberList = team.members || team.memberIds.map(mid => ({ id: mid, name: mid }));

  return (
    <main className="mx-auto max-w-4xl px-4 pb-28 pt-28 space-y-6">
      <DemoNotice />
      
      <div>
        <Link href="/teams" className="inline-flex items-center text-sm font-medium text-emerald-800 hover:underline mb-3">
          ← {t('teams')}
        </Link>
      </div>

      {actionError ? <ServiceErrorMessage error={actionError} /> : null}

      {/* Team Header Panel */}
      <section className="panel space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                {t(team.sport)}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-600">{team.city}</p>
          </div>

          {/* Membership status actions */}
          <div className="flex items-center gap-2">
            {!currentUser ? (
              <Link
                href={`/auth/login?returnTo=${encodeURIComponent(`/teams/${team.id}`)}`}
                className="action text-sm"
              >
                {t('requestToJoin')}
              </Link>
            ) : isCaptain ? (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white">
                  {t('youAreCaptain')}
                </span>
                <Link
                  href={`/bookings/new?sport=${team.sport}&team=${team.id}`}
                  className="action text-xs"
                >
                  {t('bookForTeam')}
                </Link>
              </div>
            ) : isMember ? (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {t('teamMember')}
                </span>
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => setConfirmLeave(true)}
                  className="rounded-xl border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  {t('leaveTeam')}
                </button>
              </div>
            ) : isPending ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                {t('joinRequestPending')}
              </span>
            ) : (
              <button
                type="button"
                disabled={actionBusy}
                onClick={handleJoin}
                className="action text-sm"
              >
                {t('requestToJoin')}
              </button>
            )}
          </div>
        </div>

        {confirmLeave ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">
            <p className="font-semibold">{t('leaveTeamConfirm')}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={actionBusy}
                onClick={handleLeave}
                className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                {t('confirm')}
              </button>
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => setConfirmLeave(false)}
                className="rounded-xl border border-stone-300 bg-white px-4 py-1.5 text-xs font-semibold text-stone-700"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        ) : null}

        {team.description ? (
          <p className="text-sm text-stone-700 leading-relaxed border-t border-stone-200 pt-3">
            {team.description}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-6 text-xs text-stone-500 border-t border-stone-200 pt-3">
          <div>
            <span className="font-semibold text-stone-700">{t('captain')}:</span>{' '}
            {team.captainName || team.captainId}
          </div>
          <div>
            <span className="font-semibold text-stone-700">{t('members')}:</span>{' '}
            {team.memberIds.length}
          </div>
        </div>
      </section>

      {/* Captain Control Panel */}
      {isCaptain ? (
        <section className="panel space-y-4 border-2 border-emerald-800">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h2 className="text-lg font-bold text-emerald-900">{t('captainPanel')}</h2>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              {t('captain')}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-800 mb-2">{t('pendingRequests')}</h3>
            {requests.length === 0 ? (
              <p className="text-xs text-stone-500">{t('noPendingRequests')}</p>
            ) : (
              <div className="space-y-2">
                {requests.map(req => (
                  <div
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-stone-50 p-3 border border-stone-200 text-sm"
                  >
                    <div>
                      <span className="font-semibold text-stone-900">{req.playerName}</span>
                      <span className="ml-2 text-xs text-stone-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() => handleApprove(req.id)}
                        className="rounded-lg bg-emerald-700 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        {t('approveRequest')}
                      </button>
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() => handleReject(req.id)}
                        className="rounded-lg border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                      >
                        {t('rejectRequest')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* Team Roster */}
      <section className="panel space-y-4">
        <h2 className="text-lg font-bold text-stone-900">{t('teamRoster')}</h2>
        
        {memberList.length === 0 ? (
          <p className="text-sm text-stone-500">{t('rosterEmpty')}</p>
        ) : (
          <ul className="divide-y divide-stone-200">
            {memberList.map(m => {
              const memberIsCaptain = m.id === team.captainId;
              const canRemove = isCaptain && !memberIsCaptain;

              return (
                <li key={m.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-900">{m.name}</span>
                    {memberIsCaptain ? (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        {t('captain')}
                      </span>
                    ) : null}
                  </div>

                  {canRemove ? (
                    <div>
                      {removeMemberId === m.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-700">{t('removeMemberConfirm')}</span>
                          <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => handleRemoveMember(m.id)}
                            className="rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white"
                          >
                            {t('confirm')}
                          </button>
                          <button
                            type="button"
                            disabled={actionBusy}
                            onClick={() => setRemoveMemberId(null)}
                            className="rounded border border-stone-300 px-2 py-0.5 text-xs font-semibold text-stone-700"
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() => setRemoveMemberId(m.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          {t('removeMember')}
                        </button>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Team Bookings and Matches */}
      <section className="panel space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">{t('teamBookings')}</h2>
          {isCaptain ? (
            <Link
              href={`/bookings/new?sport=${team.sport}&team=${team.id}`}
              className="action text-xs"
            >
              + {t('bookForTeam')}
            </Link>
          ) : null}
        </div>

        {bookings.length === 0 ? (
          <p className="text-sm text-stone-500">{t('noTeamBookings')}</p>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <article
                key={b.matchId}
                className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">
                      {b.date} · {b.startHour}:00 - {b.endHour}:00
                    </span>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      {t(b.sport)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-600">
                    {t('status')}: <span className="font-medium text-stone-800">{t(b.status)}</span>
                  </p>
                </div>

                {/* Member/Captain view: financial amounts and settlement */}
                {b.totalMinor !== undefined ? (
                  <div className="text-right sm:border-l sm:border-stone-200 sm:pl-4">
                    <div className="font-bold text-stone-900">
                      {money(b.totalMinor)}
                    </div>
                    {b.paymentStatus ? (
                      <span className="inline-block mt-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                        {t(b.paymentStatus)}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export function CreateTeam() {
  return (
    <main className="mx-auto max-w-xl px-4 pb-28 pt-28">
      <AccessGate roles={['player']}>
        <TeamForm />
      </AccessGate>
    </main>
  );
}

function TeamForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const sport = String(data.get('sport'));
    if (!isSport(sport)) return;
    setBusy(true);
    setError(undefined);
    try {
      const team = await teamsService.create({
        name: String(data.get('name')),
        city: String(data.get('city')),
        description: String(data.get('description') || ''),
        sport,
      });
      router.push(`/teams/${team.id}`);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel space-y-5" onSubmit={submit}>
      <h1 className="text-3xl font-bold">{t('createTeam')}</h1>
      <DemoNotice />
      {error ? <ServiceErrorMessage error={error} /> : null}
      <fieldset disabled={busy} className="space-y-5">
        <label className="form-label">
          {t('teamName')}
          <input name="name" className="form-input" required maxLength={120} />
        </label>
        <label className="form-label">
          {t('city')}
          <input name="city" className="form-input" required maxLength={100} />
        </label>
        <label className="form-label">
          {t('description')}
          <textarea name="description" className="form-input" rows={3} maxLength={500} />
        </label>
        <label className="form-label">
          {t('sport')}
          <select name="sport" className="form-input">
            {supportedSports.map(s => (
              <option key={s} value={s}>{t(s)}</option>
            ))}
          </select>
        </label>
        <button className="action w-full" disabled={busy} type="submit">
          {t('createTeam')}
        </button>
      </fieldset>
    </form>
  );
}
