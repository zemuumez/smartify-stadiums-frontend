import { directoryFixtures } from './directory';
import type { Account, AuditEntry, Booking, CameraDevice, Closure, CommercialPolicy, EventRegistration, Field, Invoice, MatchRecording, MediaAsset, Microsite, ParticipationFormat, PaymentTransaction, ReplayEntitlement, SupportCase, Team, TeamJoinRequest, Venue, VenueReviewRecord } from '../services/contracts';

/** All operational demo records live here. Amounts are illustrative minor ETB units. */
export const accounts: Account[] = [
  { id: 'player-1', phone: '+251911234567', full_name: 'Abebe Kebede', role: 'player', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z', status: 'active' },
  { id: 'player-2', phone: '+251911998877', full_name: 'Sara Mengistu', role: 'player', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z', status: 'active' },
  { id: 'player-3', phone: '+251911445566', full_name: 'Yonas Abebe', role: 'player', is_verified: true, is_minor: true, created_at: '2026-01-01T00:00:00Z', status: 'active' },
  { id: 'owner-1', phone: '+251922345678', full_name: 'Fatima Hassan', role: 'owner', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z', status: 'active' },
  { id: 'owner-2', phone: '+251933456789', full_name: 'Dawit Tadesse', role: 'owner', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z', status: 'active' },
  { id: 'admin-1', phone: '+251944567890', full_name: 'Demo Administrator', role: 'admin', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z', status: 'active' },
  { id: 'admin-2', phone: '+251944567891', full_name: 'Demo Supervisor', role: 'admin', is_verified: true, is_minor: false, created_at: '2026-01-01T00:00:00Z', status: 'active' },
];
export const demoOTP = '123456';
const venues: Venue[] = directoryFixtures.map((v, i) => ({
  id: `venue-${i + 1}`, ownerId: `owner-${i + 1}`, slug: v.slug, name: v.name, city: v.city,
  address: `${v.address}, ${v.city}`, description: `${v.name} — ${v.sports.join(' · ')}.`, phone: i === 0 ? '+251922345678' : '+251933456678',
  image: v.image, sports: v.sports.map(s => s.toLowerCase() as Venue['sports'][number]), status: 'active',
  verified: v.is_verified, rating: v.rating, reviewCount: v.total_reviews, timezone: 'Africa/Addis_Ababa',
  primarySport: v.sport.toLowerCase() as Venue['sports'][number], instantPay: v.has_instant_pay, publicStats: i === 0 ? { bookings: 1247, players: 3200, stream: '4K Veo Live' } : undefined, referee: v.has_referee, indoor: v.is_indoor, featured: v.featured,
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
const bambisFields = fields.filter(f => f.venueId === 'venue-1');
const originalCourts = [
  { id: 'field-1', name: 'Pitch 1 — FIFA Artificial Turf (11v11)', size: '11v11 / 7v7', surface: 'Turf' },
  { id: 'field-6', name: 'Pitch 2 — 7v7 Natural Grass Ground', size: '7v7', surface: 'Natural Grass' },
  { id: 'field-2', name: 'Court 3 — Hardwood Indoor Arena', size: '5v5', surface: 'Hardwood', camera: true },
  { id: 'field-7', name: 'Court 4 — Outdoor Volleyball Sand Pitch', size: '6v6', surface: 'Sand / Synthetic' },
];
for (const definition of originalCourts) Object.assign(bambisFields.find(f => f.id === definition.id)!, definition);
fields.sort((a, b) => a.venueId.localeCompare(b.venueId) || (a.venueId === 'venue-1' ? originalCourts.findIndex(f => f.id === a.id) - originalCourts.findIndex(f => f.id === b.id) : 0));
export const SAMPLE_MEDIA_CONFIG = {
  samplePlaybackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  sampleThumbnailUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  provenanceAttribution: 'Sample match playback provided under Creative Commons Attribution 3.0 (Big Buck Bunny, © 2008 Blender Foundation).',
  defaultRetentionDays: 30, // explicitly provisional
};

export interface DemoState {
  accounts: Account[]; venues: Venue[]; fields: Field[]; bookings: Booking[]; closures: Closure[];
  sites: Microsite[]; drafts: Microsite[]; teams: Team[]; teamRequests: TeamJoinRequest[];
  eventRegistrations: EventRegistration[]; cameras: CameraDevice[];
  media: MediaAsset[]; recordings: MatchRecording[]; entitlements: ReplayEntitlement[]; invoices: Invoice[]; audit: AuditEntry[];
  transactions: PaymentTransaction[]; venueReviews: VenueReviewRecord[]; supportCases: SupportCase[];
  idempotency: Record<string, { fingerprint: string; bookingId: string; transactionId?: string }>;
}
export const commercialPolicy: CommercialPolicy = { subscriptionPriceMinor: null, bookingCommissionPercent: null, currency: 'ETB' };
export function createFixtures(): DemoState {
  const sites: Microsite[] = venues.map(venue => ({
    venueId: venue.id,
    tagline: venue.id === 'venue-1' ? 'Bambis Meda Sports Ground' : venue.name,
    description: venue.id === 'venue-1' ? "Addis Ababa's premier multi-sport arena featuring FIFA-certified turf, 24/7 night floodlighting, autonomous 4K Veo live match recording, and instant Telebirr bookings." : venue.description,
    primaryColor: '#2d6a4f',
    highlights: Array.from({ length: 3 }, (_, i) => ({
      id: `${venue.id}-highlight-${i}`,
      title: venue.id === 'venue-1' ? ['Bole Derby: Volley of the Month', 'Weekend 7v7 Cup: Double Penalty Save', 'Sunday League: Backheel Goal'][i] : `${venue.name}: ${['Match highlights', 'Weekend cup', 'Goal of the week'][i]}`,
      teams: venue.id === 'venue-1' ? ['Bole Lions vs Arada FC', 'Unity Stars vs St. George Youth', 'Addis United vs Meskel Warriors'][i] : 'Community match · Demo preview',
      views: venue.id === 'venue-1' ? [2420, 1890, 3120][i] : 0,
      duration: ['1:45', '2:10', '1:15'][i],
      playbackUrl: null,
    })),
    events: venue.sports.slice(0, 3).map((sport, i) => {
      const format: ParticipationFormat = ['tennis', 'badminton'].includes(sport) ? (i % 2 === 0 ? 'singles' : 'doubles') : 'team';
      return {
        id: `${venue.id}-event-${i}`,
        title: venue.id === 'venue-1' ? ['Bole Corporate League Final', 'Addis 3v3 Weekend Basketball Cup', 'Youth Development Futsal Championship'][i] : `${venue.name} ${sport} cup`,
        sport,
        format,
        date: `2027-09-${String(6 + i * 7).padStart(2, '0')}`,
        time: '10:00',
        spots: 6,
      };
    }),
    published: true,
    updatedAt: '2026-01-01T00:00:00Z',
  }));
  const initialTeams: Team[] = [
    {
      id: 'team-1',
      name: 'Bole Lions FC',
      sport: 'football',
      city: 'Addis Ababa',
      captainId: 'player-1',
      captainName: 'Abebe Kebede',
      memberIds: ['player-1'],
      description: 'Addis Ababa Premier Amateur Football Club',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'team-2',
      name: 'Addis Hoops',
      sport: 'basketball',
      city: 'Addis Ababa',
      captainId: 'player-1',
      captainName: 'Abebe Kebede',
      memberIds: ['player-1'],
      description: 'Community basketball team playing at Bambis Meda',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];
  const initialCameras: CameraDevice[] = [
    {
      id: 'camera-1',
      venueId: 'venue-1',
      fieldId: 'field-1',
      name: 'Pitch 1 4K AI Camera',
      model: 'Veo Cam 3',
      serialNumber: 'VEO3-ADDIS-001',
      certificationStatus: 'passed',
      connectivityStatus: 'online',
      status: 'certified',
      certifiedAt: '2026-09-01T10:00:00Z',
      certifiedBy: 'admin-1',
      createdAt: '2026-08-15T09:00:00Z',
    },
    {
      id: 'camera-2',
      venueId: 'venue-1',
      fieldId: 'field-2',
      name: 'Court 3 Hardwood AI Unit',
      model: 'Pixellot Air',
      serialNumber: 'PIX-ADDIS-002',
      certificationStatus: 'pending',
      connectivityStatus: 'offline',
      status: 'pending',
      createdAt: '2026-10-01T14:30:00Z',
    },
    {
      id: 'camera-3',
      venueId: 'venue-1',
      fieldId: 'field-6',
      name: 'Pitch 2 North Field Camera',
      model: 'Veo Cam 2',
      serialNumber: 'VEO2-ADDIS-003',
      certificationStatus: 'failed',
      connectivityStatus: 'online',
      status: 'revoked',
      failureReason: 'Optical occlusion detected: spectator netting obstructs south goal frame.',
      recoveryGuidance: 'Relocate mounting pole 1.5m eastward or elevate bracket to 6m height.',
      certifiedAt: '2026-09-15T11:00:00Z',
      certifiedBy: 'admin-1',
      createdAt: '2026-09-10T08:00:00Z',
    },
    {
      id: 'camera-unity-1',
      venueId: 'venue-2',
      fieldId: 'field-5',
      name: 'Unity Tennis Center Court Camera',
      model: 'Veo Cam 3',
      serialNumber: 'VEO3-UNITY-004',
      certificationStatus: 'passed',
      connectivityStatus: 'online',
      status: 'certified',
      certifiedAt: '2026-09-05T12:00:00Z',
      certifiedBy: 'admin-1',
      createdAt: '2026-08-20T10:00:00Z',
    },
  ];

  const initialRecordings: MatchRecording[] = [
    {
      id: 'rec-1',
      venueId: 'venue-1',
      fieldId: 'field-1',
      bookingId: 'booking-rec-1',
      cameraId: 'camera-1',
      sport: 'football',
      teamId: 'team-1',
      teamName: 'Bole Lions FC',
      status: 'ready',
      retryEligible: false,
      duration: '14:20',
      title: 'Bole Lions FC vs Addis Stars Friendly',
      playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: '/venue-card-1.jpg',
      consent: {
        status: 'granted',
        requiresGuardian: false,
        updatedAt: '2026-10-10T19:00:00Z',
      },
      privacy: {
        faceBlurStatus: 'completed',
        completedAt: '2026-10-10T19:05:00Z',
      },
      publication: {
        visibility: 'public',
        ownerApproved: true,
        publishedAt: '2026-10-10T19:10:00Z',
      },
      retentionExpiresAt: '2026-11-15T00:00:00Z',
      createdAt: '2026-10-10T18:00:00Z',
    },
    {
      id: 'rec-2',
      venueId: 'venue-1',
      fieldId: 'field-2',
      bookingId: 'booking-rec-2',
      cameraId: 'camera-2',
      sport: 'basketball',
      teamId: 'team-2',
      teamName: 'Addis Hoops',
      status: 'ready',
      retryEligible: false,
      duration: '22:15',
      title: 'Addis Hoops Internal Scrimmage',
      playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: '/venue-card-1.jpg',
      consent: {
        status: 'pending',
        requiresGuardian: false,
        updatedAt: '2026-10-11T17:00:00Z',
      },
      privacy: {
        faceBlurStatus: 'pending',
      },
      publication: {
        visibility: 'private',
        ownerApproved: false,
      },
      retentionExpiresAt: '2026-11-15T00:00:00Z',
      createdAt: '2026-10-11T16:00:00Z',
    },
    {
      id: 'rec-3',
      venueId: 'venue-1',
      fieldId: 'field-1',
      bookingId: 'booking-rec-3',
      cameraId: 'camera-1',
      sport: 'football',
      status: 'failed',
      failureReason: 'Transcoder worker crash on video chunk 8/12',
      retryEligible: true,
      duration: '00:00',
      title: 'Bambis Evening 7v7 Match',
      playbackUrl: null,
      consent: {
        status: 'granted',
        requiresGuardian: false,
        updatedAt: '2026-10-12T19:00:00Z',
      },
      privacy: {
        faceBlurStatus: 'failed',
      },
      publication: {
        visibility: 'private',
        ownerApproved: false,
      },
      createdAt: '2026-10-12T18:00:00Z',
    },
    {
      id: 'rec-4',
      venueId: 'venue-1',
      fieldId: 'field-1',
      bookingId: 'booking-rec-4',
      cameraId: 'camera-1',
      sport: 'football',
      status: 'processing',
      retryEligible: false,
      duration: '00:00',
      title: 'Morning Corporate League Fixture',
      playbackUrl: null,
      consent: {
        status: 'pending',
        requiresGuardian: false,
        updatedAt: '2026-10-13T09:00:00Z',
      },
      privacy: {
        faceBlurStatus: 'pending',
      },
      publication: {
        visibility: 'private',
        ownerApproved: false,
      },
      createdAt: '2026-10-13T08:00:00Z',
    },
    {
      id: 'rec-5',
      venueId: 'venue-1',
      fieldId: 'field-1',
      bookingId: 'booking-rec-5',
      cameraId: 'camera-1',
      sport: 'football',
      status: 'ready',
      retryEligible: false,
      duration: '18:50',
      title: 'Addis Youth Academy Exhibition',
      playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: '/venue-card-1.jpg',
      consent: {
        status: 'pending',
        requiresGuardian: true,
        guardianConsentStatus: 'pending',
        updatedAt: '2026-10-14T11:00:00Z',
      },
      privacy: {
        faceBlurStatus: 'completed',
        completedAt: '2026-10-14T12:00:00Z',
      },
      publication: {
        visibility: 'private',
        ownerApproved: false,
      },
      retentionExpiresAt: '2026-11-15T00:00:00Z',
      createdAt: '2026-10-14T10:00:00Z',
    },
    {
      id: 'rec-unity-1',
      venueId: 'venue-2',
      fieldId: 'field-5',
      bookingId: 'booking-unity-1',
      cameraId: 'camera-unity-1',
      sport: 'tennis',
      status: 'ready',
      retryEligible: false,
      duration: '35:10',
      title: 'Sara Mengistu Tennis Match',
      playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: '/venue-card-1.jpg',
      consent: {
        status: 'granted',
        requiresGuardian: false,
        updatedAt: '2026-10-12T16:00:00Z',
      },
      privacy: {
        faceBlurStatus: 'completed',
        completedAt: '2026-10-12T16:05:00Z',
      },
      publication: {
        visibility: 'private',
        ownerApproved: false,
      },
      retentionExpiresAt: '2026-11-15T00:00:00Z',
      createdAt: '2026-10-12T15:00:00Z',
    },
    {
      id: 'rec-expired-1',
      venueId: 'venue-1',
      fieldId: 'field-1',
      bookingId: 'booking-rec-expired-1',
      cameraId: 'camera-1',
      sport: 'football',
      status: 'ready',
      retryEligible: false,
      duration: '10:00',
      title: 'Expired Bambis Match',
      playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ExpiredMatch.mp4',
      thumbnailUrl: '/venue-card-1.jpg',
      consent: {
        status: 'granted',
        requiresGuardian: false,
        updatedAt: '2026-08-01T10:00:00Z',
      },
      privacy: {
        faceBlurStatus: 'completed',
        completedAt: '2026-08-01T10:05:00Z',
      },
      publication: {
        visibility: 'public',
        ownerApproved: true,
        publishedAt: '2026-08-01T10:10:00Z',
      },
      retentionExpiresAt: '2026-09-01T00:00:00Z', // intentionally expired in the past
      createdAt: '2026-08-01T09:00:00Z',
    },
  ];

  const initialEntitlements: ReplayEntitlement[] = [
    { id: 'ent-1', recordingId: 'rec-1', userId: 'player-1', grantedBy: 'system', grantedAt: '2026-10-10T19:00:00Z' },
    { id: 'ent-2', recordingId: 'rec-2', userId: 'player-1', grantedBy: 'system', grantedAt: '2026-10-11T17:00:00Z' },
    { id: 'ent-3', recordingId: 'rec-3', userId: 'player-1', grantedBy: 'system', grantedAt: '2026-10-12T19:00:00Z' },
    { id: 'ent-4', recordingId: 'rec-4', userId: 'player-1', grantedBy: 'system', grantedAt: '2026-10-13T09:00:00Z' },
    { id: 'ent-5', recordingId: 'rec-5', userId: 'player-1', grantedBy: 'system', grantedAt: '2026-10-14T11:00:00Z' },
    { id: 'ent-unity-1', recordingId: 'rec-unity-1', userId: 'player-2', grantedBy: 'system', grantedAt: '2026-10-12T16:00:00Z' },
  ];

  const initialSupportCases: SupportCase[] = [
    {
      id: 'case-1',
      caseNumber: 'CASE-100234',
      authorId: 'player-1',
      authorName: 'Abebe Kebede',
      authorRole: 'player',
      venueId: 'venue-1',
      category: 'booking_inquiry',
      subject: 'Inquiry regarding Pitch 1 floodlights for night session',
      status: 'in_progress',
      priority: 'medium',
      createdAt: '2026-10-14T08:00:00Z',
      updatedAt: '2026-10-14T09:30:00Z',
      messages: [
        {
          id: 'msg-1',
          caseId: 'case-1',
          senderId: 'player-1',
          senderName: 'Abebe Kebede',
          senderRole: 'player',
          message: 'Hello, are the floodlights operating normally for 20:00 bookings on Pitch 1?',
          isInternal: false,
          createdAt: '2026-10-14T08:00:00Z',
        },
        {
          id: 'msg-2',
          caseId: 'case-1',
          senderId: 'admin-1',
          senderName: 'Demo Administrator',
          senderRole: 'admin',
          message: 'Internal note: Venue 1 verified backup generator is active.',
          isInternal: true,
          createdAt: '2026-10-14T09:00:00Z',
        },
        {
          id: 'msg-3',
          caseId: 'case-1',
          senderId: 'admin-1',
          senderName: 'Demo Administrator',
          senderRole: 'admin',
          message: 'Hi Abebe, yes, all floodlights on Pitch 1 are tested and operating with secondary backup power.',
          isInternal: false,
          createdAt: '2026-10-14T09:30:00Z',
        },
      ],
    },
  ];

  return structuredClone({
    accounts,
    venues,
    fields,
    bookings: [],
    closures: [],
    sites,
    drafts: structuredClone(sites),
    teams: initialTeams,
    teamRequests: [],
    eventRegistrations: [],
    cameras: initialCameras,
    recordings: initialRecordings,
    entitlements: initialEntitlements,
    media: [],
    invoices: [],
    audit: [],
    transactions: [],
    venueReviews: [],
    supportCases: initialSupportCases,
    idempotency: {},
  });
}

