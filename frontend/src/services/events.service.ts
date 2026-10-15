import type { EventDetails, EventRegistration, EventRegistrationInput, Transport } from './contracts';

export function createEventsService(transport: Transport) {
  return {
    get: (venueId: string, eventId: string, signal?: AbortSignal) =>
      transport.request<EventDetails>(
        `/venues/${encodeURIComponent(venueId)}/events/${encodeURIComponent(eventId)}`,
        { signal }
      ),
    list: (venueId: string, signal?: AbortSignal) =>
      transport.request<EventDetails[]>(
        `/venues/${encodeURIComponent(venueId)}/events`,
        { signal }
      ),
    register: (
      venueId: string,
      eventId: string,
      input: EventRegistrationInput = {},
      signal?: AbortSignal
    ) =>
      transport.request<EventRegistration>(
        `/venues/${encodeURIComponent(venueId)}/events/${encodeURIComponent(eventId)}/registrations`,
        { method: 'POST', body: input, signal }
      ),
    cancel: (
      venueId: string,
      eventId: string,
      registrationId: string,
      signal?: AbortSignal
    ) =>
      transport.request<EventRegistration>(
        `/venues/${encodeURIComponent(venueId)}/events/${encodeURIComponent(eventId)}/registrations/${encodeURIComponent(registrationId)}/cancel`,
        { method: 'POST', signal }
      ),
    listRegistrations: (venueId: string, eventId: string, signal?: AbortSignal) =>
      transport.request<EventRegistration[]>(
        `/venues/${encodeURIComponent(venueId)}/events/${encodeURIComponent(eventId)}/registrations`,
        { signal }
      ),
  };
}
