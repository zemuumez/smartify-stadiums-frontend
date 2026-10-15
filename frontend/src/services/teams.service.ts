import type { Account, Team, TeamInput, TeamJoinRequest, TeamMatchDetail, Transport } from './contracts';

export function createTeamsService(transport: Transport) {
  return {
    list: (signal?: AbortSignal) => transport.request<Team[]>('/teams', { signal }),
    get: (id: string, signal?: AbortSignal) =>
      transport.request<Team>(`/teams/${encodeURIComponent(id)}`, { signal }),
    create: (input: TeamInput, signal?: AbortSignal) =>
      transport.request<Team>('/teams', { method: 'POST', body: input, signal }),
    join: (id: string, signal?: AbortSignal) =>
      transport.request<TeamJoinRequest>(`/teams/${encodeURIComponent(id)}/join`, {
        method: 'POST',
        signal,
      }),
    myRequest: (id: string, signal?: AbortSignal) =>
      transport.request<TeamJoinRequest | null>(`/teams/${encodeURIComponent(id)}/my-request`, {
        signal,
      }),
    leave: (id: string, signal?: AbortSignal) =>
      transport.request<{ success: boolean }>(`/teams/${encodeURIComponent(id)}/leave`, {
        method: 'POST',
        signal,
      }),
    listRequests: (id: string, signal?: AbortSignal) =>
      transport.request<TeamJoinRequest[]>(`/teams/${encodeURIComponent(id)}/requests`, {
        signal,
      }),
    approveRequest: (id: string, requestId: string, signal?: AbortSignal) =>
      transport.request<Team>(
        `/teams/${encodeURIComponent(id)}/requests/${encodeURIComponent(requestId)}/approve`,
        { method: 'POST', signal }
      ),
    rejectRequest: (id: string, requestId: string, signal?: AbortSignal) =>
      transport.request<TeamJoinRequest>(
        `/teams/${encodeURIComponent(id)}/requests/${encodeURIComponent(requestId)}/reject`,
        { method: 'POST', signal }
      ),
    removeMember: (id: string, memberId: string, signal?: AbortSignal) =>
      transport.request<Team>(
        `/teams/${encodeURIComponent(id)}/members/${encodeURIComponent(memberId)}`,
        { method: 'DELETE', signal }
      ),
    listBookings: (id: string, signal?: AbortSignal) =>
      transport.request<TeamMatchDetail[]>(`/teams/${encodeURIComponent(id)}/bookings`, { signal }),
    listMatches: (id: string, signal?: AbortSignal) =>
      transport.request<TeamMatchDetail[]>(`/teams/${encodeURIComponent(id)}/bookings`, { signal }),
  };
}

export function isGuestAuthError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const code = 'code' in err ? (err as { code: unknown }).code : undefined;
  const status = 'status' in err ? (err as { status: unknown }).status : undefined;
  return code === 'unauthorized' || status === 401;
}

export interface TeamDetailData {
  me: Account | null;
  team: Team;
  bookings: TeamMatchDetail[];
  requests: TeamJoinRequest[];
  myRequest: TeamJoinRequest | null;
}

export async function fetchTeamDetailData(
  id: string,
  deps: {
    auth: { current: () => Promise<Account> };
    teams: {
      get: (id: string, signal?: AbortSignal) => Promise<Team>;
      listBookings: (id: string, signal?: AbortSignal) => Promise<TeamMatchDetail[]>;
      listRequests: (id: string, signal?: AbortSignal) => Promise<TeamJoinRequest[]>;
      myRequest: (id: string, signal?: AbortSignal) => Promise<TeamJoinRequest | null>;
    };
  },
  signal?: AbortSignal
): Promise<TeamDetailData> {
  let me: Account | null = null;
  try {
    me = await deps.auth.current();
  } catch (err: unknown) {
    if (isGuestAuthError(err)) {
      me = null;
    } else {
      throw err;
    }
  }
  const [teamData, bookingsData] = await Promise.all([
    deps.teams.get(id, signal),
    deps.teams.listBookings(id, signal),
  ]);
  let reqs: TeamJoinRequest[] = [];
  if (me && (teamData.captainId === me.id || me.role === 'admin')) {
    reqs = await deps.teams.listRequests(id, signal);
  }
  let myReq: TeamJoinRequest | null = null;
  if (me && !teamData.memberIds.includes(me.id)) {
    myReq = await deps.teams.myRequest(id, signal);
  }
  return { me, team: teamData, bookings: bookingsData, requests: reqs, myRequest: myReq };
}

