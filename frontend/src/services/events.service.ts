import type { EventDetails, EventRegistration, EventRegistrationInput, SiteEvent, Transport } from './contracts';

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

export function resolveVenueSiteEvents(
  venue: { id: string; name: string; slug: string },
  site: { events?: SiteEvent[] },
  options: {
    previewSite?: { events?: SiteEvent[] };
    isDraftPreview?: boolean;
    liveEvents?: EventDetails[];
  }
): EventDetails[] {
  if (options.previewSite || options.isDraftPreview) {
    const draftEvents = options.previewSite?.events || site.events || [];
    return draftEvents.map(e => {
      const eventFormat = e.format || (['tennis', 'badminton'].includes(e.sport) ? 'singles' : 'team');
      const isPast = Date.parse(`${e.date}T${e.time}:00+03:00`) <= Date.now();
      return {
        ...e,
        venueId: venue.id,
        venueName: venue.name,
        venueSlug: venue.slug,
        format: eventFormat,
        registeredCount: 0,
        availableSpots: e.spots,
        isFull: e.spots <= 0,
        isClosed: isPast,
        myRegistration: null,
      };
    });
  }
  return options.liveEvents || [];
}

export function resolveEffectiveEvent(
  selectedEventId: string | null,
  eventDetails: EventDetails[]
): EventDetails | null {
  if (!selectedEventId) return null;
  return eventDetails.find(e => e.id === selectedEventId) || null;
}

