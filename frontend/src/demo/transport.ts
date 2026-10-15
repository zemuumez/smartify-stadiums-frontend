import type { Account, BookingInput, Closure, Microsite, RequestOptions, Role, Sport, Transport, VenueInput } from '../services/contracts';
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
      if (Array.isArray(parsed.venues) && Array.isArray(parsed.accounts) && Array.isArray(parsed.bookings) && Array.isArray(parsed.fields) && Array.isArray(parsed.drafts) && parsed.idempotency) state = parsed;
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
    const user = state.accounts.find(item => item.id === currentId);
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
      const key = `${user.id}:${input.idempotencyKey}`; const fingerprint = JSON.stringify(input);
      const previous = state.idempotency[key];
      if (previous) {
        if (previous.fingerprint !== fingerprint) throw new ServiceError('conflict', 409);
        return state.bookings.find(b => b.id === previous.bookingId);
      }
      if (!available(item.id, input.date, input.startHour, input.endHour)) throw new ServiceError('conflict', 409);
      const booking = { id: crypto.randomUUID(), venueId: item.venueId, fieldId: item.id, playerId: user.id, sport: input.sport, date: input.date, startHour: input.startHour, endHour: input.endHour, totalMinor: quoteMinor(item.hourlyRateMinor, input.startHour, input.endHour), currency: 'ETB' as const, status: 'confirmed' as const, paymentStatus: 'unpaid' as const, createdAt: new Date().toISOString() };
      state.bookings.push(booking); state.idempotency[key] = { fingerprint, bookingId: booking.id }; audit('booking.created', booking.id); persist(); return booking;
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
    if (parts[0] === 'owner') {
      const user = account(); if (!['owner', 'admin'].includes(user.role)) throw new ServiceError('forbidden', 403);
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
            if ((input.highlights || []).length > 30 || (input.events || []).length > 30) throw new ServiceError('validation', 422);
            if ((input.highlights || []).some(h => !h.title.trim() || h.title.length > 200 || (h.playbackUrl && !/^https:\/\//.test(h.playbackUrl))) || (input.events || []).some(e => !e.title.trim() || e.title.length > 200 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time) || !sports.includes(e.sport) || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || !Number.isInteger(e.spots) || e.spots < 0)) throw new ServiceError('validation', 422);
            Object.assign(draft, { highlights: structuredClone(input.highlights || []), events: structuredClone(input.events || []), tagline: input.tagline, description: input.description, primaryColor: input.primaryColor, updatedAt: new Date().toISOString() }); persist(); return draft;
          }
          if (parts[4] === 'publish' && method === 'POST') {
            if (venue.status !== 'active') throw new ServiceError('conflict', 409);
            const site = { ...draft, published: true }; state.sites = [...state.sites.filter(item => item.venueId !== venue.id), site]; audit('microsite.published', venue.id); persist(); return site;
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
      if (path === '/owner/cameras' && method === 'GET') return state.cameras.filter(item => venueIds.includes(item.venueId));
      if (path === '/owner/invoices' && method === 'GET') return state.invoices.filter(item => venueIds.includes(item.venueId));
      if (path === '/owner/analytics' && method === 'GET') {
        const bookings = state.bookings.filter(item => venueIds.includes(item.venueId));
        return { bookings: bookings.length, collectedMinor: bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalMinor, 0), outstandingMinor: bookings.filter(b => b.status === 'confirmed' && b.paymentStatus === 'unpaid').reduce((sum, b) => sum + b.totalMinor, 0), cancelled: bookings.filter(b => b.status === 'cancelled').length };
      }
    }
    if (parts[0] === 'teams') {
      if (method === 'GET') { if (!parts[1]) return state.teams; const team = state.teams.find(t => t.id === parts[1]); if (!team) throw new ServiceError('not_found', 404); return team; }
      if (method === 'POST') {
        const user = requireRole('player'); const input = options.body as { name: string; sport: Sport; city: string };
        if (!input.name.trim() || !sports.includes(input.sport)) throw new ServiceError('validation', 422);
        const team = { ...input, id: crypto.randomUUID(), captainId: user.id, memberIds: [user.id] }; state.teams.push(team); persist(); return team;
      }
    }
    if (path === '/media' && method === 'GET') { const user = account(); return state.media.filter(m => m.visibility === 'public' || state.bookings.some(b => b.id === m.bookingId && b.playerId === user.id)); }
    if (parts[0] === 'admin') {
      requireRole('admin');
      if (path === '/admin/users' && method === 'GET') return state.accounts;
      if (path === '/admin/audit' && method === 'GET') return state.audit;
      if (path === '/admin/stadiums' && method === 'GET') return state.venues;
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
