import type { Account, AuditEntry, Booking, CameraDevice, Closure, CommercialPolicy, Field, Invoice, MediaAsset, Microsite, Team, Venue } from '../services/contracts';

/** All operational demo records live here. Amounts are illustrative minor ETB units. */
export const accounts: Account[] = [
  { id: 'player-1', phone: '+251911234567', full_name: 'Abebe Kebede', role: 'player', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z' },
  { id: 'owner-1', phone: '+251922345678', full_name: 'Fatima Hassan', role: 'owner', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z' },
  { id: 'owner-2', phone: '+251933456789', full_name: 'Dawit Tadesse', role: 'owner', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z' },
  { id: 'admin-1', phone: '+251944567890', full_name: 'Demo Administrator', role: 'admin', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z' },
];
export const demoOTP = '123456';
const venues: Venue[] = [
  { id: 'venue-1', ownerId: 'owner-1', slug: 'bambis-meda', name: 'Bambis Meda Stadium', city: 'Addis Ababa', address: 'Bole Road, Addis Ababa', description: 'Football, futsal and basketball in the heart of Bole.', phone: '+251922345678', image: '/venue-card-1.jpg', sports: ['football', 'basketball', 'futsal'], status: 'active', verified: true, rating: null, reviewCount: 0, timezone: 'Africa/Addis_Ababa' },
  { id: 'venue-2', ownerId: 'owner-2', slug: 'unity-sports', name: 'Unity Sports Complex', city: 'Hawassa', address: 'Lake Road, Hawassa', description: 'Courts for volleyball, badminton and tennis.', phone: '+251933456789', image: '/venue-card-2.jpg', sports: ['volleyball', 'badminton', 'tennis'], status: 'active', verified: true, rating: null, reviewCount: 0, timezone: 'Africa/Addis_Ababa' },
];
const fields: Field[] = [
  { id: 'field-1', venueId: 'venue-1', name: 'Main pitch', sports: ['football'], surface: 'Artificial turf', hourlyRateMinor: 250000, lighting: true, changingRoom: true, camera: true, active: true, openHour: 6, closeHour: 22 },
  { id: 'field-2', venueId: 'venue-1', name: 'Indoor court', sports: ['basketball', 'futsal'], surface: 'Hardwood', hourlyRateMinor: 150000, lighting: true, changingRoom: true, camera: false, active: true, openHour: 6, closeHour: 22 },
  { id: 'field-3', venueId: 'venue-2', name: 'Volleyball court', sports: ['volleyball'], surface: 'Sand', hourlyRateMinor: 100000, lighting: true, changingRoom: true, camera: false, active: true, openHour: 7, closeHour: 21 },
  { id: 'field-4', venueId: 'venue-2', name: 'Badminton court', sports: ['badminton'], surface: 'Indoor synthetic', hourlyRateMinor: 60000, lighting: true, changingRoom: true, camera: false, active: true, openHour: 7, closeHour: 21 },
  { id: 'field-5', venueId: 'venue-2', name: 'Tennis court', sports: ['tennis'], surface: 'Hard court', hourlyRateMinor: 80000, lighting: true, changingRoom: true, camera: false, active: true, openHour: 7, closeHour: 21 },
];
export interface DemoState {
  accounts: Account[]; venues: Venue[]; fields: Field[]; bookings: Booking[]; closures: Closure[];
  sites: Microsite[]; drafts: Microsite[]; teams: Team[]; cameras: CameraDevice[];
  media: MediaAsset[]; invoices: Invoice[]; audit: AuditEntry[];
  idempotency: Record<string, { fingerprint: string; bookingId: string }>;
}
export const commercialPolicy: CommercialPolicy = { subscriptionPriceMinor: null, bookingCommissionPercent: null, currency: 'ETB' };
export function createFixtures(): DemoState {
  const sites: Microsite[] = venues.map(venue => ({ venueId: venue.id, tagline: venue.name, description: venue.description, primaryColor: '#2d6a4f', published: true, updatedAt: '2026-01-01T00:00:00Z' }));
  return structuredClone({ accounts, venues, fields, bookings: [], closures: [], sites, drafts: structuredClone(sites), teams: [], cameras: [{ id: 'camera-1', venueId: 'venue-1', fieldId: 'field-1', name: 'Main pitch camera', model: 'Demo device', status: 'pending' }], media: [], invoices: [], audit: [], idempotency: {} });
}

