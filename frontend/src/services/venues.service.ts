import type { Field, Transport, Venue, VenueInput } from './contracts';
export function createVenuesService(transport: Transport) {
  return {
    list: (signal?: AbortSignal) => transport.request<Venue[]>('/stadiums', { signal }),
    owned: (signal?: AbortSignal) => transport.request<Venue[]>('/owner/stadiums', { signal }),
    get: (slug: string, signal?: AbortSignal) => transport.request<Venue>(`/stadiums/${encodeURIComponent(slug)}`, { signal }),
    fields: (venueId: string, signal?: AbortSignal) => transport.request<Field[]>(`/stadiums/${encodeURIComponent(venueId)}/fields`, { signal }),
    create: (input: VenueInput) => transport.request<Venue>('/owner/stadiums', { method: 'POST', body: input }),
  };
}
