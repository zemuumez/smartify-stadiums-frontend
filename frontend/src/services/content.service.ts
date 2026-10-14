import type { Microsite, Transport } from './contracts';
export function createContentService(transport: Transport) {
  return {
    get: (venueId: string, signal?: AbortSignal) => transport.request<Microsite>(`/stadiums/${encodeURIComponent(venueId)}/microsite`, { signal }),
    draft: (venueId: string) => transport.request<Microsite>(`/owner/stadiums/${encodeURIComponent(venueId)}/microsite`),
    save: (site: Microsite) => transport.request<Microsite>(`/owner/stadiums/${encodeURIComponent(site.venueId)}/microsite`, { method: 'PATCH', body: site }),
    publish: (venueId: string) => transport.request<Microsite>(`/owner/stadiums/${encodeURIComponent(venueId)}/microsite/publish`, { method: 'POST' }),
  };
}
