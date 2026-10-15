import { directoryFixtures } from './directory';
import type { Account, AuditEntry, Booking, CameraDevice, Closure, CommercialPolicy, Field, Invoice, MediaAsset, Microsite, Team, Venue } from '../services/contracts';

/** All operational demo records live here. Amounts are illustrative minor ETB units. */
export const accounts: Account[] = [
  { id: 'player-1', phone: '+251911234567', full_name: 'Abebe Kebede', role: 'player', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z' },
  { id: 'owner-1', phone: '+251922345678', full_name: 'Fatima Hassan', role: 'owner', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z' },
  { id: 'owner-2', phone: '+251933456789', full_name: 'Dawit Tadesse', role: 'owner', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z' },
  { id: 'admin-1', phone: '+251944567890', full_name: 'Demo Administrator', role: 'admin', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z' },
];
export const demoOTP = '123456';
const venues: Venue[] = directoryFixtures.map((v, i) => ({
  id: `venue-${i + 1}`, ownerId: `owner-${i + 1}`, slug: v.slug, name: v.name, city: v.city,
  address: `${v.address}, ${v.city}`, description: `${v.name} — ${v.sports.join(' · ')}.`, phone: i === 0 ? '+251922345678' : '+251933456678',
  image: v.image, sports: v.sports.map(s => s.toLowerCase() as Venue['sports'][number]), status: 'active',
  verified: v.is_verified, rating: v.rating, reviewCount: v.total_reviews, timezone: 'Africa/Addis_Ababa',
  referee: v.has_referee, indoor: v.is_indoor, featured: v.featured,
}));
for (let i = 3; i <= venues.length; i++) accounts.push({ id: `owner-${i}`, phone: `+25195500000${i}`, full_name: `${venues[i - 1].name} Admin`, role: 'owner', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z' });
const fields: Field[] = [
  { id: 'field-1', venueId: 'venue-1', name: 'Main pitch', sports: ['football'], surface: 'Artificial turf', hourlyRateMinor: 250000, lighting: true, changingRoom: true, camera: true, active: true, openHour: 6, closeHour: 22 },
  { id: 'field-2', venueId: 'venue-1', name: 'Indoor court', sports: ['basketball', 'futsal'], surface: 'Hardwood', hourlyRateMinor: 150000, lighting: true, changingRoom: true, camera: false, active: true, openHour: 6, closeHour: 22 },
  { id: 'field-3', venueId: 'venue-2', name: 'Volleyball court', sports: ['volleyball'], surface: 'Sand', hourlyRateMinor: 100000, lighting: true, changingRoom: true, camera: false, active: true, openHour: 7, closeHour: 21 },
  { id: 'field-4', venueId: 'venue-2', name: 'Badminton court', sports: ['badminton'], surface: 'Indoor synthetic', hourlyRateMinor: 60000, lighting: true, changingRoom: true, camera: false, active: true, openHour: 7, closeHour: 21 },
  { id: 'field-5', venueId: 'venue-2', name: 'Tennis court', sports: ['tennis'], surface: 'Hard court', hourlyRateMinor: 80000, lighting: true, changingRoom: true, camera: false, active: true, openHour: 7, closeHour: 21 },
];
fields.push(
  { ...fields[0], id: 'field-6', name: 'Pitch 2 — Natural Grass', surface: 'Natural Grass', hourlyRateMinor: 180000 },
  { ...fields[2], id: 'field-7', venueId: 'venue-1', name: 'Outdoor Volleyball Court' },
);
for (let i = 1; i < venues.length; i++) {
  const venue = venues[i]; const source = directoryFixtures[i];
  const existing = fields.filter(f => f.venueId === venue.id);
  for (let n = existing.length; n < source.fields_count; n++) fields.push({
    id: `${venue.id}-court-${n + 1}`, venueId: venue.id, name: `Court ${n + 1} — ${source.sports[n % source.sports.length]}`,
    sports: [source.sports[n % source.sports.length].toLowerCase() as Field['sports'][number]], surface: source.is_indoor ? 'Indoor court' : 'Outdoor court',
    hourlyRateMinor: source.price_from * 100, lighting: source.has_lighting, changingRoom: source.has_changing_room, camera: source.has_camera,
    active: true, openHour: 6, closeHour: 22,
  });
}
for (const venue of venues) venue.sports = [...new Set(fields.filter(f => f.venueId === venue.id).flatMap(f => f.sports))];
export interface DemoState {
  accounts: Account[]; venues: Venue[]; fields: Field[]; bookings: Booking[]; closures: Closure[];
  sites: Microsite[]; drafts: Microsite[]; teams: Team[]; cameras: CameraDevice[];
  media: MediaAsset[]; invoices: Invoice[]; audit: AuditEntry[];
  idempotency: Record<string, { fingerprint: string; bookingId: string }>;
}
export const commercialPolicy: CommercialPolicy = { subscriptionPriceMinor: null, bookingCommissionPercent: null, currency: 'ETB' };
export function createFixtures(): DemoState {
  const sites: Microsite[] = venues.map(venue => ({ venueId: venue.id, tagline: venue.name, description: venue.description, primaryColor: '#2d6a4f', highlights: Array.from({ length: 3 }, (_, i) => ({ id: `${venue.id}-highlight-${i}`, title: `${venue.name}: ${['Match highlights', 'Weekend cup', 'Goal of the week'][i]}`, teams: 'Community match · Demo preview', duration: ['1:45', '2:10', '1:15'][i], playbackUrl: null })), events: venue.sports.slice(0, 3).map((sport, i) => ({ id: `${venue.id}-event-${i}`, title: `${venue.name} ${sport} cup`, sport, date: `2027-09-${String(6 + i * 7).padStart(2, '0')}`, time: '10:00', spots: 6 })), published: true, updatedAt: '2026-01-01T00:00:00Z' }));
  return structuredClone({ accounts, venues, fields, bookings: [], closures: [], sites, drafts: structuredClone(sites), teams: [], cameras: [{ id: 'camera-1', venueId: 'venue-1', fieldId: 'field-1', name: 'Main pitch camera', model: 'Demo device', status: 'pending' }], media: [], invoices: [], audit: [], idempotency: {} });
}

