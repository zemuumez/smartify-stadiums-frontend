# Milestone M7: Backend Architecture Handoff & Review Guide

> **Document Type**: Engineering Handoff & Founder Review Guide  
> **Milestone**: M7 (Backend, API, Schema, Concurrency & Security Architecture Design)  
> **Branch**: `codex/backend-architecture`  
> **Base Commit**: `6ea859b` (M6 Frontend Acceptance Merge)  
> **Primary Specification**: [BACKEND_ARCHITECTURE.md](file:///C:/Users/USER/Documents/GitHub/smartify-stadiums-frontend/BACKEND_ARCHITECTURE.md)  
> **Prepared Date**: October 20, 2026  

---

## 1. Executive Summary: What Was Done in This Branch

Branch `codex/backend-architecture` transitions the Smartify Stadiums platform from a verified frontend with simulated demo storage into a production-ready, enterprise-grade backend architecture. 

During Milestone M6, we verified 46 routes, 99 unit/integration tests, and 32 end-to-end browser journeys across two isolated stadium tenants, ensuring 100% truthful content, zero fake success, and strict physical court modeling. However, as documented in `AGENTS.md` and `FRONTEND_ACCEPTANCE.md`, **frontend acceptance does not establish production security, concurrency guarantees, or real-money payment readiness**.

This branch establishes the authoritative architectural blueprint ([`BACKEND_ARCHITECTURE.md`](file:///C:/Users/USER/Documents/GitHub/smartify-stadiums-frontend/BACKEND_ARCHITECTURE.md)) resolving all backend requirements before code scaffolding begins.

---

## 2. Key Architecture Pillars Delivered

### Pillar 1: API Contracts & Authentication / Multi-Tenant Isolation
- **1:1 Alignment with Frontend Services**: Defined typed REST endpoints directly implementing the 11 domain singletons in `frontend/src/services/` (`authService`, `venuesService`, `fieldsService`, `bookingsService`, `contentService`, `teamsService`, `eventsService`, `mediaService`, `billingService`, `adminService`, `supportService`).
- **Standardized Error Format**: RFC 7807 Problem Details (`type`, `title`, `status`, `detail`, `code`, `requestId`) across all API endpoints.
- **Ethiopian Phone OTP Lifecycle**:
  - Regex validation for Ethio Telecom prefixes (`+2519...`, `+2517...`).
  - Argon2id cryptographic hashing of 6-digit OTPs with 5-minute TTL in Redis.
  - Rate limiting: max 3 requests per 10 minutes with 60-second resend cooldown.
  - Constant-time verification with automatic invalidation after 3 failed attempts.
- **Session Architecture**: Sliding JWT session tokens wrapped in secure, encrypted HTTP-only cookies (`__Host-etsf-session`, `SameSite=Strict`, `Secure=true`).
- **Database-Level Row-Level Security (RLS)**: Enforces `app.current_tenant_id` at the PostgreSQL connection level, preventing cross-tenant data leaks even in the presence of application-level bugs.

### Pillar 2: Database Schema & Mathematical Concurrency Guarantees
- **Relational PostgreSQL 16 + PostGIS DDL**: 11 core tables designed with strict foreign key cascades, default UTC timestamps, and integer minor units (`hourly_rate_minor`, `total_minor` in ETB cents; floating-point money is prohibited).
- **Physical Court Exclusion Constraint (`no_overlapping_court_bookings`)**:
  ```sql
  ALTER TABLE bookings
  ADD CONSTRAINT no_overlapping_court_bookings
  EXCLUDE USING gist (
      field_id WITH =,
      booking_date WITH =,
      int4range(start_hour, end_hour) WITH &&
  )
  WHERE (status IN ('pending', 'confirmed'));
  ```
  - **Zero Double-Bookings**: Guarantees at the storage engine level that two concurrent requests can never book the same physical court for overlapping hours.
  - **Multi-Sport Sharing**: A physical court compatible with Football, Basketball, and Volleyball shares one `field_id`. A reservation for Basketball physically blocks Futsal for that hour.
- **Atomic Idempotency Engine**: Dedicated `idempotency_records` table tracking `(key, user_id, request_hash)`. Prevents duplicate billing or duplicate bookings on network retries.

### Pillar 3: Append-Only Financial Ledger & Webhooks
- **Immutable Ledger Accounting**: Transactions are strictly appended to `payment_transactions` (`collection`, `refund`, `adjustment`, `payout`). Historical financial records are never modified or deleted.
- **Dynamic Payment Status Derivation**:
  - Function `compute_booking_financials` dynamically calculates balances (`unpaid`, `partially_paid`, `paid`, `partially_refunded`, `refunded`) from collection vs. refund aggregates.
- **Ethiopian Payment Gateway Webhooks**:
  - Webhook endpoints for Telebirr, CBE Birr, and Chapa.
  - HMAC-SHA256 signature verification over raw request bodies.
  - Idempotent event processing tracking `(gateway, event_id)` to ignore duplicate callbacks.
- **Refund Invariants**:
  - Refunds cannot exceed net collected funds (`refund_amount <= net_collected_minor`).
  - Mandatory refund reason required on all refund operations.
- **Provisional Commercial Boundaries**: Commission rates (5%), SaaS subscription tiers, and penalty schedules remain runtime configuration parameters with `is_approved = false` until founder approval.

### Pillar 4: Autonomous Media, Privacy Consent & Secure Streaming
- **Camera Device Certification**: New cameras start in `pending` certification; recording and live streaming are physically disabled until an administrator tests video telemetry and approves (`passed`).
- **Minor / Academy Protection**: Match recordings involving youth fixtures require verified `guardianConsentStatus: 'granted'` before public publication is unlocked.
- **Automated Face-Blurring Pipeline**: Computer vision worker blurs non-consenting participants and spectators using FFmpeg Gaussian filtering (`face_blur_status: pending -> processing -> completed`).
- **Instant Consent Revocation & Takedown**: Revoking consent immediately flips visibility from `public` to `private` and purges edge CDN caches within 15 seconds.
- **Private S3 Storage & Signed Playback URLs**: Raw video files are stored in private buckets. Entitled players receive short-lived (60-minute) HMAC-signed HLS manifest URLs.

### Pillar 5: Deployment, Observability & Integration Acceptance
- **Modular Topology**: Go backend service, Nginx/Envoy API Gateway, PostgreSQL 16 primary/replica with PostGIS, Redis 7 Sentinel, and private S3-compatible storage.
- **Observability Framework**: JSON structured logs with correlation IDs (`X-Request-Id`), Prometheus metrics, and `/healthz/liveness` / `/healthz/readiness` probes.
- **Disaster Recovery**: Continuous WAL archiving with Point-in-Time Recovery (RPO < 15 min, RTO < 60 min).
- **Automated Integration Acceptance Suite**: 8 Testcontainers-based test specifications (`TC-BE-01` to `TC-BE-08`) validating concurrent booking races (50 parallel goroutines), multi-sport conflicts, idempotency reuse, RLS isolation, ledger integrity, webhook HMAC verification, and privacy consent enforcement.

---

## 3. Pre-Implementation Review Checklist for Founder & Tech Leads

Before proceeding with backend codebase scaffolding (Milestone M8), please review the following technical decisions:

| Item | Architectural Recommendation | Status / Action Needed |
| :--- | :--- | :--- |
| **Backend Language & Framework** | **Go 1.22+ with standard library / Chi router** (high concurrency, low memory footprint, single binary deployment). | Ready for confirmation. |
| **Database & Extension** | **PostgreSQL 16 + PostGIS + `btree_gist`** for exclusion constraints and spatial queries. | Ready for confirmation. |
| **Concurrency Mechanism** | **PostgreSQL GiST Range Exclusion Constraints** (preferred over Redis distributed locks for strict mathematical consistency). | Ready for confirmation. |
| **Asynchronous Job Queue** | **Redis-backed `asynq`** for video transcoding, SMS dispatch, and webhook processing. | Ready for confirmation. |
| **Media Retention Policy** | Default **30 days** retention for match replays before archival or deletion, with owner alerts at 7 and 2 days. | Commercial confirmation. |
| **Commercial Terms** | Keep commission and subscription rates as **provisional configuration parameters** (`is_approved: false`). | Approved approach. |

---

## 4. Next Step: Transitioning to Milestone M8

Once this architectural design is reviewed:
1. **Scaffold Backend Repository**: Initialize `/backend` Go module with domain structures, middleware, and database migration framework (`golang-migrate` / `goose`).
2. **Execute Initial Migrations**: Apply the 11 core tables and exclusion constraints against local/staging PostgreSQL.
3. **Run Concurrency Integration Test (`TC-BE-01`)**: Verify that 50 concurrent goroutines attempting to book the same court slot result in exactly 1 success and 49 conflict rejections.
4. **Connect Frontend Service Adapters**: Switch frontend transport from demo storage to live backend endpoints (`NEXT_PUBLIC_DATA_MODE=api`).
