/** Frontend integration contracts. Backend endpoints are proposed until reviewed. */
export type Role = 'player' | 'owner' | 'admin';
export type Sport = 'football' | 'basketball' | 'volleyball' | 'badminton' | 'tennis' | 'futsal';
export interface Account {
  id: string; phone: string; full_name: string; role: Role; email?: string;
  is_verified: boolean; is_minor: boolean; created_at: string;
}
export interface Venue {
  id: string; ownerId: string; slug: string; name: string; city: string; address: string;
  description: string; phone: string; image: string; sports: Sport[];
  status: 'draft' | 'pending' | 'active' | 'suspended'; verified: boolean;
  primarySport?: Sport; instantPay?: boolean; publicStats?: { bookings: number; players: number; stream: string };
  referee?: boolean; indoor?: boolean; featured?: boolean;
  rating: number | null; reviewCount: number; timezone: string;
}
export interface Field {
  id: string; venueId: string; name: string; sports: Sport[]; surface: string; size?: string;
  hourlyRateMinor: number; lighting: boolean; changingRoom: boolean; camera: boolean;
  active: boolean; openHour: number; closeHour: number;
}
export interface Closure { id: string; fieldId: string; date: string; startHour: number; endHour: number; reason: string }
export interface Booking {
  id: string; venueId: string; fieldId: string; playerId: string; sport: Sport;
  date: string; startHour: number; endHour: number; totalMinor: number; currency: 'ETB';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  paymentStatus: 'unpaid' | 'processing' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  source?: 'online' | 'walk_in';
  guestName?: string;
  guestPhone?: string;
  rescheduledAt?: string;
  originalSchedule?: { date: string; startHour: number; endHour: number };
  teamId?: string;
  teamName?: string;
}
export interface BookingInput {
  fieldId: string; sport: Sport; date: string; startHour: number; endHour: number;
  idempotencyKey: string;
  teamId?: string;
}
export interface WalkInBookingInput {
  venueId: string; fieldId: string; sport: Sport; date: string; startHour: number; endHour: number;
  guestName: string; guestPhone?: string; idempotencyKey: string;
}
export interface RescheduleBookingInput {
  date: string; startHour: number; endHour: number; idempotencyKey: string;
}
export interface Slot { startHour: number; endHour: number; available: boolean }
export interface VenueInput { name: string; city: string; address: string; description: string; phone: string }
export interface SiteHighlight { id: string; title: string; teams: string; duration: string; views?: number; playbackUrl: string | null }
export type ParticipationFormat = 'team' | 'singles' | 'doubles';
export interface SiteEvent {
  id: string;
  title: string;
  sport: Sport;
  date: string;
  time: string;
  spots: number;
  format?: ParticipationFormat;
}
export interface EventRegistration {
  id: string;
  eventId: string;
  venueId: string;
  playerId: string;
  playerName: string;
  format: ParticipationFormat;
  teamId?: string;
  teamName?: string;
  partnerName?: string;
  status: 'registered' | 'cancelled';
  createdAt: string;
}
export interface EventRegistrationInput {
  teamId?: string;
  partnerName?: string;
}
export interface EventDetails extends SiteEvent {
  venueId: string;
  venueName: string;
  venueSlug: string;
  format: ParticipationFormat;
  registeredCount: number;
  availableSpots: number;
  isFull: boolean;
  isClosed: boolean;
  myRegistration?: EventRegistration | null;
}
export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'telegram' | 'tiktok' | 'youtube' | 'website';
  url: string;
}
export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}
export interface Microsite {
  venueId: string; tagline: string; description: string; primaryColor: string;
  heroImage?: string | null; logoUrl?: string | null; announcement?: string | null;
  contactPhone?: string | null; contactEmail?: string | null;
  socialLinks?: SocialLink[]; gallery?: GalleryImage[];
  highlights?: SiteHighlight[]; events?: SiteEvent[];
  published: boolean; updatedAt: string;
}
export { isSupportedImageUrl, isSupportedVideoUrl } from './media-policy';
export interface CameraDevice {
  id: string; venueId: string; fieldId: string; name: string; model: string;
  status: 'pending' | 'certified' | 'active' | 'offline' | 'revoked';
}
export interface TeamJoinRequest {
  id: string;
  teamId: string;
  playerId: string;
  playerName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
export interface Team {
  id: string;
  name: string;
  sport: Sport;
  city: string;
  captainId: string;
  captainName?: string;
  memberIds: string[];
  members?: { id: string; name: string }[];
  description?: string;
  createdAt: string;
}
export interface TeamInput {
  name: string;
  sport: Sport;
  city: string;
  description?: string;
}
export interface PublicTeamMatch {
  matchId: string;
  teamId: string;
  fieldId: string;
  sport: Sport;
  date: string;
  startHour: number;
  endHour: number;
  status: Booking['status'];
}
export interface TeamMatchDetail extends PublicTeamMatch {
  bookingId?: string;
  venueId?: string;
  totalMinor?: number;
  currency?: 'ETB';
  paymentStatus?: Booking['paymentStatus'];
}
export interface MediaAsset {
  id: string; bookingId: string; title: string;
  status: 'scheduled' | 'processing' | 'ready' | 'failed';
  visibility: 'private' | 'unlisted' | 'public'; playbackUrl: string | null;
}
export interface Invoice { id: string; venueId: string; totalMinor: number; currency: 'ETB'; status: 'unpaid' | 'paid' | 'cancelled' }
export interface CommercialPolicy { subscriptionPriceMinor: number | null; bookingCommissionPercent: number | null; currency: 'ETB' }
export interface AuditEntry { id: string; actorId: string; action: string; resourceId: string; createdAt: string }
export interface Analytics { bookings: number; collectedMinor: number; outstandingMinor: number; cancelled: number }
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown; signal?: AbortSignal;
  idempotencyKey?: string;
}
export interface Transport { request<T>(path: string, options?: RequestOptions): Promise<T> }
