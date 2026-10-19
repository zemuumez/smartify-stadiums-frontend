# Smartify Stadiums Backend Architecture Specification (Milestone M7)

> **Document Status**: Authoritative Architecture Specification & Engineering Review Baseline  
> **Milestone**: M7 (Backend, API, Schema, Concurrency & Security Architecture Design)  
> **Repository Baseline**: Branch `codex/backend-architecture` (derived from `6ea859b`)  
> **Reference Documents**: [FRONTEND_MASTER_PLAN.md](file:///C:/Users/USER/Documents/GitHub/smartify-stadiums-frontend/FRONTEND_MASTER_PLAN.md), [FRONTEND_ACCEPTANCE.md](file:///C:/Users/USER/Documents/GitHub/smartify-stadiums-frontend/FRONTEND_ACCEPTANCE.md), [SYSTEM_CONCEPT.md](file:///C:/Users/USER/Documents/GitHub/smartify-stadiums-frontend/SYSTEM_CONCEPT.md)  
> **Target Technology Stack**: Go 1.22+, PostgreSQL 16+ (PostGIS), Redis 7+ (asynq), S3-compatible Object Storage  
> **Commercial Policy Status**: All commission fees, subscription prices, and cancellation schedules remain strictly **provisional and configurable** pending formal founder approval.

---

## Table of Contents
1. [Executive Architecture Overview](#1-executive-architecture-overview)
2. [Domain Model & Unified Vocabulary](#2-domain-model--unified-vocabulary)
3. [API Contracts, Authentication & Tenant Authorization](#3-api-contracts-authentication--tenant-authorization)
4. [Database Schema, Concurrency & Idempotency](#4-database-schema-concurrency--idempotency)
5. [Payment Ledger, Webhooks, Reconciliation & Refunds](#5-payment-ledger-webhooks-reconciliation--refunds)
6. [Autonomous Media, Privacy Consent, Retention & Processing Queues](#6-autonomous-media-privacy-consent-retention--processing-queues)
7. [Deployment, Observability, Disaster Recovery & Security Architecture](#7-deployment-observability-disaster-recovery--security-architecture)
8. [Integration Acceptance Test Suite & Verification Matrix](#8-integration-acceptance-test-suite--verification-matrix)

---

## 1. Executive Architecture Overview

### 1.1 Architectural Objectives
The backend architecture for Smartify Stadiums (ET Smart Fields) transitions the verified, founder-approved frontend implementation (Milestone M6, commit `6ea859b`) into an enterprise-grade, multi-tenant sports facility operating system. 

```mermaid
graph TD
    Client[Next.js Frontend / Mobile Clients] -->|HTTPS / WSS| Ingress[Nginx / Envoy API Gateway]
    Ingress -->|Auth & Rate Limiting| Backend[Go Modular Monolith Application Server]
    
    subgraph Core Data & State
        Backend -->|Strict RLS & Serializable| DB[(PostgreSQL 16 + PostGIS)]
        Backend -->|Cache, Locks & Rate Limits| Redis[(Redis 7 Cluster)]
    end
    
    subgraph Asynchronous Pipelines
        Backend -->|Enqueues Tasks| Queue[Redis Asynq Queue]
        Queue -->|Workers| Transcoder[FFmpeg / Media Transcoding Workers]
        Queue -->|Workers| CVWorker[AI Face-Blur & Vision Workers]
        Queue -->|Workers| WebhookWorker[Payment Reconciliation & SMS Workers]
    end
    
    subgraph External & Storage Services
        Transcoder -->|HLS Chunks / MP4| S3Storage[(S3-Compatible Private Bucket)]
        CVWorker -->|Takedown / Redact| S3Storage
        WebhookWorker -->|SMS OTP| EthioTelecom[Ethio Telecom SMS Gateway]
        WebhookWorker -->|Payment Queries| PaymentGW[Telebirr / CBE Birr / Chapa]
    end
```

### 1.2 Non-Negotiable Invariants
1. **Zero Double-Bookings**: Physical court capacity is strictly immutable. If Court 1 is reserved for 18:00–19:00 for Football, no concurrent or overlapping reservation (Basketball, Volleyball, Futsal, or Maintenance Closure) can ever commit, guaranteed by database exclusion constraints.
2. **Multi-Sport Physical Court Sharing**: A physical court may be marked as compatible with multiple sports (e.g. Futsal, Basketball, Volleyball). Sports do not possess independent inventory; they share the single physical court asset.
3. **Multi-Tenant Boundary Isolation**: Venue owners are strictly isolated to their registered venues. Database-level Row-Level Security (RLS) ensures that cross-tenant queries return empty sets or authorization denials even in the event of application logic regressions.
4. **Immutable Append-Only Financial Ledger**: Payment records and financial settlements are never mutated or deleted. Every financial event (collection, refund, adjustment, payout) is an explicit append-only ledger transaction. Derived payment states are calculated dynamically from ledger balances.
5. **Fail-Closed Security & Privacy**: Media recordings default to private. Minor/academy bookings enforce mandatory guardian consent before public rendering. Face-blur pipelines must complete successfully prior to public visibility. Instant revocation immediately unpublishes media.
6. **Provisional Commercial Boundaries**: Commission rates (e.g. 5%), monthly SaaS subscription tiers, and penalty percentages are stored as dynamic configuration parameters with `is_approved = false`. No commercial policy is hardcoded.

---

## 2. Domain Model & Unified Vocabulary

To eliminate discrepancies between frontend TypeScript contracts ([contracts.ts](file:///C:/Users/USER/Documents/GitHub/smartify-stadiums-frontend/frontend/src/services/contracts.ts)) and backend data structures, the domain vocabulary is strictly standardized:

| Domain Entity | Canonical Name | Definition & Invariants |
| :--- | :--- | :--- |
| **User Role** | `Role` | Strictly `'player' \| 'owner' \| 'admin'`. Installers or staff are modeled as venue-scoped capability flags on owner accounts. |
| **Sport** | `Sport` | Strictly `'football' \| 'basketball' \| 'volleyball' \| 'badminton' \| 'tennis' \| 'futsal'`. Running and padel are excluded from the active schema. |
| **Currency** | `Currency` | Strictly `'ETB'`. All monetary values across all database tables, APIs, and logs are non-negative integer minor units (Ethiopian Birr cents: `1 ETB = 100 minor units`). Float/decimal representations are strictly prohibited in the persistence and financial layers. |
| **Venue** | `Venue` | Physical facility entity. Lifecycle status: `'draft' \| 'pending' \| 'changes_requested' \| 'active' \| 'suspended'`. |
| **Court / Field** | `Field` | Physical playable surface owned by a venue. Holds array of supported `Sport[]`, hourly rate in `hourlyRateMinor`, lighting status, camera attachment, and operating hours. |
| **Booking** | `Booking` | Time-bound reservation of a physical court. Status: `'pending' \| 'confirmed' \| 'cancelled' \| 'completed' \| 'no_show'`. Source: `'online' \| 'walk_in'`. |
| **Ledger Entry** | `PaymentTransaction`| Append-only transaction record. Types: `'collection' \| 'refund' \| 'adjustment' \| 'payout'`. Status: `'recorded' \| 'succeeded' \| 'failed'`. |
| **Derived Payment** | `PaymentStatus` | Computed state: `'unpaid' \| 'processing' \| 'partially_paid' \| 'paid' \| 'failed' \| 'refunded' \| 'partially_refunded'`. |
| **Camera Device** | `Camera` | Edge recording hardware. Certification: `'pending' \| 'passed' \| 'failed' \| 'revoked'`. Connectivity: `'online' \| 'offline' \| 'unknown'`. |
| **Match Recording** | `MatchRecording` | Video asset linked to a booking. Status: `'scheduled' \| 'recording' \| 'uploading' \| 'processing' \| 'ready' \| 'failed'`. |
| **Privacy Consent** | `PrivacyConsent` | Participant consent state: `status: 'pending' \| 'granted' \| 'denied' \| 'revoked'`; optional `guardianConsentStatus: 'pending' \| 'granted' \| 'denied'`. |

---

## 3. API Contracts, Authentication & Tenant Authorization

### 3.1 Standard API Envelope & Error Format
All HTTP REST APIs adhere to standardized JSON envelopes with RFC 7807 Problem Details for HTTP errors:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_01JAX89Y7BZ91A20",
    "timestamp": "2026-10-20T00:30:00.000Z"
  }
}
```

Error format (RFC 7807):
```json
{
  "type": "https://api.smartifystadiums.et/errors/conflict",
  "title": "Conflict",
  "status": 409,
  "detail": "This action conflicts with an existing reservation or state. Refresh and try again.",
  "instance": "/bookings",
  "code": "SLOT_ALREADY_RESERVED",
  "requestId": "req_01JAX89Y7BZ91A20"
}
```

### 3.2 Authentication & Phone OTP Lifecycle
1. **Request OTP (`POST /api/v1/auth/request-otp`)**:
   - Request Body: `{"phone": "+251911223344", "roleIntent": "player"}`.
   - Validation: Phone number must validate against Ethiopian telecom prefix patterns (`+2519...` or `+2517...`).
   - Throttling: Redis-backed sliding window rate limiter permits maximum 3 OTP requests per 10 minutes per IP and phone number. 60-second cooldown enforced between requests.
   - Generation: Cryptographically secure pseudo-random 6-digit integer string (`crypto/rand`).
   - Storage: Stored in Redis with key `otp:{phone}` containing Argon2id hash of code, attempt count (max 3), and TTL of 300 seconds (5 minutes). Plaintext OTP is NEVER stored.
   - Dispatch: Dispatched via Ethio Telecom SMS Gateway over secure TLS webhook.
2. **Login / Verify OTP (`POST /api/v1/auth/login`)**:
   - Request Body: `{"phone": "+251911223344", "otp": "482910"}`.
   - Verification: Compares submitted OTP against hashed value using constant-time comparison (`subtle.ConstantTimeCompare`).
   - Protection: Any failed verification increments attempt counter. Reaching 3 failed attempts immediately deletes the Redis key and invalidates the OTP.
   - Successful Session:
     - Sets secure, encrypted HTTP-only cookie `__Host-etsf-session` with `SameSite=Strict`, `Path=/`, `Secure=true`.
     - Generates cryptographically signed JWT containing: `sub` (user UUID), `role` (`player | owner | admin`), `venueId` (if owner), `jti` (session UUID for revocation), `exp` (14 days), `iat`.
     - Redis maintains session record `session:{userId}:{jti}` for instantaneous server-side session revocation.
3. **Session Refresh & Bounded Retries**:
   - Token refresh uses sliding expiration: when remaining lifetime is < 2 days, API responses include a refreshed session cookie.
   - If session verification fails or user account is suspended by platform admin, middleware returns HTTP 401 with `WWW-Authenticate: Bearer error="invalid_token"`, causing frontend client to clear session and preserve current route via `returnTo`.

### 3.3 Multi-Tenant Authorization & Subdomain Routing
1. **Tenant Context Extraction**:
   - Requests entering the API gateway carry either:
     - Custom subdomain: `https://unity-complex.smartifystadiums.et`
     - Path-based microsite identifier: `https://smartifystadiums.et/s/unity-complex`
     - Tenant management header: `X-Venue-Id: venue-2`
   - Gateway verifies hostname or path against `venues` table. If status is `suspended` or `draft`, access is denied or routed to the unpublish/preview renderer based on caller identity.
2. **Row-Level Security Enforcement**:
   - When handling requests on behalf of a authenticated owner, the database connection pool executes:
     ```sql
     SET LOCAL app.current_user_id = 'usr_owner_1';
     SET LOCAL app.current_user_role = 'owner';
     SET LOCAL app.current_tenant_id = 'venue_1';
     ```
   - All queries on tables with a `venue_id` column are filtered by RLS:
     ```sql
     CREATE POLICY venue_isolation_policy ON fields
     FOR ALL TO application_role
     USING (
       app.current_user_role() = 'admin' OR 
       venue_id = app.current_tenant_id()
     );
     ```

### 3.4 Exhaustive API Contract Endpoints

| Domain | Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/request-otp` | Public | Request SMS OTP with rate-limiting. |
| | `POST` | `/api/v1/auth/login` | Public | Verify OTP and issue session cookie. |
| | `POST` | `/api/v1/auth/register` | Public | Register new player or venue owner account. |
| | `GET` | `/api/v1/users/me` | Authenticated | Retrieve authenticated user profile and roles. |
| | `POST` | `/api/v1/auth/logout` | Authenticated | Revoke session in Redis and clear cookie. |
| **Venues** | `GET` | `/api/v1/stadiums` | Public | Search and list active stadiums with filters. |
| | `GET` | `/api/v1/stadiums/:slug` | Public | Get stadium public microsite profile by slug. |
| | `GET` | `/api/v1/stadiums/:id/fields` | Public | List operational courts and pricing for venue. |
| | `GET` | `/api/v1/owner/stadiums` | Owner / Admin | List venues owned by authenticated owner. |
| | `POST` | `/api/v1/owner/stadiums` | Owner | Submit new stadium profile for admin review. |
| | `POST` | `/api/v1/owner/stadiums/:id/submit`| Owner | Request admin verification for draft venue. |
| | `GET` | `/api/v1/owner/stadiums/:id/reviews`| Owner / Admin | Retrieve customer ratings and reviews. |
| **Fields** | `GET` | `/api/v1/owner/fields` | Owner / Admin | List all courts across owned venues. |
| | `POST` | `/api/v1/owner/fields` | Owner | Add new court to owned venue. |
| | `PATCH`| `/api/v1/owner/fields/:id` | Owner | Update court sports, rate, amenities, status. |
| **Bookings**| `GET` | `/api/v1/bookings` | Authenticated | List player bookings or owner venue agenda. |
| | `GET` | `/api/v1/fields/:id/availability` | Public | Query available hourly slots for date. |
| | `POST` | `/api/v1/bookings` | Player | Create online booking reservation with quote. |
| | `POST` | `/api/v1/owner/walk-ins` | Owner | Record walk-in reservation with guest contact. |
| | `POST` | `/api/v1/bookings/:id/reschedule` | Player / Owner | Reschedule booking to new date/time. |
| | `POST` | `/api/v1/bookings/:id/cancel` | Player / Owner | Cancel reservation and restore slot availability. |
| | `GET` | `/api/v1/owner/stadiums/:id/closures`| Owner / Admin | List maintenance closures. |
| | `POST` | `/api/v1/owner/closures` | Owner | Create maintenance closure on court. |
| **CMS** | `GET` | `/api/v1/stadiums/:id/microsite` | Public | Retrieve published microsite content. |
| | `GET` | `/api/v1/owner/stadiums/:id/microsite`| Owner / Admin | Retrieve working draft microsite content. |
| | `PATCH`| `/api/v1/owner/stadiums/:id/microsite`| Owner | Save working draft (branding, hero, media). |
| | `POST` | `/api/v1/owner/stadiums/:id/microsite/publish` | Owner | Publish working draft to public `/s/:slug`. |
| | `POST` | `/api/v1/owner/stadiums/:id/microsite/unpublish` | Owner | Unpublish microsite to draft-only mode. |
| **Teams** | `GET` | `/api/v1/teams` | Public | List community teams with sports filter. |
| | `GET` | `/api/v1/teams/:id` | Public | Get team detail, roster, public matches. |
| | `POST` | `/api/v1/teams` | Player | Create community team (assigns creator captain).|
| | `POST` | `/api/v1/teams/:id/join` | Player | Submit team membership request. |
| | `GET` | `/api/v1/teams/:id/my-request` | Player | Query status of user's join request. |
| | `POST` | `/api/v1/teams/:id/leave` | Player | Leave team membership (non-captain). |
| | `GET` | `/api/v1/teams/:id/requests` | Team Captain | List pending join requests. |
| | `POST` | `/api/v1/teams/:id/requests/:requestId/approve`| Team Captain | Approve member join request. |
| | `POST` | `/api/v1/teams/:id/requests/:requestId/reject` | Team Captain | Reject member join request. |
| | `DELETE`|`/api/v1/teams/:id/members/:memberId` | Team Captain | Remove member from team roster. |
| | `GET` | `/api/v1/teams/:id/bookings` | Team Member | List team-badged bookings (financials masked for non-captains). |
| **Events** | `GET` | `/api/v1/venues/:id/events` | Public | List upcoming tournaments and events. |
| | `GET` | `/api/v1/venues/:id/events/:eventId` | Public | Get event details, format, capacity. |
| | `POST` | `/api/v1/venues/:id/events/:eventId/registrations` | Player / Captain | Register for event (team, singles, doubles). |
| | `POST` | `/api/v1/venues/:id/events/:eventId/registrations/:regId/cancel`| Player / Captain | Cancel event registration and free spot. |
| **Media** | `GET` | `/api/v1/owner/cameras` | Owner / Admin | List hardware camera devices and statuses. |
| | `POST` | `/api/v1/owner/cameras` | Owner | Register new hardware camera device. |
| | `PATCH`| `/api/v1/owner/cameras/:id` | Owner | Update camera device parameters. |
| | `GET` | `/api/v1/admin/cameras` | Admin | Administrative camera certification overview. |
| | `POST` | `/api/v1/admin/cameras/:id/certify` | Admin | Certify camera hardware (pass/fail/revoke). |
| | `GET` | `/api/v1/owner/recordings` | Owner / Admin | List match recordings and processing states. |
| | `GET` | `/api/v1/owner/recordings/:id` | Owner / Admin | Get recording detail, consent, blur telemetry. |
| | `POST` | `/api/v1/owner/recordings/:id/consent` | Owner / Admin | Record participant or guardian consent. |
| | `POST` | `/api/v1/owner/recordings/:id/privacy-blur` | Owner / Admin | Mark face-blur processing completed. |
| | `POST` | `/api/v1/owner/recordings/:id/publication`| Owner | Publish recording (private/unlisted/public). |
| | `POST` | `/api/v1/owner/recordings/:id/unpublish` | Owner | Unpublish recording immediately. |
| | `GET` | `/api/v1/bookings/:id/replay` | Entitled Player | Obtain temporary signed HLS playback manifest. |
| | `POST` | `/api/v1/owner/recordings/:id/entitlements` | Owner / Admin | Grant match replay playback entitlement. |
| | `GET` | `/api/v1/venues/:id/highlights` | Public | List published public highlight clips. |
| **Finance**| `GET` | `/api/v1/commercial-policy` | Authenticated | Inspect current provisional commercial terms. |
| | `GET` | `/api/v1/owner/invoices` | Owner / Admin | List monthly platform software invoices. |
| | `GET` | `/api/v1/owner/analytics` | Owner / Admin | Venue gross, collections, refunds, utilization. |
| | `POST` | `/api/v1/owner/bookings/:id/settle` | Owner | Record cash or POS on-site payment collection. |
| | `POST` | `/api/v1/owner/bookings/:id/refund` | Owner / Admin | Issue refund transaction with required reason. |
| | `GET` | `/api/v1/bookings/:id/financials` | Authenticated | View immutable transaction receipts and ledger.|
| | `GET` | `/api/v1/owner/venues/:id/transactions`| Owner / Admin | List venue-wide transaction ledger. |
| **Admin** | `GET` | `/api/v1/admin/users` | Admin | Search users, inspect roles and status. |
| | `PATCH`| `/api/v1/admin/users/:id/status` | Admin | Suspend or reactivate user with reason. |
| | `GET` | `/api/v1/admin/stadiums` | Admin | List stadiums pending verification review. |
| | `POST` | `/api/v1/admin/stadiums/:id/review` | Admin | Approve, request changes, or suspend venue. |
| | `GET` | `/api/v1/admin/audit` | Admin | Query immutable administrative audit events. |
| | `GET` | `/api/v1/admin/analytics` | Admin | Platform-wide financial aggregates. |
| **Support**| `GET` | `/api/v1/support/cases` | Authenticated | List support tickets (player/owner/admin). |
| | `GET` | `/api/v1/support/cases/:id` | Authenticated | Get ticket thread (internal notes sanitized). |
| | `POST` | `/api/v1/support/cases` | Authenticated | Submit new support inquiry. |
| | `POST` | `/api/v1/support/cases/:id/messages` | Authenticated | Post reply message to support thread. |
| | `PATCH`| `/api/v1/support/cases/:id` | Owner / Admin | Update ticket priority or resolution status. |

---

## 4. Database Schema, Concurrency & Idempotency

### 4.1 Complete Relational DDL (PostgreSQL 16)
The database design mandates exact foreign key constraints, check constraints, default timestamps in UTC, and integer minor units:

```sql
-- Core Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Enumerated Types
CREATE TYPE user_role AS ENUM ('player', 'owner', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_verification');
CREATE TYPE venue_status AS ENUM ('draft', 'pending', 'changes_requested', 'active', 'suspended');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE booking_source AS ENUM ('online', 'walk_in');
CREATE TYPE transaction_type AS ENUM ('collection', 'refund', 'adjustment', 'payout');
CREATE TYPE transaction_status AS ENUM ('recorded', 'succeeded', 'failed');
CREATE TYPE camera_certification AS ENUM ('pending', 'passed', 'failed', 'revoked');
CREATE TYPE camera_connectivity AS ENUM ('online', 'offline', 'unknown');
CREATE TYPE recording_status AS ENUM ('scheduled', 'recording', 'uploading', 'processing', 'ready', 'failed');
CREATE TYPE consent_status AS ENUM ('pending', 'granted', 'denied', 'revoked');
CREATE TYPE blur_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE media_visibility AS ENUM ('private', 'unlisted', 'public');
CREATE TYPE support_category AS ENUM ('booking', 'payment', 'recording', 'general');
CREATE TYPE support_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE support_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    role user_role NOT NULL DEFAULT 'player',
    status user_status NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Venues Table
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(80) UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(120) NOT NULL,
    city VARCHAR(60) NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    open_hour SMALLINT NOT NULL CHECK (open_hour >= 0 AND open_hour <= 23),
    close_hour SMALLINT NOT NULL CHECK (close_hour >= 1 AND close_hour <= 24 AND close_hour > open_hour),
    amenities TEXT[] DEFAULT '{}',
    primary_color VARCHAR(10) NOT NULL DEFAULT '#1a4329',
    review_rating NUMERIC(3, 2) DEFAULT 0.00 CHECK (review_rating >= 0 AND review_rating <= 5.00),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    status venue_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Fields / Courts Table (Physical Inventory)
CREATE TABLE fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sports VARCHAR(30)[] NOT NULL,
    surface VARCHAR(60) NOT NULL,
    hourly_rate_minor BIGINT NOT NULL CHECK (hourly_rate_minor > 0),
    lighting BOOLEAN NOT NULL DEFAULT false,
    changing_room BOOLEAN NOT NULL DEFAULT false,
    camera BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    open_hour SMALLINT NOT NULL CHECK (open_hour >= 0 AND open_hour <= 23),
    close_hour SMALLINT NOT NULL CHECK (close_hour >= 1 AND close_hour <= 24 AND close_hour > open_hour),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Bookings Table (With Strict Physical Exclusion Constraint)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    field_id UUID NOT NULL REFERENCES fields(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sport VARCHAR(30) NOT NULL,
    booking_date DATE NOT NULL,
    start_hour SMALLINT NOT NULL CHECK (start_hour >= 0 AND start_hour <= 23),
    end_hour SMALLINT NOT NULL CHECK (end_hour >= 1 AND end_hour <= 24 AND end_hour > start_hour),
    total_minor BIGINT NOT NULL CHECK (total_minor >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'ETB',
    status booking_status NOT NULL DEFAULT 'pending',
    source booking_source NOT NULL DEFAULT 'online',
    guest_name VARCHAR(100),
    guest_phone VARCHAR(20),
    team_id UUID,
    team_name VARCHAR(100),
    idempotency_key UUID UNIQUE,
    original_schedule JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Invariant: Walk-in bookings require guest name; Online bookings require registered user_id
    CONSTRAINT chk_booking_attribution CHECK (
        (source = 'walk_in' AND guest_name IS NOT NULL) OR
        (source = 'online' AND user_id IS NOT NULL)
    )
);

-- 5. Field Maintenance Closures Table
CREATE TABLE field_closures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    closure_date DATE NOT NULL,
    start_hour SMALLINT NOT NULL CHECK (start_hour >= 0 AND start_hour <= 23),
    end_hour SMALLINT NOT NULL CHECK (end_hour >= 1 AND end_hour <= 24 AND end_hour > start_hour),
    reason TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Physical Court Double-Booking Exclusion Constraint
-- Prevents any overlapping reservations on the same physical court for active bookings
ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_court_bookings
EXCLUDE USING gist (
    field_id WITH =,
    booking_date WITH =,
    int4range(start_hour, end_hour) WITH &&
)
WHERE (status IN ('pending', 'confirmed'));

-- 6. Payment Transactions Table (Append-Only Ledger)
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    type transaction_type NOT NULL,
    amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'ETB',
    payment_method VARCHAR(50) NOT NULL,
    gateway_reference VARCHAR(120),
    status transaction_status NOT NULL DEFAULT 'recorded',
    idempotency_key UUID UNIQUE,
    reason TEXT,
    staff_user_id UUID REFERENCES users(id),
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Autonomous Cameras Table
CREATE TABLE cameras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    device_serial VARCHAR(80) UNIQUE NOT NULL,
    model VARCHAR(80) NOT NULL,
    rtmp_stream_url TEXT,
    certification_status camera_certification NOT NULL DEFAULT 'pending',
    certified_by UUID REFERENCES users(id),
    certified_at TIMESTAMPTZ,
    connectivity_status camera_connectivity NOT NULL DEFAULT 'unknown',
    last_heartbeat TIMESTAMPTZ,
    telemetry JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Match Recordings Table
CREATE TABLE match_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    field_id UUID NOT NULL REFERENCES fields(id) ON DELETE RESTRICT,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    camera_id UUID REFERENCES cameras(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    status recording_status NOT NULL DEFAULT 'scheduled',
    storage_key TEXT,
    thumbnail_key TEXT,
    consent_status consent_status NOT NULL DEFAULT 'pending',
    guardian_consent_status consent_status NOT NULL DEFAULT 'pending',
    face_blur_status blur_status NOT NULL DEFAULT 'pending',
    visibility media_visibility NOT NULL DEFAULT 'private',
    retention_days INTEGER NOT NULL DEFAULT 30,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Replay Entitlements Table
CREATE TABLE replay_entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recording_id UUID NOT NULL REFERENCES match_recordings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    granted_by UUID NOT NULL REFERENCES users(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_recording_user_entitlement UNIQUE (recording_id, user_id)
);

-- 10. Commercial Policies Table (Configurable & Provisional)
CREATE TABLE commercial_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    commission_rate_basis_points INTEGER CHECK (commission_rate_basis_points >= 0 AND commission_rate_basis_points <= 10000),
    subscription_monthly_minor BIGINT CHECK (subscription_monthly_minor >= 0),
    is_approved BOOLEAN NOT NULL DEFAULT false,
    notes TEXT NOT NULL DEFAULT 'Provisional policy pending founder commercial approval',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Idempotency Keys Storage Table
CREATE TABLE idempotency_records (
    key UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    request_path VARCHAR(255) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    response_status INTEGER,
    response_body JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Indices for Production High-Velocity Queries
CREATE INDEX idx_bookings_lookup ON bookings (venue_id, booking_date, field_id);
CREATE INDEX idx_bookings_user ON bookings (user_id);
CREATE INDEX idx_transactions_booking ON payment_transactions (booking_id);
CREATE INDEX idx_transactions_venue ON payment_transactions (venue_id);
CREATE INDEX idx_recordings_booking ON match_recordings (booking_id);
CREATE INDEX idx_fields_venue_active ON fields (venue_id) WHERE active = true;
CREATE INDEX idx_closures_lookup ON field_closures (field_id, closure_date);
```

### 4.2 Booking Concurrency Architecture
Under peak reservation rushes (e.g. 17:00–21:00 weekday fixtures across Addis Ababa), multiple users often attempt to reserve the same slot concurrently. The system employs a two-tier concurrency control architecture:

```mermaid
sequenceDiagram
    autonumber
    actor PlayerA as Player A
    actor PlayerB as Player B
    participant API as Booking Handler
    participant DB as PostgreSQL Transaction
    
    PlayerA->>API: POST /bookings (Court 1, 18:00-19:00, Key A)
    PlayerB->>API: POST /bookings (Court 1, 18:00-19:00, Key B)
    
    API->>DB: BEGIN SERIALIZABLE
    Note over DB: Check court closures and operating hours
    DB->>DB: INSERT INTO bookings ... (Player A)
    DB-->>API: Row Inserted & Exclusion Constraint Verified
    API->>DB: COMMIT
    API-->>PlayerA: 201 Created (Booking Reference Confirmed)
    
    API->>DB: BEGIN SERIALIZABLE
    Note over DB: Insert Player B overlapping int4range(18, 19)
    DB-->>API: ERROR 23P01 exclusion_violation: no_overlapping_court_bookings
    API->>DB: ROLLBACK
    API-->>PlayerB: 409 Conflict ("This action conflicts with an existing reservation or state.")
```

1. **PostgreSQL Exclusion Constraints (`EXCLUDE USING gist`)**:
   - `int4range(start_hour, end_hour) WITH &&` guarantees mathematical non-overlap at the storage engine level.
   - Operates safely across all connection pool workers without requiring distributed Redis locks for correctness.
   - Enforces conflict across multi-sport reservations on shared physical courts (e.g. basketball booking prevents futsal on Court 1).
2. **Maintenance Closures Validation**:
   - Before inserting, an atomic subquery verifies `NOT EXISTS (SELECT 1 FROM field_closures WHERE field_id = $1 AND closure_date = $2 AND int4range(start_hour, end_hour) && int4range($3, $4))`.
3. **Idempotency Guarantee Mechanism**:
   - Client sends unique `idempotencyKey` UUID (generated client-side via `crypto.randomUUID()`).
   - Handler acquires an atomic insert lock in `idempotency_records`.
   - If key already exists with identical `request_hash`, cached response is returned immediately with `X-Cache-Lookup: HIT`.
   - If key exists with different payload hash, handler aborts with HTTP 422 `IDEMPOTENCY_PAYLOAD_MISMATCH`.

---

## 5. Payment Ledger, Webhooks, Reconciliation & Refunds

### 5.1 Immutable Append-Only Ledger & Dynamic Status Derivation
The platform operates on double-entry ledger principles. Balance updates are strictly computed, never stored as mutable status columns:

```sql
CREATE OR REPLACE FUNCTION compute_booking_financials(p_booking_id UUID)
RETURNS TABLE (
    total_minor BIGINT,
    collected_minor BIGINT,
    refunded_minor BIGINT,
    net_collected_minor BIGINT,
    outstanding_minor BIGINT,
    payment_status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    WITH tx_summary AS (
        SELECT 
            COALESCE(SUM(CASE WHEN type = 'collection' AND status = 'succeeded' THEN amount_minor ELSE 0 END), 0) AS total_collected,
            COALESCE(SUM(CASE WHEN type = 'refund' AND status = 'succeeded' THEN amount_minor ELSE 0 END), 0) AS total_refunded
        FROM payment_transactions
        WHERE booking_id = p_booking_id
    ),
    booking_info AS (
        SELECT b.total_minor AS req_total
        FROM bookings b
        WHERE b.id = p_booking_id
    )
    SELECT 
        b.req_total AS total_minor,
        t.total_collected AS collected_minor,
        t.total_refunded AS refunded_minor,
        (t.total_collected - t.total_refunded) AS net_collected_minor,
        GREATEST(0, b.req_total - (t.total_collected - t.total_refunded)) AS outstanding_minor,
        CASE
            WHEN t.total_collected = 0 THEN 'unpaid'::VARCHAR(20)
            WHEN t.total_refunded > 0 AND (t.total_collected - t.total_refunded) = 0 THEN 'refunded'::VARCHAR(20)
            WHEN t.total_refunded > 0 AND (t.total_collected - t.total_refunded) > 0 THEN 'partially_refunded'::VARCHAR(20)
            WHEN (t.total_collected - t.total_refunded) >= b.req_total THEN 'paid'::VARCHAR(20)
            WHEN (t.total_collected - t.total_refunded) < b.req_total THEN 'partially_paid'::VARCHAR(20)
            ELSE 'unpaid'::VARCHAR(20)
        END AS payment_status
    FROM booking_info b, tx_summary t;
END;
$$ LANGUAGE plpgsql STABLE;
```

### 5.2 Payment Gateway Webhook Architecture
Ethiopian mobile money providers (Telebirr, CBE Birr, Chapa) communicate transaction results asynchronously via HTTP callbacks:

```mermaid
sequenceDiagram
    autonumber
    participant Gateway as Payment Gateway (Telebirr / CBE / Chapa)
    participant Ingress as API Ingress / Webhook Handler
    participant Queue as Redis Asynq Worker
    participant DB as PostgreSQL Ledger
    
    Gateway->>Ingress: POST /api/v1/webhooks/payments/telebirr (HMAC Signature Header)
    Note over Ingress: Verify HMAC-SHA256 signature using shared secret
    alt Invalid Signature
        Ingress-->>Gateway: 401 Unauthorized (Rejected immediately)
    else Valid Signature
        Ingress->>DB: INSERT INTO processed_webhooks (event_id, payload) ON CONFLICT DO NOTHING
        Ingress-->>Gateway: 200 OK {"received": true}
        Ingress->>Queue: Enqueue PaymentReconciliationJob(eventId)
    end
    
    Queue->>DB: BEGIN TRANSACTION
    Queue->>DB: INSERT INTO payment_transactions (type='collection', status='succeeded', ...)
    Queue->>DB: UPDATE bookings SET status = 'confirmed' WHERE id = bookingId
    Queue->>DB: COMMIT TRANSACTION
```

1. **Cryptographic Webhook Verification**:
   - Gateway requests must provide an `X-Signature-SHA256` or equivalent authorization header.
   - Handler calculates `hmac_sha256(raw_body, gateway_secret)` using constant-time comparison.
   - Raw request body is validated against replay attacks by inspecting timestamp skews (> 300 seconds rejected).
2. **Idempotent Delivery Handling**:
   - `processed_webhooks` table tracks unique `(gateway, event_id)`.
   - Repeated webhook deliveries from the gateway return HTTP 200 immediately without adding duplicate collections to the ledger.
3. **Refund Integrity**:
   - An owner or administrator issuing a refund MUST provide a non-empty `reason`.
   - Engine verifies `refund_amount <= net_collected_minor`. Any attempt to refund more than net collected funds fails validation with HTTP 422.

---

## 6. Autonomous Media, Privacy Consent, Retention & Processing Queues

### 6.1 Hardware Camera Lifecycle & Telemetry
1. **Camera Certification Protocol**:
   - Hardware units are registered by venue owners with serial number and RTSP stream endpoint.
   - Default certification status is strictly `pending`. Uncertified cameras CANNOT record or stream.
   - Platform administrators inspect the test stream in `/admin/cameras`. If resolution is >= 1080p, framerate >= 30fps, and bitrate stable, admin issues `passed` certification.
   - If stream exhibits packet drop, failed frames, or positioning errors, admin marks `failed` with actionable troubleshooting guidance.
2. **Heartbeat & Telemetry Monitor**:
   - Camera hardware agents ping `POST /api/v1/cameras/:id/heartbeat` every 30 seconds.
   - Heartbeat updates `last_heartbeat` and records telemetry: CPU temperature, storage remaining, dropped frames.
   - Background worker flags cameras with missing heartbeats (> 90s) as `offline`.

### 6.2 Privacy Consent & Minor Protection Pipeline
The platform enforces strict Ethiopian data privacy and minor protection standards:

```mermaid
stateDiagram-v2
    [*] --> Scheduled: Booking Confirmed
    Scheduled --> Recording: Match Start Hour
    Recording --> Uploading: Match End Hour
    Uploading --> Processing: Chunks Ingested to S3
    
    state Processing {
        [*] --> Transcoding: HLS 1080p/720p/480p
        Transcoding --> FaceBlurring: Detect Non-Consenting Faces
        FaceBlurring --> Completed: Blur Applied
    }
    
    Processing --> Ready: Video Ready (Private)
    
    state ConsentGate <<choice>>
    Ready --> ConsentGate: Owner Requests Publication
    
    ConsentGate --> Public: Consent Granted & Blur Completed
    ConsentGate --> Blocked: Consent Denied or Minor Missing Guardian Consent
    
    Public --> Private: Consent Revoked by Any Participant (Immediate Takedown)
```

1. **Pre-Publication Consent Verification**:
   - Every participant in a fixture booking can grant or deny recording consent.
   - If a booking is tagged as a youth, school, or academy fixture, `guardianConsentStatus` MUST be verified as `granted`.
   - If any participant marks consent as `denied` or guardian consent is missing, publication action is strictly blocked with HTTP 403 `CONSENT_REQUIREMENT_UNMET`.
2. **Automated Face-Blurring Pipeline**:
   - Background worker runs automated face detection across all match footage.
   - Non-consenting participants and background spectators are blurred using Gaussian kernel filters in FFmpeg.
   - `face_blur_status` transitions from `pending` -> `processing` -> `completed`.
3. **Instant Revocation & Takedown Hook**:
   - A participant may revoke consent at any time post-match via the support portal or privacy controls.
   - Revocation triggers an immediate atomic update: `visibility = 'private'`, sets `consent_status = 'revoked'`, and purges CDN cache edge points within 15 seconds.

### 6.3 Secure Replay Streaming & Access Entitlements
1. **Private S3 Storage Buckets**:
   - Master MP4 and HLS directory manifests (`index.m3u8`, `segment_*.ts`) reside in private S3 buckets. Public read ACLs are completely disabled.
2. **Signed Streaming URLs**:
   - When an entitled player clicks "Match Replay", API verifies entitlement in `replay_entitlements`.
   - API issues an asymmetric HMAC-signed playback manifest URL expiring in 3,600 seconds (60 minutes).
   - Video streaming manifests include tokenized segments, preventing unauthorized hotlinking or scraping.

### 6.4 Retention & Queue Architecture
- **Queue Engine**: Redis-backed `asynq` providing priority queues:
  - `queue:critical`: Payment webhooks, OTP SMS, immediate privacy takedowns.
  - `queue:default`: Booking notifications, support updates.
  - `queue:media`: Video transcoding, face blurring, thumbnail generation.
- **Retention Lifecycle**:
  - Footage retention defaults to 30 days (`retention_days = 30`).
  - Daily cron worker identifies recordings where `expires_at <= NOW()`.
  - Sends warning notifications to venue owner at 7 days and 2 days prior to expiration.
  - Upon expiration, deletes S3 objects and marks record `status = 'failed'` / deleted.

---

## 7. Deployment, Observability, Disaster Recovery & Security Architecture

### 7.1 Production Deployment Topology
```mermaid
graph TD
    subgraph Internet
        DNS[Cloudflare Anycast DNS / CDN / DDoS Shield]
    end
    
    subgraph Ingress Tier
        LB[Load Balancers Nginx / Envoy - SSL Termination]
    end
    
    subgraph Compute Cluster - Private Subnet
        API1[Go API Service Pod 1]
        API2[Go API Service Pod 2]
        Worker1[Asynq Media Worker Pod 1]
        Worker2[Asynq Queue Worker Pod 2]
    end
    
    subgraph Data Tier - Dedicated Isolated Subnet
        DBMaster[(PostgreSQL 16 Primary)]
        DBReplica[(PostgreSQL 16 Read Replica)]
        RedisCluster[(Redis 7 Sentinel Cluster)]
        S3Storage[(MinIO / Ceph / AWS S3)]
    end
    
    DNS -->|TLS 1.3| LB
    LB --> API1
    LB --> API2
    API1 --> DBMaster
    API2 --> DBMaster
    API1 --> DBReplica
    API2 --> DBReplica
    API1 --> RedisCluster
    API2 --> RedisCluster
    Worker1 --> S3Storage
    Worker2 --> S3Storage
    Worker1 --> RedisCluster
    Worker2 --> RedisCluster
    Worker1 --> DBMaster
    Worker2 --> DBMaster
```

### 7.2 Observability & Telemetry Framework
1. **Structured Logging**:
   - Go service emits JSON-formatted logs with standardized fields: `timestamp`, `level`, `requestId`, `userId`, `tenantId`, `method`, `path`, `status`, `durationMs`, `error`.
   - Correlation IDs (`X-Request-Id`) are generated at ingress and propagated across background workers and database session traces.
2. **Prometheus Metrics**:
   - `http_requests_total{handler, status_code}`: Request rates and HTTP error rates.
   - `http_request_duration_seconds{handler}`: Request latency percentiles (p50, p95, p99).
   - `active_court_bookings{venue_id, sport}`: Real-time facility occupancy.
   - `payment_collections_total_minor{gateway, status}`: Monetary transaction velocity.
   - `camera_health_status{venue_id, camera_id}`: Edge hardware availability.
3. **Health Probes**:
   - Liveness Probe: `GET /healthz/liveness` (returns 200 if process event loop is responsive).
   - Readiness Probe: `GET /healthz/readiness` (returns 200 only if PostgreSQL master connection, Redis pool, and S3 bucket health checks succeed).

### 7.3 Disaster Recovery, Backups & Business Continuity
1. **Continuous Backup Strategy**:
   - Continuous archiving of PostgreSQL Write-Ahead Logs (WAL) via `pgBackRest` to geographically remote object storage.
   - Full automated database snapshot performed every 24 hours at 02:00 EAT (UTC+3).
2. **Recovery Targets**:
   - **Recovery Point Objective (RPO)**: < 15 minutes (guaranteed by continuous WAL archiving).
   - **Recovery Time Objective (RTO)**: < 60 minutes (automated container failover and replica promotion).
3. **Zero-Downtime Migration Pattern**:
   - Database migrations use the expand-and-contract pattern.
   - New columns must be nullable or possess non-locking defaults.
   - Columns are never dropped or renamed in a single release step.

---

## 8. Integration Acceptance Test Suite & Verification Matrix

The future backend repository must implement an automated integration test suite (Go `testing` package with `testcontainers-go` spinning up isolated PostgreSQL 16 and Redis 7 containers). Every test below maps directly to the verified frontend acceptance journeys:

| Test ID | Test Scenario & Concurrency Target | Expected Assertion & Exit Criteria |
| :--- | :--- | :--- |
| **TC-BE-01** | **Concurrent Booking Race Condition**: 50 parallel goroutines attempt to book the identical court interval (`2026-11-01 18:00–19:00`, Court 1). | Exactly 1 goroutine receives HTTP 201 Created with valid booking reference; remaining 49 receive HTTP 409 Conflict with `SLOT_ALREADY_RESERVED`. |
| **TC-BE-02** | **Multi-Sport Shared Court Conflict**: Create confirmed booking for Football on Court 1 (10:00–12:00); attempt concurrent booking for Futsal and Basketball on Court 1 for overlapping times. | Futsal (11:00–12:00) and Basketball (10:00–11:00) both fail with HTTP 409. Adjacent slot (12:00–13:00) succeeds with HTTP 201. |
| **TC-BE-03** | **Idempotency Key Verification**: Submit booking with idempotency key UUID `K1`. Re-submit identical request with `K1`. Submit altered request (different hour) with `K1`. | Second identical request returns identical 201 response payload without inserting duplicate row. Third altered request returns HTTP 422 `IDEMPOTENCY_PAYLOAD_MISMATCH`. |
| **TC-BE-04** | **Multi-Tenant RLS Enforcement**: Owner 1 attempts to query, close, or modify Court 3 belonging to Venue 2. | Query returns HTTP 404 Not Found or 403 Forbidden; database RLS verifies 0 rows affected. |
| **TC-BE-05** | **Append-Only Financial Ledger Integrity**: Settle booking for ETB 2,500; verify status is `paid`. Issue partial refund of ETB 1,000; verify status is `partially_refunded`. Attempt refund of ETB 2,000. | Final refund rejected with HTTP 422 (`REFUND_EXCEEDS_COLLECTED`); transaction table contains exactly 2 records; balance remains ETB 1,500. |
| **TC-BE-06** | **Payment Webhook HMAC Verification**: Send Telebirr webhook with valid signature; verify collection is recorded. Re-send webhook with altered payload or forged signature. | Valid webhook returns 200 and commits ledger; invalid signature returns HTTP 401 Unauthorized with zero database mutations. |
| **TC-BE-07** | **Minor Privacy Consent Enforcement**: Match recording on youth fixture attempts publication without guardian consent. | API rejects with HTTP 403 `GUARDIAN_CONSENT_REQUIRED`. Granting guardian consent and face-blur completion allows publication to `public`. |
| **TC-BE-08** | **Immediate Consent Revocation Takedown**: Public recording receives participant consent revocation. | API immediately flips visibility to `private`, sets `consent_status = 'revoked'`, and purges edge streaming cache. |

---

## 9. Conclusion & Next Steps

This specification establishes the authoritative engineering blueprint for Milestone M7. It formally satisfies all prerequisites identified during frontend acceptance:
1. Complete, typed REST API definitions mapped to frontend service singletons.
2. Mathematical concurrency exclusion guarantees eliminating double-bookings.
3. Append-only ledger accounting with Ethiopian mobile gateway webhook verification.
4. Comprehensive privacy, consent, face-blur, and secure streaming pipelines.
5. Production-grade disaster recovery, RLS tenant security, and testcontainer-driven integration suites.

**Formal Review Required**: Review and approval of this architectural specification by the founder and project leads before initiating backend codebase provisioning.
