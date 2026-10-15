import type { Booking, Team, TeamInput, TeamJoinRequest, Transport } from './contracts';

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
      transport.request<Booking[]>(`/teams/${encodeURIComponent(id)}/bookings`, { signal }),
  };
}
