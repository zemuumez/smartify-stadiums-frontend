import type { Team, TeamInput, TeamJoinRequest, TeamMatchDetail, Transport } from './contracts';

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
