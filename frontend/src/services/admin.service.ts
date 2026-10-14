import type { Account, AuditEntry, Transport, Venue } from './contracts';
export function createAdminService(transport: Transport) {
  return {
    users: () => transport.request<Account[]>('/admin/users'),
    venues: () => transport.request<Venue[]>('/admin/stadiums'),
    audit: () => transport.request<AuditEntry[]>('/admin/audit'),
    review: (id: string, status: 'active' | 'suspended', reason: string) => transport.request<Venue>(`/admin/stadiums/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status, reason } }),
  };
}
