# CAMERA_MEDIA_HANDOFF.md — Camera, Match Media & Privacy

Implementation handoff for Milestone M4 Part 2: **Camera, Match Media & Privacy** for PLAY ETHIOPIA / ET Smart Fields.
Prepared 16 October 2026. Implementation baseline: `b13ddb9` (merged `main`). Dedicated branch: `codex/camera-media-privacy`.

---

## 1. Executive Summary & Delivery Boundary

This milestone implements the frontend capabilities for **Camera Administration, Booking-Linked Recordings, Replay Playback, and Consent/Privacy-Gated Publication** (Department D09 in `FRONTEND_MASTER_PLAN.md`).

### Scope and Operating Boundaries
- **Frontend-First Simulation:** Operates via typed domain services in `frontend/src/services` backed by centralized demo fixtures in `frontend/src/demo`.
- **No Backend or Cloud Pipeline:** Does not implement a real backend, physical RTSP/RTMP camera streaming, WebRTC, real AI video tracking/clipping, face-detection models, payment gateway, or cloud transcoders.
- **UI Baseline Strictly Preserved:** Reuses established design tokens, typography, forest-green/mint palette, card containers, dialog patterns, and navigation from commit `51e4a82` / `1d93308`.
- **No Hardcoded Commercial Policy:** Pricing for replay packages, storage retention fees, and commissions remain open and explicitly modeled as provisional demo fixtures.
- **Tenant & Role Isolation:** Venue owners can only inspect and manage devices and recordings scoped to their owned venues. Platform administrators have role-gated certification review capabilities. Players access recordings strictly when entitled.

---

## 2. Inspected Baseline & Gap Analysis

| Area | Current Baseline (`b13ddb9`) | Milestone Target (D09) | Material Gaps Identified |
|---|---|---|---|
| **Camera Administration** | Basic `mediaService.cameras()` returning raw `CameraDevice[]`; single static mock camera in Bambis Meda; simple text display in `OwnerCameras`. | Comprehensive venue-scoped camera list and register/edit form; field assignment; separate certification status and operational connectivity; failure reasons and recovery guidance; simulated admin certification workflow. | No camera creation/edit form; no field assignment dropdown; no separation of certification from connectivity; no admin certification review modal; owners could not view failure reasons or recovery steps. |
| **Booking-Linked Recordings** | No dedicated recording model in fixtures; `MediaAsset` stub in `contracts.ts` with minimal fields (`id`, `bookingId`, `status`, `visibility`); `/media` endpoint stub in `transport.ts`. | Stable recording entities linked to `venueId`, `fieldId`, `bookingId`, `cameraId`, `sport`, and `teamId`; lifecycle states (`scheduled`, `recording`, `uploading`, `processing`, `ready`, `failed`); owner list/detail view with failure info and retry transitions. | No link between bookings and recordings; no recording lifecycle state machine; no owner recording inspection or retry action; no explicit demo state advancement controls. |
| **Player Replay & Playback** | Microsite highlights section has static cards and placeholder dialog with `previewOnly` text; `/bookings/[id]` has no video or recording link. | Player booking detail & history links to corresponding recording; playable HTML5 sample media for ready authorized recordings; honest states for processing, failed, forbidden, expired, and unavailable. | No player replay viewer; no entitlement check on booking view; no licensed sample video playback; missing error/unavailable states. |
| **Permissions & Isolation** | Simple `account()` check in `/media` without team-membership entitlement or venue-owner scope enforcement. | Explicit permission matrix: visitors (public highlights only), booking players (entitled access), team members (explicit eligible access scenarios), venue owners (own venue recordings only), admin (role-gated). | Unauthenticated/guest users had no clear highlight boundary; team members lacked granular entitlement checks; cross-owner recording leakage was not barred. |
| **Consent & Privacy Gating** | No consent model; no privacy blur tracking; public highlights could be added via CMS without consent verification. | Consent statuses (`pending`, `granted`, `denied`, `revoked`, guardian consent for minors); privacy blur processing status (`pending`, `processing`, `completed`, `failed`); publication strictly rejected if consent or required blur is incomplete; unpublication action. | Zero consent tracking; no guardian consent model for minor players; no privacy blur verification before publication; unpublish did not exist for recordings. |
| **Localization & a11y** | Existing partial keys in `en.ts` / `am.ts` (`cameras`, `awaitingCertification`, `privacyNotice`). | Full English and Amharic dictionaries for all camera, recording, consent, blur, replay, and publication states; mobile-friendly responsive layouts; keyboard traps and aria labels on all dialogs. | Missing ~30 localization keys for certification, connectivity, blur, guardian consent, publication, and playback error states. |

---

## 3. Domain Contracts & DTOs

### 3.1 Camera Devices
```typescript
export type CameraCertificationStatus = 'pending' | 'passed' | 'failed' | 'revoked';
export type CameraConnectivityStatus = 'online' | 'offline' | 'unknown';

export interface CameraDevice {
  id: string;
  venueId: string;
  fieldId: string;
  name: string;
  model: string;
  serialNumber?: string;
  certificationStatus: CameraCertificationStatus;
  connectivityStatus: CameraConnectivityStatus;
  failureReason?: string;
  recoveryGuidance?: string;
  certifiedAt?: string;
  certifiedBy?: string;
  lastHeartbeatAt?: string;
  createdAt: string;
}

export interface CameraRegisterInput {
  venueId: string;
  fieldId: string;
  name: string;
  model: string;
  serialNumber?: string;
}

export interface CameraUpdateInput {
  name: string;
  fieldId: string;
  model: string;
}

export interface CameraCertificationReviewInput {
  certificationStatus: 'passed' | 'failed' | 'revoked';
  failureReason?: string;
  recoveryGuidance?: string;
}
```

### 3.2 Booking-Linked Recordings & Privacy
```typescript
export type RecordingStatus = 'scheduled' | 'recording' | 'uploading' | 'processing' | 'ready' | 'failed';
export type PrivacyConsentStatus = 'pending' | 'granted' | 'denied' | 'revoked';
export type PrivacyBlurStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type MediaVisibility = 'private' | 'unlisted' | 'public';

export interface PrivacyConsent {
  status: PrivacyConsentStatus;
  requiresGuardian: boolean;
  guardianConsentStatus?: 'pending' | 'granted' | 'denied';
  notes?: string;
  updatedAt: string;
}

export interface PrivacyProcessing {
  faceBlurStatus: PrivacyBlurStatus;
  bodyBlurStatus?: 'not_required' | 'pending' | 'completed';
  completedAt?: string;
}

export interface PublicationControl {
  visibility: MediaVisibility;
  ownerApproved: boolean;
  publishedAt?: string;
  unpublishReason?: string;
}

export interface MatchRecording {
  id: string;
  venueId: string;
  fieldId: string;
  bookingId: string;
  cameraId?: string;
  sport: Sport;
  teamId?: string;
  teamName?: string;
  status: RecordingStatus;
  failureReason?: string;
  retryEligible: boolean;
  duration: string;
  title: string;
  playbackUrl: string | null;
  thumbnailUrl?: string | null;
  consent: PrivacyConsent;
  privacy: PrivacyProcessing;
  publication: PublicationControl;
  retentionExpiresAt?: string;
  createdAt: string;
}

export interface ReplayPlayback {
  recordingId: string;
  bookingId: string;
  title: string;
  sport: Sport;
  canPlay: boolean;
  playbackUrl: string | null;
  thumbnailUrl?: string | null;
  entitlementStatus: 'entitled' | 'forbidden' | 'expired' | 'processing' | 'failed' | 'unavailable';
  retentionExpiresAt?: string;
  visibility: MediaVisibility;
  duration: string;
  reason?: string;
}

export interface PublicHighlight {
  id: string;
  venueId: string;
  recordingId: string;
  title: string;
  sport: Sport;
  teams: string;
  duration: string;
  views: number;
  playbackUrl: string;
  thumbnailUrl?: string;
}
```

---

## 4. Permission Matrix

| Actor | Public Highlights (`GET /venues/:id/highlights`) | Player Replay (`GET /bookings/:id/replay`) | Owner Cameras (`/owner/cameras`) | Owner Recordings (`/owner/recordings`) | Publication Controls (`POST .../publication`) | Admin Certification (`POST .../certify`) |
|---|---|---|---|---|---|---|
| **Anonymous / Visitor** | Allowed (Public highlights only; no private URLs) | Denied (401 Unauthorized) | Denied (401 Unauthorized) | Denied (401 Unauthorized) | Denied (401 Unauthorized) | Denied (401 Unauthorized) |
| **Booking Player** | Allowed | Allowed for own booking only (403 Forbidden for other bookings) | Denied (403 Forbidden) | Denied (403 Forbidden) | Denied (403 Forbidden) | Denied (403 Forbidden) |
| **Team Member** | Allowed | Allowed ONLY if member of the booked team AND recording access is entitled | Denied (403 Forbidden) | Denied (403 Forbidden) | Denied (403 Forbidden) | Denied (403 Forbidden) |
| **Venue Owner A** | Allowed | Allowed for bookings at Venue A | Allowed for Venue A ONLY (Venue B denied) | Allowed for Venue A ONLY (Venue B denied) | Allowed for Venue A ONLY | Denied (403 Forbidden — owners cannot self-certify) |
| **Venue Owner B** | Allowed | Allowed for bookings at Venue B | Allowed for Venue B ONLY (Venue A denied) | Allowed for Venue B ONLY (Venue A denied) | Allowed for Venue B ONLY | Denied (403 Forbidden) |
| **Platform Admin** | Allowed | Allowed (oversight) | Allowed (all venues) | Allowed (all venues) | Allowed | Allowed (can pass, fail, or revoke certification) |

---

## 5. State Machines & Publication Invariants

### 5.1 Camera Certification & Connectivity
```
[Registration] ──> Pending
                       │ (Admin Review)
                       ├───> Passed (Eligible for operational recording)
                       ├───> Failed (Displays failure reason & recovery guidance)
                       └───> Revoked (Hardware non-compliance or tampered feed)

Connectivity: Online <──> Offline <──> Unknown
(Operates independently from certification; a failed camera never records even if online).
```

### 5.2 Recording Lifecycle
```
Scheduled ──> Recording ──> Uploading ──> Processing ──> Ready
                                                │
                                                └──> Failed (Retry Eligible)
                                                        │
                                                        └── (Owner Retry) ──> Processing ──> Ready
```

### 5.3 Publication Invariant Rule
A recording **CANNOT** be published (`visibility: 'public'`) unless all four conditions are met:
1. `recording.status === 'ready'` and `recording.playbackUrl !== null`.
2. `recording.publication.ownerApproved === true`.
3. `recording.consent.status === 'granted'` (and if `requiresGuardian === true`, `guardianConsentStatus === 'granted'`).
4. `recording.privacy.faceBlurStatus === 'completed'`.

Attempting to publish when any of these conditions are unmet returns HTTP 422 `validation` with an explicit reason (`consent_required`, `guardian_consent_required`, or `face_blur_incomplete`).

### 5.4 Unpublication Invariant
When an owner unpublishes a recording (`POST /owner/recordings/:id/unpublish`):
- `visibility` transitions to `'private'` (or `'unlisted'`).
- The item is immediately removed from public listings (`GET /venues/:id/highlights` and microsite `#highlights`).
- The operational match recording, player replay access, and historical records remain intact.

---

## 6. Permitted Sample Video Provenance
To comply with licensing and media policy:
- **Sample Video Source:** Big Buck Bunny Open Source Animation / Wikimedia Commons Public Domain Video / Google Storage test clips:
  - `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
  - License: Creative Commons Attribution 3.0 (Blender Foundation).
  - Matches `isSupportedVideoUrl()` HTTPS policy.
  - Provably playable across modern desktop and mobile browsers.
- No copyrighted sports footage is used. If playback fails or is unavailable, the UI renders an honest unavailable state (`<ReplayUnavailable />`), never silently substituting fake footage.

---

## 7. Proposed Backend Contracts & API Endpoints

```
Cameras:
- GET    /owner/cameras                          (List venue-scoped cameras)
- POST   /owner/cameras                          (Register camera metadata)
- PATCH  /owner/cameras/:id                      (Update camera metadata / field)
- POST   /admin/cameras/:id/certify              (Admin certification review)

Recordings & Replays:
- GET    /owner/recordings                       (List venue-scoped recordings)
- GET    /owner/recordings/:id                   (Recording detail & recovery)
- POST   /owner/recordings/:id/retry             (Retry failed recording)
- POST   /owner/recordings/:id/advance           (Simulate recording lifecycle state)
- POST   /owner/recordings/:id/consent           (Update participant/guardian consent)
- POST   /owner/recordings/:id/privacy-blur      (Complete simulated privacy blur)
- POST   /owner/recordings/:id/publication       (Publish with consent/blur check)
- POST   /owner/recordings/:id/unpublish         (Unpublish public recording)

Player Replay & Public Media:
- GET    /replays                                (List entitled replays for caller)
- GET    /bookings/:id/replay                    (Get replay playback details for booking)
- GET    /venues/:venueId/highlights             (Public highlights for microsite)
```

### Production Security Requirements (Backend follow-up)
- **Signed Short-Lived Playback URLs:** In production, `playbackUrl` must be a cryptographically signed HMAC URL with short TTL (e.g., 15 minutes) bound to the player's session.
- **Signed Ingest Tokens:** Real cameras authenticate with mutual TLS and signed ingest tokens; no plain passwords in client code.
- **Async Processing Pipeline:** Real video encoding, AI clipping, and face blurring occur on worker queues (e.g. Redis/asynq) with idempotent webhook notifications.
- **Audit Trails:** Every publication, consent change, and certification review records an immutable audit entry.

---

## 8. Unresolved Commercial Decisions & Policies
- **Replay Pricing:** Replay downloads and extended retention pricing remain unsettled. Represented as free demo entitlement.
- **Retention Period:** Default demo retention is set to 30 days; production retention policies (7 days free vs. 90 days subscriber) remain unconfirmed by the founder.
- **Guardian Age Threshold:** Ethiopian minor age limit is modeled at <18 years for demo purposes; legal compliance requirements will be finalized prior to live deployment.

---

## 9. Implementation Steps & Acceptance Scenarios

1. **Step 1: Domain Models, Contracts, Simulator & Fixtures**
   - Update `contracts.ts`, `fixtures.ts`, and `transport.ts` with typed camera and recording models.
   - Seed deterministic cameras and recordings linked to Bambis Meda and Unity Sports Complex bookings.
   - Implement typed endpoints in `media.service.ts` and `transport.ts`.
   - Write comprehensive unit tests in `tests/camera-media.test.cjs`.
2. **Step 2: Camera Administration & Simulated Admin Certification**
   - Expand `OwnerCameras` in `owner-panels.tsx`: venue selector, field assignment, registration/edit modal, certification vs. connectivity badges, failure reason display, and recovery guidance.
   - Add simulated admin certification review modal.
   - Add English and Amharic dictionary entries.
3. **Step 3: Booking-Linked Recordings & Owner Operations**
   - Add owner recording management tab/view with status pills, failure info, retry button, and demo lifecycle simulator controls.
4. **Step 4: Player Replay Library & Accessible Playback**
   - Connect player booking detail (`/bookings/[id]`) and replay list to the recording.
   - Provide accessible HTML5 video playback with licensed sample video.
   - Render honest processing, failed, expired, forbidden, and unavailable states.
5. **Step 5: Consent, Privacy Blur & Publication Invariants**
   - Implement consent statuses (pending, granted, denied, revoked, guardian consent).
   - Implement privacy face-blurring verification.
   - Enforce publication rejection if consent or blur is incomplete.
   - Implement unpublish action and connect published highlights to microsite `#highlights`.
6. **Step 6: End-to-End Browser Journey Verification & Documentation**
   - Build in-repository browser suite `tests/verify-camera-media-e2e.mjs`.
   - Validate 2-owner isolation, player entitlement, privacy gating, and English/Amharic mobile rendering.
   - Update `IMPLEMENTATION_STATUS.md`.
