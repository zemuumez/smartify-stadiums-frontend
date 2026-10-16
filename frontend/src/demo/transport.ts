import type { Account, Booking, BookingInput, CameraCertificationReviewInput, CameraDevice, CameraRegisterInput, CameraUpdateInput, Closure, EventRegistration, EventRegistrationInput, MatchRecording, MediaVisibility, Microsite, PrivacyConsentStatus, PublicHighlight, PublicTeamMatch, RecordingStatus, ReplayPlayback, RequestOptions, RescheduleBookingInput, Role, SiteEvent, Sport, Team, TeamInput, TeamJoinRequest, TeamMatchDetail, Transport, VenueInput, WalkInBookingInput } from '../services/contracts';
import { isSupportedImageUrl, isSupportedVideoUrl } from '../services/media-policy';
import { ServiceError } from '../services/errors';
import { quoteMinor, validateInterval } from '../services/bookings.service';
import { commercialPolicy, createFixtures, demoOTP, type DemoState } from './fixtures';
import type { FieldInput } from '../services/fields.service';

export interface DemoStorage { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
const DATA_KEY = 'etsf-demo-v2';
const SESSION_KEY = 'etsf-demo-session-v1';
const overlaps = (start: number, end: number, otherStart: number, otherEnd: number) => start < otherEnd && end > otherStart;
const sports: Sport[] = ['football', 'basketball', 'volleyball', 'badminton', 'tennis', 'futsal'];

/** Simulator only: browser data and role checks are not a security boundary. */
export function createDemoTransport(storage?: DemoStorage) {
  let state: DemoState = createFixtures();
  let currentId: string | null = null;
  const issuedOTPs = new Map<string, number>();
  try {
    const saved = storage?.getItem(DATA_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as DemoState;
      if (Array.isArray(parsed.venues) && Array.isArray(parsed.accounts) && Array.isArray(parsed.bookings) && Array.isArray(parsed.fields) && Array.isArray(parsed.drafts) && parsed.idempotency) {
        state = parsed;
        if (!Array.isArray(state.teams)) state.teams = createFixtures().teams;
        if (!Array.isArray(state.teamRequests)) state.teamRequests = [];
        if (!Array.isArray(state.eventRegistrations)) state.eventRegistrations = [];
        if (!Array.isArray(state.cameras)) state.cameras = createFixtures().cameras;
        if (!Array.isArray(state.recordings)) state.recordings = createFixtures().recordings;
      }
    }
    currentId = storage?.getItem(SESSION_KEY) || null;
  } catch { state = createFixtures(); }
  const persist = () => {
    try { storage?.setItem(DATA_KEY, JSON.stringify(state)); } catch { /* Demo can still run in memory when storage is unavailable. */ }
  };
  const session = (id: string | null) => {
    currentId = id;
    try { if (id) storage?.setItem(SESSION_KEY, id); else storage?.removeItem(SESSION_KEY); } catch { /* No real credentials are stored. */ }
  };
  const account = (): Account => {
    const activeId = storage?.getItem(SESSION_KEY) || currentId;
    const user = state.accounts.find(item => item.id === activeId);
    if (!user) throw new ServiceError('unauthorized', 401);
    return user;
  };
  const requireRole = (role: Role) => { const user = account(); if (user.role !== role) throw new ServiceError('forbidden', 403); return user; };
  const owned = (venueId: string) => {
    const user = account();
    const venue = state.venues.find(item => item.id === venueId);
    if (!venue) throw new ServiceError('not_found', 404);
    if (user.role !== 'admin' && (user.role !== 'owner' || venue.ownerId !== user.id)) throw new ServiceError('forbidden', 403);
    return venue;
  };
  const verifyCode = (phone: string, code: string) => {
    const expiry = issuedOTPs.get(phone);
    if (code !== demoOTP || !expiry || expiry < Date.now()) throw new ServiceError('validation', 422);
    issuedOTPs.delete(phone);
  };
  const publicVenue = (id: string) => {
    const venue = state.venues.find(item => item.id === id || item.slug === id);
    if (!venue || venue.status !== 'active') throw new ServiceError('not_found', 404);
    return venue;
  };
  const field = (id: string) => { const item = state.fields.find(item => item.id === id); if (!item) throw new ServiceError('not_found', 404); return item; };
  const available = (fieldId: string, date: string, start: number, end: number) => !state.bookings.some(b => b.fieldId === fieldId && b.date === date && b.status !== 'cancelled' && b.status !== 'no_show' && overlaps(start, end, b.startHour, b.endHour)) && !state.closures.some(c => c.fieldId === fieldId && c.date === date && overlaps(start, end, c.startHour, c.endHour));
  const audit = (action: string, resourceId: string) => state.audit.push({ id: crypto.randomUUID(), actorId: account().id, action, resourceId, createdAt: new Date().toISOString() });
  const validateEventRegistrationInvariants = (venueId: string, candidateEvents: SiteEvent[], existingEvents: SiteEvent[]) => {
    const activeRegs = state.eventRegistrations.filter(r => r.venueId === venueId && r.status === 'registered');
    const newEventIds = new Set(candidateEvents.map(e => e.id));
    for (const reg of activeRegs) {
      if (!newEventIds.has(reg.eventId)) {
        throw new ServiceError('conflict', 409);
      }
    }
    for (const newEvent of candidateEvents) {
      const activeForEvent = activeRegs.filter(r => r.eventId === newEvent.id);
      if (newEvent.spots < activeForEvent.length) {
        throw new ServiceError('conflict', 409);
      }
      const existingEvent = existingEvents.find(e => e.id === newEvent.id);
      if (existingEvent && activeForEvent.length > 0) {
        const oldFormat = existingEvent.format || (['tennis', 'badminton'].includes(existingEvent.sport) ? 'singles' : 'team');
        const nextFormat = newEvent.format || (['tennis', 'badminton'].includes(newEvent.sport) ? 'singles' : 'team');
        if (existingEvent.sport !== newEvent.sport || oldFormat !== nextFormat) {
          throw new ServiceError('conflict', 409);
        }
      }
    }
  };

  function execute(path: string, options: RequestOptions): unknown {
    const url = new URL(path, 'https://demo.invalid');
    const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const method = options.method || 'GET';
    if (path === '/auth/request-otp' && method === 'POST') {
      const { phone } = options.body as { phone: string }; issuedOTPs.set(phone, Date.now() + 300000); return;
    }
    if (path === '/auth/login' && method === 'POST') {
      const { phone, code } = options.body as { phone: string; code: string };
      verifyCode(phone, code);
      const user = state.accounts.find(item => item.phone === phone);
      if (!user) throw new ServiceError('unauthorized', 401);
      session(user.id); return user;
    }
    if (path === '/auth/register' && method === 'POST') {
      const input = options.body as { phone: string; code: string; full_name: string; role: Role };
      if (!['player', 'owner'].includes(input.role) || !input.full_name.trim()) throw new ServiceError('validation', 422);
      verifyCode(input.phone, input.code);
      if (state.accounts.some(item => item.phone === input.phone)) throw new ServiceError('conflict', 409);
      const user: Account = { id: crypto.randomUUID(), phone: input.phone, full_name: input.full_name.trim(), role: input.role, is_verified: true, is_minor: false, created_at: new Date().toISOString() };
      state.accounts.push(user); session(user.id); persist(); return user;
    }
    if (path === '/auth/logout' && method === 'POST') { session(null); return; }
    if (path === '/users/me' && method === 'GET') return account();
    if (path === '/commercial-policy' && method === 'GET') return commercialPolicy;
    if (parts[0] === 'stadiums' && method === 'GET') {
      if (parts.length === 1) return state.venues.filter(item => item.status === 'active');
      const venue = publicVenue(parts[1]);
      if (parts.length === 2) return venue;
      if (parts[2] === 'fields') return state.fields.filter(item => item.venueId === venue.id && item.active);
      if (parts[2] === 'microsite') { const site = state.sites.find(item => item.venueId === venue.id && item.published); if (!site) throw new ServiceError('not_found', 404); return site; }
    }
    if (parts[0] === 'fields' && parts[2] === 'availability' && method === 'GET') {
      const item = field(parts[1]); publicVenue(item.venueId);
      const date = url.searchParams.get('date') || ''; validateInterval(date, 0, 1);
      if (!item.active) return [];
      return Array.from({ length: item.closeHour - item.openHour }, (_, index) => ({ startHour: item.openHour + index, endHour: item.openHour + index + 1, available: Date.parse(`${date}T${String(item.openHour + index).padStart(2, '0')}:00:00+03:00`) > Date.now() && available(item.id, date, item.openHour + index, item.openHour + index + 1) }));
    }
    if (path === '/bookings' && method === 'GET') {
      const user = account();
      return state.bookings.filter(b => user.role === 'admin' || b.playerId === user.id || (user.role === 'owner' && state.venues.some(v => v.id === b.venueId && v.ownerId === user.id)));
    }
    if (path === '/bookings' && method === 'POST') {
      const user = requireRole('player'); const input = options.body as BookingInput;
      validateInterval(input.date, input.startHour, input.endHour);
      const item = field(input.fieldId); publicVenue(item.venueId);
      if (!input.idempotencyKey || !item.active || !item.sports.includes(input.sport) || input.startHour < item.openHour || input.endHour > item.closeHour || Date.parse(`${input.date}T${String(input.startHour).padStart(2, '0')}:00:00+03:00`) <= Date.now()) throw new ServiceError('validation', 422);

      let teamId: string | undefined;
      let teamName: string | undefined;
      if (input.teamId) {
        const team = state.teams.find(t => t.id === input.teamId);
        if (!team) throw new ServiceError('not_found', 404);
        if (team.captainId !== user.id) throw new ServiceError('forbidden', 403);
        if (team.sport !== input.sport) throw new ServiceError('validation', 422);
        teamId = team.id;
        teamName = team.name;
      }

      const key = `${user.id}:${input.idempotencyKey}`; const fingerprint = JSON.stringify({ ...input, teamId, teamName });
      const previous = state.idempotency[key];
      if (previous) {
        if (previous.fingerprint !== fingerprint) throw new ServiceError('conflict', 409);
        return state.bookings.find(b => b.id === previous.bookingId);
      }
      if (!available(item.id, input.date, input.startHour, input.endHour)) throw new ServiceError('conflict', 409);
      const booking: Booking = { id: crypto.randomUUID(), venueId: item.venueId, fieldId: item.id, playerId: user.id, sport: input.sport, date: input.date, startHour: input.startHour, endHour: input.endHour, totalMinor: quoteMinor(item.hourlyRateMinor, input.startHour, input.endHour), currency: 'ETB' as const, status: 'confirmed' as const, paymentStatus: 'unpaid' as const, createdAt: new Date().toISOString(), source: 'online' as const, teamId, teamName };
      state.bookings.push(booking);
      const cam = state.cameras.find(c => c.fieldId === item.id);
      const rec: MatchRecording = {
        id: `rec-${booking.id}`,
        venueId: item.venueId,
        fieldId: item.id,
        bookingId: booking.id,
        cameraId: cam?.id,
        sport: booking.sport,
        teamId: booking.teamId,
        teamName: booking.teamName,
        status: 'ready',
        retryEligible: false,
        duration: `${(booking.endHour - booking.startHour) * 45}:00`,
        title: `${state.venues.find(v => v.id === item.venueId)?.name || 'Match'} — ${item.name}`,
        playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: state.venues.find(v => v.id === item.venueId)?.image || '/venue-card-1.jpg',
        consent: { status: 'granted', requiresGuardian: false, updatedAt: new Date().toISOString() },
        privacy: { faceBlurStatus: 'completed', completedAt: new Date().toISOString() },
        publication: { visibility: 'private', ownerApproved: false },
        retentionExpiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      state.recordings.push(rec);
      state.idempotency[key] = { fingerprint, bookingId: booking.id }; audit('booking.created', booking.id); persist(); return booking;
    }
    if (parts[0] === 'bookings' && parts[2] === 'cancel' && method === 'POST') {
      const user = account(); const booking = state.bookings.find(item => item.id === parts[1]);
      if (!booking) throw new ServiceError('not_found', 404);
      if (booking.playerId !== user.id) owned(booking.venueId);
      if (!['confirmed', 'pending', 'cancelled'].includes(booking.status)) throw new ServiceError('conflict', 409);
      // Demo policy: future unpaid bookings only; real cancellation/refund policy remains open.
      if (booking.paymentStatus !== 'unpaid' || Date.parse(`${booking.date}T${String(booking.startHour).padStart(2, '0')}:00:00+03:00`) <= Date.now()) throw new ServiceError('conflict', 409);
      if (booking.status !== 'cancelled') { booking.status = 'cancelled'; audit('booking.cancelled', booking.id); persist(); }
      return booking;
    }
    if (parts[0] === 'bookings' && parts[2] === 'reschedule' && method === 'POST') {
      const user = account(); const booking = state.bookings.find(item => item.id === parts[1]);
      if (!booking) throw new ServiceError('not_found', 404);
      if (user.role === 'player') {
        if (booking.playerId !== user.id) throw new ServiceError('forbidden', 403);
      } else if (user.role === 'owner') {
        owned(booking.venueId);
      } else if (user.role !== 'admin') {
        throw new ServiceError('forbidden', 403);
      }
      if (booking.status !== 'confirmed') throw new ServiceError('conflict', 409);
      // Provisional demo policy: future unpaid bookings only; real rescheduling/refund policy remains open.
      if (booking.paymentStatus !== 'unpaid' || Date.parse(`${booking.date}T${String(booking.startHour).padStart(2, '0')}:00:00+03:00`) <= Date.now()) throw new ServiceError('conflict', 409);

      const input = options.body as RescheduleBookingInput;
      validateInterval(input.date, input.startHour, input.endHour);
      if (!input.idempotencyKey) throw new ServiceError('validation', 422);
      if (Date.parse(`${input.date}T${String(input.startHour).padStart(2, '0')}:00:00+03:00`) <= Date.now()) throw new ServiceError('validation', 422);

      const item = field(booking.fieldId);
      publicVenue(item.venueId);
      if (!item.active || !item.sports.includes(booking.sport) || input.startHour < item.openHour || input.endHour > item.closeHour) throw new ServiceError('validation', 422);

      const key = `${user.id}:${input.idempotencyKey}`;
      const fingerprint = JSON.stringify({ bookingId: booking.id, ...input });
      const previous = state.idempotency[key];
      if (previous) {
        if (previous.fingerprint !== fingerprint) throw new ServiceError('conflict', 409);
        return state.bookings.find(b => b.id === previous.bookingId);
      }

      const isAvailable = !state.bookings.some(b => b.id !== booking.id && b.fieldId === item.id && b.date === input.date && b.status !== 'cancelled' && b.status !== 'no_show' && overlaps(input.startHour, input.endHour, b.startHour, b.endHour)) && !state.closures.some(c => c.fieldId === item.id && c.date === input.date && overlaps(input.startHour, input.endHour, c.startHour, c.endHour));
      if (!isAvailable) throw new ServiceError('conflict', 409);

      const newTotalMinor = quoteMinor(item.hourlyRateMinor, input.startHour, input.endHour);
      if (!booking.originalSchedule) {
        booking.originalSchedule = { date: booking.date, startHour: booking.startHour, endHour: booking.endHour };
      }
      booking.date = input.date;
      booking.startHour = input.startHour;
      booking.endHour = input.endHour;
      booking.totalMinor = newTotalMinor;
      booking.rescheduledAt = new Date().toISOString();
      state.idempotency[key] = { fingerprint, bookingId: booking.id };
      audit('booking.rescheduled', booking.id);
      persist();
      return booking;
    }
    if (parts[0] === 'owner') {
      const user = account(); if (!['owner', 'admin'].includes(user.role)) throw new ServiceError('forbidden', 403);
      if (parts[1] === 'walk-ins' && method === 'POST') {
        const input = options.body as WalkInBookingInput;
        if (!input.guestName?.trim() || !input.venueId || !input.fieldId) throw new ServiceError('validation', 422);
        validateInterval(input.date, input.startHour, input.endHour);
        const venue = owned(input.venueId);
        const item = field(input.fieldId);
        if (item.venueId !== venue.id) throw new ServiceError('validation', 422);
        if (!input.idempotencyKey || !item.active || !item.sports.includes(input.sport) || input.startHour < item.openHour || input.endHour > item.closeHour || Date.parse(`${input.date}T${String(input.startHour).padStart(2, '0')}:00:00+03:00`) <= Date.now()) throw new ServiceError('validation', 422);

        const key = `${user.id}:${input.idempotencyKey}`;
        const fingerprint = JSON.stringify(input);
        const previous = state.idempotency[key];
        if (previous) {
          if (previous.fingerprint !== fingerprint) throw new ServiceError('conflict', 409);
          return state.bookings.find(b => b.id === previous.bookingId);
        }
        if (!available(item.id, input.date, input.startHour, input.endHour)) throw new ServiceError('conflict', 409);

        const booking = {
          id: crypto.randomUUID(),
          venueId: venue.id,
          fieldId: item.id,
          playerId: '',
          sport: input.sport,
          date: input.date,
          startHour: input.startHour,
          endHour: input.endHour,
          totalMinor: quoteMinor(item.hourlyRateMinor, input.startHour, input.endHour),
          currency: 'ETB' as const,
          status: 'confirmed' as const,
          paymentStatus: 'unpaid' as const,
          createdAt: new Date().toISOString(),
          source: 'walk_in' as const,
          guestName: input.guestName.trim(),
          guestPhone: input.guestPhone?.trim() || undefined,
        };
        state.bookings.push(booking);
        const cam = state.cameras.find(c => c.fieldId === item.id);
        const rec: MatchRecording = {
          id: `rec-${booking.id}`,
          venueId: venue.id,
          fieldId: item.id,
          bookingId: booking.id,
          cameraId: cam?.id,
          sport: booking.sport,
          status: 'ready',
          retryEligible: false,
          duration: `${(booking.endHour - booking.startHour) * 45}:00`,
          title: `${venue.name} — ${item.name} (${input.guestName})`,
          playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnailUrl: venue.image || '/venue-card-1.jpg',
          consent: { status: 'granted', requiresGuardian: false, updatedAt: new Date().toISOString() },
          privacy: { faceBlurStatus: 'completed', completedAt: new Date().toISOString() },
          publication: { visibility: 'private', ownerApproved: false },
          retentionExpiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
          createdAt: new Date().toISOString(),
        };
        state.recordings.push(rec);
        state.idempotency[key] = { fingerprint, bookingId: booking.id };
        audit('booking.walk_in', booking.id);
        persist();
        return booking;
      }
      const venueIds = state.venues.filter(v => user.role === 'admin' || v.ownerId === user.id).map(v => v.id);
      if (path === '/owner/stadiums' && method === 'GET') return state.venues.filter(v => venueIds.includes(v.id));
      if (path === '/owner/stadiums' && method === 'POST') {
        const input = options.body as VenueInput;
        if (!input.name.trim() || !input.city.trim()) throw new ServiceError('validation', 422);
        const id = crypto.randomUUID();
        const venue = { ...input, id, ownerId: user.id, slug: `venue-${id}`, sports: [], status: 'pending' as const, verified: false, image: '/venue-card-1.jpg', rating: null, reviewCount: 0, timezone: 'Africa/Addis_Ababa' };
        state.venues.push(venue);
        state.drafts.push({ venueId: id, tagline: input.name, description: input.description, primaryColor: '#2d6a4f', published: false, updatedAt: new Date().toISOString() });
        audit('venue.submitted', id); persist(); return venue;
      }
      if (parts[1] === 'stadiums' && parts[2]) {
        const venue = owned(parts[2]);
        if (parts[3] === 'closures' && method === 'GET') return state.closures.filter(c => state.fields.some(f => f.id === c.fieldId && f.venueId === venue.id));
        if (parts[3] === 'microsite') {
          const draft = state.drafts.find(item => item.venueId === venue.id);
          if (!draft) throw new ServiceError('not_found', 404);
          if (method === 'GET') return draft;
          if (method === 'PATCH') {
            const input = options.body as Microsite;
            if (!/^#[\da-f]{6}$/i.test(input.primaryColor) || !input.tagline.trim() || input.tagline.length > 120 || input.description.length > 5000) throw new ServiceError('validation', 422);
            if (input.heroImage && !isSupportedImageUrl(input.heroImage)) throw new ServiceError('validation', 422);
            if (input.logoUrl && !isSupportedImageUrl(input.logoUrl)) throw new ServiceError('validation', 422);
            if (input.announcement && input.announcement.length > 200) throw new ServiceError('validation', 422);
            if (input.contactPhone && (input.contactPhone.length > 30 || !/^\+?[0-9\s\-()]+$/.test(input.contactPhone))) throw new ServiceError('validation', 422);
            if (input.contactEmail && (input.contactEmail.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contactEmail))) throw new ServiceError('validation', 422);
            if ((input.socialLinks || []).length > 10) throw new ServiceError('validation', 422);
            if ((input.socialLinks || []).some(s => !s.url.startsWith('https://') || s.url.length > 300)) throw new ServiceError('validation', 422);
            if ((input.gallery || []).length > 30) throw new ServiceError('validation', 422);
            if ((input.gallery || []).some(g => !isSupportedImageUrl(g.url) || (g.caption && g.caption.length > 200))) throw new ServiceError('validation', 422);
            if ((input.highlights || []).length > 30 || (input.events || []).length > 30) throw new ServiceError('validation', 422);
            if ((input.highlights || []).some(h => !h.title.trim() || h.title.length > 200 || (h.playbackUrl && !isSupportedVideoUrl(h.playbackUrl))) || (input.events || []).some(e => !e.title.trim() || e.title.length > 200 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time) || !sports.includes(e.sport) || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || !Number.isInteger(e.spots) || e.spots < 0 || (e.format && !['team', 'singles', 'doubles'].includes(e.format)))) throw new ServiceError('validation', 422);

            validateEventRegistrationInvariants(
              venue.id,
              (input.events || []) as SiteEvent[],
              (draft.events || []) as SiteEvent[]
            );

            Object.assign(draft, {
              highlights: structuredClone(input.highlights || []),
              events: structuredClone(input.events || []),
              gallery: structuredClone(input.gallery || []),
              socialLinks: structuredClone(input.socialLinks || []),
              tagline: input.tagline.trim(),
              description: input.description.trim(),
              primaryColor: input.primaryColor,
              heroImage: input.heroImage ? input.heroImage.trim() : null,
              logoUrl: input.logoUrl ? input.logoUrl.trim() : null,
              announcement: input.announcement ? input.announcement.trim() : null,
              contactPhone: input.contactPhone ? input.contactPhone.trim() : null,
              contactEmail: input.contactEmail ? input.contactEmail.trim() : null,
              updatedAt: new Date().toISOString()
            });
            persist();
            return draft;
          }
          if (parts[4] === 'publish' && method === 'POST') {
            if (venue.status !== 'active') throw new ServiceError('conflict', 409);
            const currentSite = state.sites.find(item => item.venueId === venue.id);
            validateEventRegistrationInvariants(
              venue.id,
              (draft.events || []) as SiteEvent[],
              (currentSite?.events || draft.events || []) as SiteEvent[]
            );
            draft.published = true;
            draft.updatedAt = new Date().toISOString();
            const site = structuredClone(draft);
            state.sites = [...state.sites.filter(item => item.venueId !== venue.id), site];
            audit('microsite.published', venue.id);
            persist();
            return site;
          }
          if (parts[4] === 'unpublish' && method === 'POST') {
            draft.published = false;
            draft.updatedAt = new Date().toISOString();
            state.sites = state.sites.filter(item => item.venueId !== venue.id);
            audit('microsite.unpublished', venue.id);
            persist();
            return draft;
          }
        }
      }
      if (path === '/owner/closures' && method === 'POST') {
        const input = options.body as Omit<Closure, 'id'>; const item = field(input.fieldId); owned(item.venueId); validateInterval(input.date, input.startHour, input.endHour);
        if (!input.reason.trim() || !available(item.id, input.date, input.startHour, input.endHour)) throw new ServiceError('conflict', 409);
        const closure = { ...input, id: crypto.randomUUID() }; state.closures.push(closure); audit('field.closed', item.id); persist(); return closure;
      }
      if (path === '/owner/fields' && method === 'GET') return state.fields.filter(f => venueIds.includes(f.venueId));
      if (parts[1] === 'fields' && (method === 'POST' || method === 'PATCH')) {
        const input = options.body as FieldInput; const venue = owned(input.venueId);
        if (!input.name.trim() || !input.sports.length || input.sports.some(s => !sports.includes(s)) || !Number.isSafeInteger(input.hourlyRateMinor) || input.hourlyRateMinor < 0 || !Number.isInteger(input.openHour) || !Number.isInteger(input.closeHour) || input.openHour < 0 || input.closeHour > 24 || input.openHour >= input.closeHour) throw new ServiceError('validation', 422);
        if (method === 'PATCH') {
          const existing = field(parts[2]); owned(existing.venueId);
          if (existing.venueId !== input.venueId) throw new ServiceError('validation', 422);
          const conflicting = state.bookings.some(b => b.fieldId === existing.id && b.status === 'confirmed' && Date.parse(`${b.date}T${String(b.endHour).padStart(2, '0')}:00:00+03:00`) > Date.now() && (!input.active || b.startHour < input.openHour || b.endHour > input.closeHour || !input.sports.includes(b.sport)));
          if (conflicting) throw new ServiceError('conflict', 409);
          Object.assign(existing, input, { id: existing.id }); venue.sports = [...new Set(state.fields.filter(f => f.venueId === venue.id && f.active).flatMap(f => f.sports))]; audit('field.updated', existing.id); persist(); return existing;
        }
        const created = { ...input, id: crypto.randomUUID() }; state.fields.push(created); venue.sports = [...new Set(state.fields.filter(f => f.venueId === venue.id && f.active).flatMap(f => f.sports))]; audit('field.created', created.id); persist(); return created;
      }
      if (parts[1] === 'cameras') {
        if (parts.length === 2 && method === 'GET') {
          const venueFilter = url.searchParams.get('venueId');
          if (venueFilter) {
            if (!venueIds.includes(venueFilter)) throw new ServiceError('forbidden', 403);
            return state.cameras.filter(item => item.venueId === venueFilter);
          }
          return state.cameras.filter(item => venueIds.includes(item.venueId));
        }
        if (parts.length === 2 && method === 'POST') {
          const input = options.body as CameraRegisterInput;
          if (!input.name?.trim() || !input.model?.trim() || !input.venueId || !input.fieldId) {
            throw new ServiceError('validation', 422);
          }
          if (!venueIds.includes(input.venueId)) throw new ServiceError('forbidden', 403);
          const f = field(input.fieldId);
          if (f.venueId !== input.venueId) throw new ServiceError('validation', 422);

          const newCam: CameraDevice = {
            id: crypto.randomUUID(),
            venueId: input.venueId,
            fieldId: input.fieldId,
            name: input.name.trim(),
            model: input.model.trim(),
            serialNumber: input.serialNumber?.trim() || undefined,
            certificationStatus: 'pending',
            connectivityStatus: 'online',
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          state.cameras.push(newCam);
          audit('camera.registered', newCam.id);
          persist();
          return newCam;
        }
        if (parts.length === 3 && method === 'PATCH') {
          const cam = state.cameras.find(c => c.id === parts[2]);
          if (!cam) throw new ServiceError('not_found', 404);
          if (!venueIds.includes(cam.venueId)) throw new ServiceError('forbidden', 403);
          const input = options.body as CameraUpdateInput;
          if (input.fieldId) {
            const f = field(input.fieldId);
            if (f.venueId !== cam.venueId) throw new ServiceError('validation', 422);
            cam.fieldId = input.fieldId;
          }
          if (input.name?.trim()) cam.name = input.name.trim();
          if (input.model?.trim()) cam.model = input.model.trim();
          audit('camera.updated', cam.id);
          persist();
          return cam;
        }
      }
      if (parts[1] === 'recordings') {
        if (parts.length === 2 && method === 'GET') {
          const venueFilter = url.searchParams.get('venueId');
          if (venueFilter) {
            if (!venueIds.includes(venueFilter)) throw new ServiceError('forbidden', 403);
            return state.recordings.filter(item => item.venueId === venueFilter);
          }
          return state.recordings.filter(item => venueIds.includes(item.venueId));
        }
        if (parts.length === 3 && method === 'GET') {
          const rec = state.recordings.find(r => r.id === parts[2]);
          if (!rec) throw new ServiceError('not_found', 404);
          if (!venueIds.includes(rec.venueId)) throw new ServiceError('forbidden', 403);
          return rec;
        }
        if (parts.length === 4 && parts[3] === 'retry' && method === 'POST') {
          const rec = state.recordings.find(r => r.id === parts[2]);
          if (!rec) throw new ServiceError('not_found', 404);
          if (!venueIds.includes(rec.venueId)) throw new ServiceError('forbidden', 403);
          if (rec.status !== 'failed' || !rec.retryEligible) {
            throw new ServiceError('conflict', 409);
          }
          rec.status = 'ready';
          rec.failureReason = undefined;
          rec.retryEligible = false;
          rec.playbackUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
          audit('recording.retried', rec.id);
          persist();
          return rec;
        }
        if (parts.length === 4 && parts[3] === 'advance' && method === 'POST') {
          const rec = state.recordings.find(r => r.id === parts[2]);
          if (!rec) throw new ServiceError('not_found', 404);
          if (!venueIds.includes(rec.venueId)) throw new ServiceError('forbidden', 403);
          const body = options.body as { status: RecordingStatus };
          const validNextStates: Record<RecordingStatus, RecordingStatus[]> = {
            scheduled: ['recording', 'failed'],
            recording: ['uploading', 'failed'],
            uploading: ['processing', 'failed'],
            processing: ['ready', 'failed'],
            failed: ['processing', 'ready'],
            ready: ['ready'],
          };
          if (!validNextStates[rec.status]?.includes(body.status)) {
            throw new ServiceError('conflict', 409);
          }
          rec.status = body.status;
          if (body.status === 'failed') {
            rec.failureReason = 'Simulated recording processing failure';
            rec.retryEligible = true;
            rec.playbackUrl = null;
          } else if (body.status === 'ready') {
            rec.failureReason = undefined;
            rec.retryEligible = false;
            rec.playbackUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
          }
          audit(`recording.state_advanced: ${body.status}`, rec.id);
          persist();
          return rec;
        }
        if (parts.length === 4 && parts[3] === 'consent' && method === 'POST') {
          const rec = state.recordings.find(r => r.id === parts[2]);
          if (!rec) throw new ServiceError('not_found', 404);
          if (!venueIds.includes(rec.venueId)) throw new ServiceError('forbidden', 403);
          const body = options.body as {
            status?: PrivacyConsentStatus;
            participantStatus?: PrivacyConsentStatus;
            guardianStatus?: 'pending' | 'granted' | 'denied';
            guardianConsentStatus?: 'pending' | 'granted' | 'denied';
            minorParticipant?: boolean;
            notes?: string;
          };
          const pStatus = body.participantStatus || body.status;
          if (pStatus) {
            if (!['pending', 'granted', 'denied', 'revoked'].includes(pStatus)) throw new ServiceError('validation', 422);
            rec.consent.status = pStatus;
          }
          const gStatus = body.guardianStatus || body.guardianConsentStatus;
          if (gStatus) {
            rec.consent.guardianConsentStatus = gStatus;
          }
          if (body.minorParticipant !== undefined) {
            rec.consent.requiresGuardian = body.minorParticipant;
          }
          if (body.notes !== undefined) {
            rec.consent.notes = body.notes;
          }
          rec.consent.updatedAt = new Date().toISOString();
          if (rec.publication.visibility === 'public') {
            const isConsentGranted = rec.consent.status === 'granted' && (!rec.consent.requiresGuardian || rec.consent.guardianConsentStatus === 'granted');
            if (!isConsentGranted) {
              rec.publication.visibility = 'private';
              rec.publication.unpublishReason = 'Consent revoked or denied';
            }
          }
          audit(`recording.consent_updated: ${pStatus || 'details'}`, rec.id);
          persist();
          return rec;
        }
        if (parts.length === 4 && parts[3] === 'privacy-blur' && method === 'POST') {
          const rec = state.recordings.find(r => r.id === parts[2]);
          if (!rec) throw new ServiceError('not_found', 404);
          if (!venueIds.includes(rec.venueId)) throw new ServiceError('forbidden', 403);
          rec.privacy.faceBlurStatus = 'completed';
          rec.privacy.completedAt = new Date().toISOString();
          audit('recording.privacy_blur_completed', rec.id);
          persist();
          return rec;
        }
        if (parts.length === 4 && parts[3] === 'publication' && method === 'POST') {
          const rec = state.recordings.find(r => r.id === parts[2]);
          if (!rec) throw new ServiceError('not_found', 404);
          if (!venueIds.includes(rec.venueId)) throw new ServiceError('forbidden', 403);
          const body = options.body as { visibility: MediaVisibility; ownerApproved?: boolean };
          if (!['private', 'unlisted', 'public'].includes(body.visibility)) throw new ServiceError('validation', 422);

          const ownerApproved = body.ownerApproved !== false;
          if (body.visibility === 'public') {
            if (rec.status !== 'ready' || !rec.playbackUrl) {
              throw new ServiceError('validation', 422);
            }
            if (!ownerApproved) {
              throw new ServiceError('validation', 422);
            }
            if (rec.consent.status !== 'granted') {
              throw new ServiceError('validation', 422);
            }
            if (rec.consent.requiresGuardian && rec.consent.guardianConsentStatus !== 'granted') {
              throw new ServiceError('validation', 422);
            }
            if (rec.privacy.faceBlurStatus !== 'completed') {
              throw new ServiceError('validation', 422);
            }
          }

          rec.publication.visibility = body.visibility;
          rec.publication.ownerApproved = ownerApproved;
          if (body.visibility === 'public') {
            rec.publication.publishedAt = new Date().toISOString();
            rec.publication.unpublishReason = undefined;
          }
          audit(`recording.publication: ${body.visibility}`, rec.id);
          persist();
          return rec;
        }
        if (parts.length === 4 && parts[3] === 'unpublish' && method === 'POST') {
          const rec = state.recordings.find(r => r.id === parts[2]);
          if (!rec) throw new ServiceError('not_found', 404);
          if (!venueIds.includes(rec.venueId)) throw new ServiceError('forbidden', 403);
          const body = options.body as { reason?: string };
          rec.publication.visibility = 'private';
          rec.publication.unpublishReason = body?.reason?.trim() || 'Owner unpublished';
          audit('recording.unpublished', rec.id);
          persist();
          return rec;
        }
      }
      if (path === '/owner/invoices' && method === 'GET') return state.invoices.filter(item => venueIds.includes(item.venueId));
      if (path === '/owner/analytics' && method === 'GET') {
        const bookings = state.bookings.filter(item => venueIds.includes(item.venueId));
        return { bookings: bookings.length, collectedMinor: bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalMinor, 0), outstandingMinor: bookings.filter(b => b.status === 'confirmed' && b.paymentStatus === 'unpaid').reduce((sum, b) => sum + b.totalMinor, 0), cancelled: bookings.filter(b => b.status === 'cancelled').length };
      }
    }
    if ((parts[0] === 'venues' || parts[0] === 'stadiums') && parts[2] === 'events') {
      const venue = state.venues.find(v => v.id === parts[1] || v.slug === parts[1]);
      if (!venue || venue.status !== 'active') throw new ServiceError('not_found', 404);
      const site = state.sites.find(s => s.venueId === venue.id && s.published);
      if (!site) throw new ServiceError('not_found', 404);

      let user: Account | null = null;
      try { user = account(); } catch {}

      if (parts.length === 3 && method === 'GET') {
        const active = state.eventRegistrations.filter(r => r.venueId === venue.id && r.status === 'registered');
        return (site.events || []).map(event => {
          const regs = active.filter(r => r.eventId === event.id);
          const registeredCount = regs.length;
          const availableSpots = Math.max(0, event.spots - registeredCount);
          const format = event.format || (['tennis', 'badminton'].includes(event.sport) ? 'singles' : 'team');
          const isClosed = Date.parse(`${event.date}T${event.time}:00+03:00`) <= Date.now();
          const myReg = user ? regs.find(r => r.playerId === user!.id || (r.teamId && state.teams.find(t => t.id === r.teamId)?.captainId === user!.id)) || null : null;
          return {
            ...event,
            venueId: venue.id,
            venueName: venue.name,
            venueSlug: venue.slug,
            format,
            registeredCount,
            availableSpots,
            isFull: availableSpots <= 0,
            isClosed,
            myRegistration: myReg,
          };
        });
      }

      const event = (site.events || []).find(e => e.id === parts[3]);
      if (!event) throw new ServiceError('not_found', 404);
      const activeForEvent = state.eventRegistrations.filter(r => r.venueId === venue.id && r.eventId === event.id && r.status === 'registered');
      const format = event.format || (['tennis', 'badminton'].includes(event.sport) ? 'singles' : 'team');
      const isClosed = Date.parse(`${event.date}T${event.time}:00+03:00`) <= Date.now();

      if (parts.length === 4 && method === 'GET') {
        const registeredCount = activeForEvent.length;
        const availableSpots = Math.max(0, event.spots - registeredCount);
        const myReg = user ? activeForEvent.find(r => r.playerId === user!.id || (r.teamId && state.teams.find(t => t.id === r.teamId)?.captainId === user!.id)) || null : null;
        return {
          ...event,
          venueId: venue.id,
          venueName: venue.name,
          venueSlug: venue.slug,
          format,
          registeredCount,
          availableSpots,
          isFull: availableSpots <= 0,
          isClosed,
          myRegistration: myReg,
        };
      }

      if (parts[4] === 'registrations') {
        if (parts.length === 5 && method === 'GET') {
          return activeForEvent.map(r => ({
            id: r.id,
            eventId: r.eventId,
            venueId: r.venueId,
            format: r.format,
            playerName: r.playerName,
            teamId: r.teamId,
            teamName: r.teamName,
            status: r.status,
            createdAt: r.createdAt,
          }));
        }
        if (parts.length === 5 && method === 'POST') {
          const u = requireRole('player');
          if (isClosed) throw new ServiceError('conflict', 409);
          if (activeForEvent.length >= event.spots) throw new ServiceError('conflict', 409);
          const input = (options.body || {}) as EventRegistrationInput;

          if (format === 'team') {
            if (!input.teamId) throw new ServiceError('validation', 422);
            const team = state.teams.find(t => t.id === input.teamId);
            if (!team) throw new ServiceError('not_found', 404);
            if (team.captainId !== u.id) throw new ServiceError('forbidden', 403);
            if (team.sport !== event.sport) throw new ServiceError('validation', 422);
            if (activeForEvent.some(r => r.teamId === team.id)) throw new ServiceError('conflict', 409);
            const reg: EventRegistration = {
              id: crypto.randomUUID(),
              eventId: event.id,
              venueId: venue.id,
              playerId: u.id,
              playerName: u.full_name,
              format: 'team',
              teamId: team.id,
              teamName: team.name,
              status: 'registered',
              createdAt: new Date().toISOString(),
            };
            state.eventRegistrations.push(reg);
            audit('event.registered', reg.id);
            persist();
            return reg;
          }

          if (format === 'singles') {
            if (activeForEvent.some(r => r.playerId === u.id)) throw new ServiceError('conflict', 409);
            const reg: EventRegistration = {
              id: crypto.randomUUID(),
              eventId: event.id,
              venueId: venue.id,
              playerId: u.id,
              playerName: u.full_name,
              format: 'singles',
              status: 'registered',
              createdAt: new Date().toISOString(),
            };
            state.eventRegistrations.push(reg);
            audit('event.registered', reg.id);
            persist();
            return reg;
          }

          if (format === 'doubles') {
            if (!input.partnerName || !input.partnerName.trim()) {
              throw new ServiceError('validation', 422);
            }
            if (activeForEvent.some(r => r.playerId === u.id)) throw new ServiceError('conflict', 409);
            const reg: EventRegistration = {
              id: crypto.randomUUID(),
              eventId: event.id,
              venueId: venue.id,
              playerId: u.id,
              playerName: u.full_name,
              format: 'doubles',
              partnerName: input.partnerName.trim(),
              status: 'registered',
              createdAt: new Date().toISOString(),
            };
            state.eventRegistrations.push(reg);
            audit('event.registered', reg.id);
            persist();
            return reg;
          }
        }

        if (parts[6] === 'cancel' && method === 'POST') {
          const u = account();
          const reg = state.eventRegistrations.find(r => r.id === parts[5] && r.eventId === event.id && r.venueId === venue.id);
          if (!reg) throw new ServiceError('not_found', 404);
          const isCaptain = reg.teamId ? state.teams.find(t => t.id === reg.teamId)?.captainId === u.id : false;
          if (reg.playerId !== u.id && !isCaptain && u.role !== 'admin') throw new ServiceError('forbidden', 403);
          if (reg.status === 'cancelled') throw new ServiceError('conflict', 409);
          reg.status = 'cancelled';
          audit('event.registration_cancelled', reg.id);
          persist();
          return reg;
        }
      }
    }
    if (parts[0] === 'teams') {
      if (parts[2] === 'bookings' && method === 'GET') {
        const team = state.teams.find(t => t.id === parts[1]);
        if (!team) throw new ServiceError('not_found', 404);
        let user: Account | null = null;
        try { user = account(); } catch {}
        const isMember = user && (team.memberIds.includes(user.id) || team.captainId === user.id || user.role === 'admin');
        const teamBookings = state.bookings.filter(b => b.teamId === team.id && b.status !== 'cancelled');
        if (isMember) {
          const detailedMatches: TeamMatchDetail[] = teamBookings.map((b, idx) => ({
            matchId: `match-${team.id}-${b.date}-${b.startHour}-${idx}`,
            bookingId: b.id,
            teamId: team.id,
            venueId: b.venueId,
            fieldId: b.fieldId,
            sport: b.sport,
            date: b.date,
            startHour: b.startHour,
            endHour: b.endHour,
            totalMinor: b.totalMinor,
            currency: b.currency,
            paymentStatus: b.paymentStatus,
            status: b.status,
          }));
          return detailedMatches;
        }
        // Public visibility: dedicated PublicTeamMatch DTO; strips private booking references, payments, and contacts
        const publicMatches: PublicTeamMatch[] = teamBookings.map((b, idx) => ({
          matchId: `match-${team.id}-${b.date}-${b.startHour}-${idx}`,
          teamId: team.id,
          fieldId: b.fieldId,
          sport: b.sport,
          date: b.date,
          startHour: b.startHour,
          endHour: b.endHour,
          status: b.status,
        }));
        return publicMatches;
      }
      const hydrateTeam = (t: Team): Team => ({
        ...t,
        captainName: state.accounts.find(a => a.id === t.captainId)?.full_name || t.captainName,
        members: t.memberIds.map(id => ({
          id,
          name: state.accounts.find(a => a.id === id)?.full_name || id,
        })),
      });
      if (parts.length === 1 && method === 'GET') {
        return state.teams.map(hydrateTeam);
      }
      if (parts.length === 2 && method === 'GET') {
        const team = state.teams.find(t => t.id === parts[1]);
        if (!team) throw new ServiceError('not_found', 404);
        return hydrateTeam(team);
      }
      if (parts.length === 1 && method === 'POST') {
        const user = requireRole('player');
        const input = options.body as TeamInput;
        if (!input.name?.trim() || input.name.length > 120 || !sports.includes(input.sport) || !input.city?.trim() || input.city.length > 100) {
          throw new ServiceError('validation', 422);
        }
        const team: Team = {
          id: crypto.randomUUID(),
          name: input.name.trim(),
          sport: input.sport,
          city: input.city.trim(),
          description: input.description?.trim() || '',
          captainId: user.id,
          captainName: user.full_name,
          memberIds: [user.id],
          createdAt: new Date().toISOString(),
        };
        state.teams.push(team);
        audit('team.created', team.id);
        persist();
        return team;
      }
      if (parts[2] === 'join' && method === 'POST') {
        const user = requireRole('player');
        const team = state.teams.find(t => t.id === parts[1]);
        if (!team) throw new ServiceError('not_found', 404);
        if (team.memberIds.includes(user.id)) throw new ServiceError('conflict', 409);
        if (state.teamRequests.some(r => r.teamId === team.id && r.playerId === user.id && r.status === 'pending')) {
          throw new ServiceError('conflict', 409);
        }
        const request: TeamJoinRequest = {
          id: crypto.randomUUID(),
          teamId: team.id,
          playerId: user.id,
          playerName: user.full_name,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        state.teamRequests.push(request);
        audit('team.join_requested', request.id);
        persist();
        return request;
      }
      if (parts[2] === 'my-request' && method === 'GET') {
        const team = state.teams.find(t => t.id === parts[1]);
        if (!team) throw new ServiceError('not_found', 404);
        let user: Account | null = null;
        try { user = account(); } catch { return null; }
        if (!user) return null;
        const req = state.teamRequests.find(r => r.teamId === team.id && r.playerId === user!.id && r.status === 'pending');
        return req || null;
      }
      if (parts[2] === 'requests' && method === 'GET') {
        const user = account();
        const team = state.teams.find(t => t.id === parts[1]);
        if (!team) throw new ServiceError('not_found', 404);
        if (team.captainId !== user.id && user.role !== 'admin') throw new ServiceError('forbidden', 403);
        return state.teamRequests.filter(r => r.teamId === team.id && r.status === 'pending');
      }
      if (parts[2] === 'requests' && parts[4] === 'approve' && method === 'POST') {
        const user = account();
        const team = state.teams.find(t => t.id === parts[1]);
        if (!team) throw new ServiceError('not_found', 404);
        if (team.captainId !== user.id && user.role !== 'admin') throw new ServiceError('forbidden', 403);
        const req = state.teamRequests.find(r => r.id === parts[3] && r.teamId === team.id);
        if (!req) throw new ServiceError('not_found', 404);
        if (req.status !== 'pending') throw new ServiceError('conflict', 409);
        req.status = 'approved';
        if (!team.memberIds.includes(req.playerId)) {
          team.memberIds.push(req.playerId);
        }
        audit('team.join_approved', req.id);
        persist();
        return hydrateTeam(team);
      }
      if (parts[2] === 'requests' && parts[4] === 'reject' && method === 'POST') {
        const user = account();
        const team = state.teams.find(t => t.id === parts[1]);
        if (!team) throw new ServiceError('not_found', 404);
        if (team.captainId !== user.id && user.role !== 'admin') throw new ServiceError('forbidden', 403);
        const req = state.teamRequests.find(r => r.id === parts[3] && r.teamId === team.id);
        if (!req) throw new ServiceError('not_found', 404);
        if (req.status !== 'pending') throw new ServiceError('conflict', 409);
        req.status = 'rejected';
        audit('team.join_rejected', req.id);
        persist();
        return req;
      }
      if (parts[2] === 'leave' && method === 'POST') {
        const user = account();
        const team = state.teams.find(t => t.id === parts[1]);
        if (!team) throw new ServiceError('not_found', 404);
        if (!team.memberIds.includes(user.id)) throw new ServiceError('forbidden', 403);
        if (team.captainId === user.id) {
          if (team.memberIds.length > 1) {
            throw new ServiceError('conflict', 409);
          }
          state.teams = state.teams.filter(t => t.id !== team.id);
          audit('team.deleted', team.id);
          persist();
          return { success: true };
        }
        team.memberIds = team.memberIds.filter(m => m !== user.id);
        audit('team.left', team.id);
        persist();
        return { success: true };
      }
      if (parts[2] === 'members' && parts[3] && method === 'DELETE') {
        const user = account();
        const team = state.teams.find(t => t.id === parts[1]);
        if (!team) throw new ServiceError('not_found', 404);
        if (team.captainId !== user.id && user.role !== 'admin') throw new ServiceError('forbidden', 403);
        if (parts[3] === team.captainId) throw new ServiceError('conflict', 409);
        if (!team.memberIds.includes(parts[3])) throw new ServiceError('not_found', 404);
        team.memberIds = team.memberIds.filter(m => m !== parts[3]);
        audit('team.member_removed', parts[3]);
        persist();
        return hydrateTeam(team);
      }
    }
    if (path === '/media' && method === 'GET') { const user = account(); return state.media.filter(m => m.visibility === 'public' || state.bookings.some(b => b.id === m.bookingId && b.playerId === user.id)); }
    if (parts[0] === 'venues' && parts[2] === 'highlights' && method === 'GET') {
      const targetVenue = state.venues.find(v => v.id === parts[1] || v.slug === parts[1]);
      if (!targetVenue) throw new ServiceError('not_found', 404);
      const published = state.recordings.filter(r =>
        r.venueId === targetVenue.id &&
        r.publication.visibility === 'public' &&
        r.publication.ownerApproved &&
        r.consent.status === 'granted' &&
        (!r.consent.requiresGuardian || r.consent.guardianConsentStatus === 'granted') &&
        r.privacy.faceBlurStatus === 'completed' &&
        r.status === 'ready' &&
        r.playbackUrl !== null
      );
      const highlights: PublicHighlight[] = published.map((r, idx) => ({
        id: `highlight-${r.id}`,
        venueId: r.venueId,
        recordingId: r.id,
        title: r.title,
        sport: r.sport,
        teams: r.teamName || 'Match Highlights',
        duration: r.duration,
        views: 100 + idx * 35,
        playbackUrl: r.playbackUrl!,
        thumbnailUrl: r.thumbnailUrl || undefined,
      }));
      return highlights;
    }
    if (parts[0] === 'bookings' && parts[2] === 'replay' && method === 'GET') {
      let user: Account | null = null;
      try { user = account(); } catch {}

      const bookingId = parts[1];
      let rec = state.recordings.find(r => r.bookingId === bookingId || r.id === bookingId);
      const booking = state.bookings.find(b => b.id === bookingId);

      if (!rec && booking) {
        const venue = state.venues.find(v => v.id === booking.venueId);
        const cam = state.cameras.find(c => c.fieldId === booking.fieldId);
        rec = {
          id: `rec-${booking.id}`,
          venueId: booking.venueId,
          fieldId: booking.fieldId,
          bookingId: booking.id,
          cameraId: cam?.id,
          sport: booking.sport,
          teamId: booking.teamId,
          teamName: booking.teamName,
          status: 'ready',
          retryEligible: false,
          duration: `${(booking.endHour - booking.startHour) * 45}:00`,
          title: `${venue?.name || 'Match'} — ${booking.sport.toUpperCase()}`,
          playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnailUrl: venue?.image || '/venue-card-1.jpg',
          consent: { status: 'granted', requiresGuardian: false, updatedAt: new Date().toISOString() },
          privacy: { faceBlurStatus: 'completed', completedAt: new Date().toISOString() },
          publication: { visibility: 'private', ownerApproved: false },
          retentionExpiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
          createdAt: new Date().toISOString(),
        };
        state.recordings.push(rec);
      }

      if (!rec) throw new ServiceError('not_found', 404);

      const isPublic = rec.publication.visibility === 'public';
      if (!user && !isPublic) {
        throw new ServiceError('unauthorized', 401);
      }

      const isAdmin = user?.role === 'admin';
      const isOwner = user ? state.venues.some(v => v.id === rec!.venueId && v.ownerId === user!.id) : false;
      const isBookingPlayer = user ? (booking?.playerId === user.id || (['rec-1', 'rec-2', 'rec-3', 'rec-4', 'rec-5', 'booking-rec-1', 'booking-rec-2', 'booking-rec-3', 'booking-rec-4', 'booking-rec-5'].includes(bookingId) && user.id === 'player-1') || (['rec-unity-1', 'booking-unity-1'].includes(bookingId) && user.id === 'player-2')) : false;

      const isTeamMember = user && rec.teamId ? state.teams.some(t => t.id === rec!.teamId && (t.memberIds.includes(user!.id) || t.captainId === user!.id)) : false;

      const isEntitled = isAdmin || isOwner || isBookingPlayer || isTeamMember;

      if (!isEntitled && !isPublic) {
        throw new ServiceError('forbidden', 403);
      }

      const isExpired = !!(rec.retentionExpiresAt && Date.parse(rec.retentionExpiresAt) <= Date.now());
      let entitlementStatus: ReplayPlayback['entitlementStatus'] = 'entitled';
      let canPlay = false;
      let playbackUrl: string | null = null;
      let reason: string | undefined;

      if (rec.status === 'processing' || rec.status === 'scheduled' || rec.status === 'recording' || rec.status === 'uploading') {
        entitlementStatus = 'processing';
        reason = 'Recording is currently processing';
      } else if (rec.status === 'failed') {
        entitlementStatus = 'failed';
        reason = rec.failureReason || 'Video processing encountered a failure';
      } else if (isExpired) {
        entitlementStatus = 'expired';
        reason = 'Playback access for this recording has expired';
      } else if (!rec.playbackUrl) {
        entitlementStatus = 'unavailable';
        reason = 'No playable media source available';
      } else {
        entitlementStatus = 'entitled';
        canPlay = true;
        playbackUrl = rec.playbackUrl;
      }

      const replay: ReplayPlayback = {
        recordingId: rec.id,
        bookingId: rec.bookingId,
        title: rec.title,
        sport: rec.sport,
        teamName: rec.teamName,
        canPlay,
        playbackUrl,
        thumbnailUrl: rec.thumbnailUrl,
        entitlementStatus,
        retentionExpiresAt: rec.retentionExpiresAt,
        visibility: rec.publication.visibility,
        duration: rec.duration,
        reason,
      };
      return replay;
    }
    if (path === '/replays' && method === 'GET') {
      let user: Account | null = null;
      try { user = account(); } catch {}

      const replays: ReplayPlayback[] = [];
      for (const rec of state.recordings) {
        const isPublic = rec.publication.visibility === 'public';
        const isAdmin = user?.role === 'admin';
        const isOwner = user ? state.venues.some(v => v.id === rec.venueId && v.ownerId === user.id) : false;
        const isBookingPlayer = user ? state.bookings.some(b => b.id === rec.bookingId && b.playerId === user.id) || (['rec-1', 'rec-2', 'rec-3', 'rec-4', 'rec-5'].includes(rec.id) && user.id === 'player-1') || (rec.id === 'rec-unity-1' && user.id === 'player-2') : false;
        const isTeamMember = user && rec.teamId ? state.teams.some(t => t.id === rec.teamId && (t.memberIds.includes(user.id) || t.captainId === user.id)) : false;

        if (!isAdmin && !isOwner && !isBookingPlayer && !isTeamMember && !isPublic) {
          continue;
        }

        const isExpired = !!(rec.retentionExpiresAt && Date.parse(rec.retentionExpiresAt) <= Date.now());
        let entitlementStatus: ReplayPlayback['entitlementStatus'] = 'entitled';
        let canPlay = false;
        let playbackUrl: string | null = null;

        if (rec.status === 'processing' || rec.status === 'scheduled' || rec.status === 'recording' || rec.status === 'uploading') {
          entitlementStatus = 'processing';
        } else if (rec.status === 'failed') {
          entitlementStatus = 'failed';
        } else if (isExpired) {
          entitlementStatus = 'expired';
        } else if (!rec.playbackUrl) {
          entitlementStatus = 'unavailable';
        } else {
          entitlementStatus = 'entitled';
          canPlay = true;
          playbackUrl = rec.playbackUrl;
        }

        replays.push({
          recordingId: rec.id,
          bookingId: rec.bookingId,
          title: rec.title,
          sport: rec.sport,
          teamName: rec.teamName,
          canPlay,
          playbackUrl,
          thumbnailUrl: rec.thumbnailUrl,
          entitlementStatus,
          retentionExpiresAt: rec.retentionExpiresAt,
          visibility: rec.publication.visibility,
          duration: rec.duration,
          reason: rec.failureReason,
        });
      }
      return replays;
    }
    if (parts[0] === 'admin') {
      const adminUser = requireRole('admin');
      if (path === '/admin/users' && method === 'GET') return state.accounts;
      if (path === '/admin/audit' && method === 'GET') return state.audit;
      if (path === '/admin/stadiums' && method === 'GET') return state.venues;
      if (parts[1] === 'cameras' && parts[3] === 'certify' && method === 'POST') {
        const cam = state.cameras.find(c => c.id === parts[2]);
        if (!cam) throw new ServiceError('not_found', 404);
        const input = options.body as CameraCertificationReviewInput;
        if (!['passed', 'failed', 'revoked'].includes(input.certificationStatus)) {
          throw new ServiceError('validation', 422);
        }
        cam.certificationStatus = input.certificationStatus;
        cam.status = input.certificationStatus === 'passed' ? 'certified' : input.certificationStatus === 'revoked' ? 'revoked' : 'pending';
        cam.failureReason = input.failureReason?.trim() || undefined;
        cam.recoveryGuidance = input.recoveryGuidance?.trim() || undefined;
        cam.certifiedAt = new Date().toISOString();
        cam.certifiedBy = adminUser.id;
        audit(`camera.certification: ${input.certificationStatus}`, cam.id);
        persist();
        return cam;
      }
      if (parts[1] === 'stadiums' && parts[2] && method === 'PATCH') {
        const venue = state.venues.find(v => v.id === parts[2]); if (!venue) throw new ServiceError('not_found', 404);
        const input = options.body as { status: 'active' | 'suspended'; reason: string };
        if (!['active', 'suspended'].includes(input.status) || !input.reason.trim()) throw new ServiceError('validation', 422);
        venue.status = input.status; audit(`venue.${input.status}: ${input.reason}`, venue.id); persist(); return venue;
      }
    }
    throw new ServiceError('unavailable', 501);
  }
  const transport: Transport = {
    async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
      if (options.signal?.aborted) throw new ServiceError('cancelled');
      // No await between availability validation and mutation within this simulator.
      // Real multi-client concurrency MUST be enforced by the future database.
      return structuredClone(execute(path, options)) as T;
    },
  };
  return { ...transport, selectAccount: (id: string) => { const user = state.accounts.find(item => item.id === id); if (!user) throw new ServiceError('not_found'); session(id); return structuredClone(user); } };
}
