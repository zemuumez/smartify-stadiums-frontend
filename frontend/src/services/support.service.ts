import type { SupportCase, SupportCaseCreateInput, SupportCasePriority, SupportCaseStatus, SupportMessage, Transport } from './contracts';

export function createSupportService(transport: Transport) {
  return {
    list: (params?: { venueId?: string; status?: SupportCaseStatus }, signal?: AbortSignal) => {
      const sp = new URLSearchParams();
      if (params?.venueId) sp.set('venueId', params.venueId);
      if (params?.status) sp.set('status', params.status);
      const query = sp.toString();
      return transport.request<SupportCase[]>(query ? `/support/cases?${query}` : '/support/cases', { signal });
    },
    get: (id: string, signal?: AbortSignal) =>
      transport.request<SupportCase>(`/support/cases/${encodeURIComponent(id)}`, { signal }),
    create: (input: SupportCaseCreateInput) =>
      transport.request<SupportCase>('/support/cases', { method: 'POST', body: input }),
    addMessage: (id: string, input: { message: string; isInternal?: boolean }) =>
      transport.request<SupportMessage>(`/support/cases/${encodeURIComponent(id)}/messages`, { method: 'POST', body: input }),
    update: (id: string, input: { status?: SupportCaseStatus; priority?: SupportCasePriority }) =>
      transport.request<SupportCase>(`/support/cases/${encodeURIComponent(id)}`, { method: 'PATCH', body: input }),
  };
}
