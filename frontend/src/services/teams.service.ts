import type { Team, Transport } from './contracts';
export function createTeamsService(transport: Transport) {
  return {
    list: () => transport.request<Team[]>('/teams'),
    get: (id: string) => transport.request<Team>(`/teams/${encodeURIComponent(id)}`),
    create: (input: Pick<Team, 'name' | 'sport' | 'city'>) => transport.request<Team>('/teams', { method: 'POST', body: input }),
  };
}
