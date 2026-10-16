import type { Account, AuditEntry, FinancialAnalytics, Transport, Venue, VenueReviewAction, VenueReviewRecord } from './contracts';
import type { OwnerAnalyticsParams } from './billing.service';

export function createAdminService(transport: Transport) {
  return {
    users: (signal?: AbortSignal) => transport.request<Account[]>('/admin/users', { signal }),
    venues: (signal?: AbortSignal) => transport.request<Venue[]>('/admin/stadiums', { signal }),
    audit: (signal?: AbortSignal) => transport.request<AuditEntry[]>('/admin/audit', { signal }),
    review: (id: string, status: 'active' | 'suspended', reason: string) =>
      transport.request<Venue>(`/admin/stadiums/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status, reason } }),
    reviewAction: (id: string, input: { action: VenueReviewAction; reason: string; notes?: string }) =>
      transport.request<{ venue: Venue; review: VenueReviewRecord }>(`/admin/stadiums/${encodeURIComponent(id)}/review`, { method: 'POST', body: input }),
    reviews: (venueId: string, signal?: AbortSignal) =>
      transport.request<VenueReviewRecord[]>(`/admin/stadiums/${encodeURIComponent(venueId)}/reviews`, { signal }),
    analytics: (params?: OwnerAnalyticsParams, signal?: AbortSignal) => {
      const sp = new URLSearchParams();
      if (params?.venueId) sp.set('venueId', params.venueId);
      if (params?.sport) sp.set('sport', params.sport);
      if (params?.dateFrom) sp.set('dateFrom', params.dateFrom);
      if (params?.dateTo) sp.set('dateTo', params.dateTo);
      if (params?.metricDateType) sp.set('metricDateType', params.metricDateType);
      const query = sp.toString() ? `?${sp.toString()}` : '';
      return transport.request<FinancialAnalytics>(`/admin/analytics${query}`, { signal });
    },
  };
}
