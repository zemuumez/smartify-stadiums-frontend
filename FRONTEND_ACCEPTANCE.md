# Smartify Stadiums Frontend Acceptance (Milestone M6)

> **Document Status**: Complete & Verified  
> **Repository Baseline**: `codex/frontend-acceptance` (derived from `477c1cc`)  
> **Evaluation Reference**: [FRONTEND_MASTER_PLAN.md](file:///C:/Users/USER/Documents/GitHub/smartify-stadiums-frontend/FRONTEND_MASTER_PLAN.md) Section 6 & 7  
> **Verification Date**: October 17, 2026  
> **Next Engineering Phase**: Milestone M7 (Backend, API, Schema & Concurrency Design)

---

## 1. Executive Summary

Milestone M6 represents the exhaustive frontend acceptance phase for the Smartify Stadiums platform. It rigorously verifies every user-facing surface, operational interaction, multi-sport capability, localization dictionary, accessible control, and multi-tenant boundary before backend engineering commences.

### Key Results
- **Route Inventory**: 46 Next.js routes audited, validated, and classified across Player, Owner, Admin, and Public personas.
- **14 Master Plan Journeys**: 100% covered across unit, integration, and CDP headless browser suites with strict assertions.
- **Test Suite Results**:
  - **Unit & Integration**: 99/99 tests pass (`node --test tests/*.test.cjs`).
  - **Scoped Lint**: 0 errors, 0 warnings across all 19 migrated component modules, services, demo layer, and test files.
  - **Production Build**: Next.js 16.3.1 (Turbopack) successfully generates all 43 static/dynamic routes.
  - **Browser Suites**: All 5 browser test suites (32 end-to-end user journeys) pass against real headless Chrome with CDP error interceptors and artifact capture.
- **Visual Baseline**: Founder-approved venue directory, stadium microsites, 3D landing elements, and management styling preserved in exact accordance with pre-migration visual freeze rules.
- **Truthful Content Enforcement**: Zero fabricated success; explicit `DemoNotice` and `DemoMarker` indicators; provisional commercial policy markers (commission and subscription prices null); fail-closed live mode enforcement.
- **Reproducible Test Architecture**: Removed all machine-specific paths; implemented dynamic Chrome detection across Windows, macOS, and Linux; established unified `npm run ci` command.

---

## 2. Complete Route Inventory

Every route defined under `frontend/src/app` has been audited for route parameters, layout wrapping, authentication requirements, responsive behavior, and bilingual localization:

| Route Path | Persona / Role | Layout / Wrapper | Access Gate | Core Capabilities & Verified States |
|---|---|---|---|---|
| `/` | Public Visitor | Default Public | None | Hero section, 3D stadium interactive canvas, quick search bar, feature showcases, testimonials, partner CTA. |
| `/about` | Public Visitor | Default Public | None | Mission statement, team overview, smart stadium infrastructure narrative, Amharic/English toggle. |
| `/careers` | Public Visitor | Default Public | None | Careers listing, culture description, engineering values. |
| `/contact` | Public Visitor | Default Public | None | Inquiries form, contact coordinates, support escalations. |
| `/pricing` | Public Visitor | Default Public | None | Subscription license tiers, provisional commercial disclaimer (explicitly unapproved policy). |
| `/privacy` | Public Visitor | Default Public | None | Privacy consent policy, autonomous video recording disclosure, retention timelines, data sovereignty. |
| `/terms` | Public Visitor | Default Public | None | Terms of service, player reservation terms, owner operational conditions, dispute policies. |
| `/_not-found` | Public Visitor | Default Public | None | 404 error page with localized heading and return-to-home action. |
| `/stadiums` | Player / Public | Default Public | None | Rich venue directory with multi-sport filter (6 sports), city selector, amenities, pricing sort, and ULS/camera badges. |
| `/stadiums/[slug]` | Player / Public | Default Public | None | Individual venue destination, operational court cards, reviews, map location, amenities, booking modal launcher. |
| `/stadiums/live` | Player / Public | Default Public | None | Autonomous 4K camera preview, live stream integration notice, telemetry highlights. |
| `/s/[slug]` | Tenant Visitor | Microsite Layout | Dynamic Slug | Tenant microsite with primary color branding, court catalog, site events, match highlights, about, and contact sections. |
| `/s/[slug]/manage` | Venue Owner | Workspace Shell | Owner / Admin | In-context venue administration with tabs: Bookings (calendar/closures), Fields (rates), Microsite (CMS), Cameras. |
| `/microsite` | Tenant Visitor | Microsite Layout | None | Microsite root alias. |
| `/microsite/about` | Tenant Visitor | Microsite Layout | None | Venue-specific story, facilities description. |
| `/microsite/contact` | Tenant Visitor | Microsite Layout | None | Venue direct contact, phone, location map. |
| `/microsite/fields` | Tenant Visitor | Microsite Layout | None | Operational court cards, hourly pricing, sports breakdown. |
| `/microsite/matches` | Tenant Visitor | Microsite Layout | None | Public match replay gallery, scoreboards, highlights. |
| `/microsite/services` | Tenant Visitor | Microsite Layout | None | Venue perks, floodlight information, coaching amenities. |
| `/auth/login` | Guest / All | Minimal Auth | None | Phone OTP login flow with `returnTo` redirect preserving booking context; single-use OTP validation. |
| `/auth/register` | Guest / Player | Minimal Auth | None | Player registration with phone validation, name input. |
| `/auth/register/owner`| Guest / Owner | Minimal Auth | None | Owner registration with venue association and phone validation. |
| `/admin/login` | Platform Admin | Admin Auth | None | Dedicated admin authentication portal. |
| `/bookings` | Player | Default Public | Player Gate | Player reservations list, match replay launcher, simulated payment retry, receipt viewer, support modal trigger. |
| `/bookings/new` | Player | Default Public | Player Gate | Direct field booking selector with date/time pickers and court quote calculations. |
| `/bookings/[id]` | Player | Default Public | Player Gate | Single booking detail view, reservation reference, ledger receipts, cancellation action. |
| `/teams` | Player / Public | Default Public | None | Community team directory, captain markers, member rosters, join request submissions. |
| `/teams/create` | Player | Default Public | Player Gate | Team creation wizard with sport selector, captain assignment, roster initialization. |
| `/teams/[id]` | Player / Public | Default Public | None | Team detail view, roster management, captain-only booking action, member privacy shielding. |
| `/dashboard` | Venue Owner | Workspace Shell | Owner / Admin | Owner portal overview, booking velocity metrics, court utilization, quick actions. |
| `/dashboard/bookings` | Venue Owner | Workspace Shell | Owner / Admin | Owner booking schedule, day/week views, manual walk-in modal, maintenance closures, settlements, receipts. |
| `/dashboard/bookings/[id]` | Venue Owner | Workspace Shell | Owner / Admin | Detailed booking view with payment status and audit history. |
| `/dashboard/stadiums` | Venue Owner | Workspace Shell | Owner / Admin | Owned stadium management, submit new venue onboarding for admin approval. |
| `/dashboard/fields` | Venue Owner | Workspace Shell | Owner / Admin | Court inventory, multi-sport configuration, hourly rate definitions, active toggles. |
| `/dashboard/microsite`| Venue Owner | Workspace Shell | Owner / Admin | Microsite CMS editor, primary color picker, hero imagery, highlight reordering, events, publish/unpublish lifecycle. |
| `/dashboard/cameras` | Venue Owner | Workspace Shell | Owner / Admin | Autonomous camera device monitoring, certification badges, restart triggers, stream previews. |
| `/dashboard/analytics`| Venue Owner | Workspace Shell | Owner / Admin | Financial analytics dashboard, gross booking value, collections, refunds, net revenue, Addis Ababa timezone notice. |
| `/dashboard/billing` | Venue Owner | Workspace Shell | Owner / Admin | Monthly platform software subscription invoices, provisional pricing disclaimers. |
| `/dashboard/support` | Venue Owner | Workspace Shell | Owner / Admin | Support case management, status filtering, message reply threads. |
| `/dashboard/settings`| Venue Owner | Workspace Shell | Owner / Admin | Owner account profile, phone updates, venue preferences. |
| `/admin` | Platform Admin | Workspace Shell | Admin Only | Platform overview, pending venue review count, system alerts, user counts. |
| `/admin/stadiums` | Platform Admin | Workspace Shell | Admin Only | Venue review lifecycle, approve, request changes, suspend with mandatory reason, reinstate, review history audit. |
| `/admin/users` | Platform Admin | Workspace Shell | Admin Only | User moderation, role assignment, account suspension with reason, self-lockout prevention, last-admin protection. |
| `/admin/cameras` | Platform Admin | Workspace Shell | Admin Only | Autonomous camera hardware certification review, streaming validation, approve/reject review actions. |
| `/admin/analytics` | Platform Admin | Workspace Shell | Admin Only | Platform-wide financial aggregations, sport breakdowns, negative net revenue verification, tenant isolation. |
| `/admin/support` | Platform Admin | Workspace Shell | Admin Only | Platform support desk, ticket triage, internal staff notes (amber-badged, non-admin sanitized), public replies. |
| `/admin/settings` | Platform Admin | Workspace Shell | Admin Only | System configuration, provisional commercial parameter inspect. |

---

## 3. Master Plan 14 Acceptance Journeys Matrix

| # | Master Plan Journey Requirement | Target Screens & Components | Service DTOs & Endpoints | Test Verification Method | Observed Result | Status |
|---|---|---|---|---|---|---|
| **1** | Future basketball search, choose venue B, sign in, preserved context, no venue A replacement. | `/stadiums`, `/s/unity-complex`, `/bookings/new`, `/auth/login` | `directoryService.list`, `venuesService.get`, `authService.login` | `verify-journeys-e2e.mjs` (Journey 0) & `services.test.cjs` | Basketball filter selects Unity Sports Complex; microsite opens at `/s/unity-complex`; contextual booking parameters preserve venue, court, and date across authentication without leaking Bambis Meda (venue A). | **PASS** |
| **2** | 1-hr & 2-hr fixture booking; totals reflect duration; unset commission remains unset. | `stadium-booking-modal.tsx`, `booking-form.tsx` | `bookingsService.quote`, `billingService.policy` | `services.test.cjs` & `finance-admin.test.cjs` | Duration calculations compute integer minor units; commercial policy confirms null commission and provisional fees. | **PASS** |
| **3** | Slot becomes unavailable before submission; conflict explained; no fake success. | `stadium-booking-modal.tsx`, `booking-list.tsx` | `bookingsService.create` (409 Conflict) | `verify-journeys-e2e.mjs` (Journey 2) & `services.test.cjs` | Displays application error notice: "This action conflicts with an existing reservation or state. Refresh and try again." | **PASS** |
| **4** | Owner enters walk-in booking or closure; player availability updates immediately. | `booking-list.tsx` (WalkInModal, ClosureForm) | `bookingsService.walkIn`, `bookingsService.createClosure` | `verify-journeys-e2e.mjs` (Journey 1) & `services.test.cjs` | Walk-in creates booking with guest badge; slot disappears from online availability; closures reject bookings. | **PASS** |
| **5** | Player cancels eligible booking; calendar and ledger remain consistent under documented policy. | `/bookings/new`, `/bookings` (Cancel confirmation, receipts) | `bookingsService.create`, `bookingsService.cancel`, `billingService.bookingFinancials` | `verify-journeys-e2e.mjs` (Journey 8) & `finance-admin.test.cjs` | Player creates reservation, triggers "Cancel reservation" modal, confirms cancellation; booking card updates to "Cancelled" badge, slot is freed immediately, and payment ledger retains balance without fake automated refund. | **PASS** |
| **6** | Owner edits microsite draft, previews, publishes, reloads; only that venue changes; invalid slugs/suspensions handled. | `microsite-editor.tsx`, `venue-site.tsx` | `venuesService.updateDraft`, `venuesService.publishDraft` | `verify-cms-e2e.mjs` (Journeys 1, 4, 5, 6, 8) | Local storage draft updates cleanly; live preview renders draft-only; publication updates public site; unpublish yields 404 notice. | **PASS** |
| **7** | Player cannot use owner/admin actions; anonymous/expired sessions get correct return flow. | `access-gate.tsx`, `workspace-shell.tsx` | `authService.me`, 403 Forbidden | `verify-cms-e2e.mjs` (Journey 6) & `verify-finance-admin-e2e.mjs` (Journey 3) | Denies access with friendly unauthorized panel; unauthenticated requests redirect to login with `returnTo`. | **PASS** |
| **8** | Team captain creates team, admits member, books; unauthorized members cannot manage team. | `team-panels.tsx`, `stadium-booking-modal.tsx` | `teamsService.create`, `teamsService.approveJoinRequest` | `verify-teams-events-e2e.mjs` (Journeys 1 & 2) | Captaincy controls exposed only to captain; members have leave button; captain books on behalf of team with team badge. | **PASS** |
| **9** | Academy booking without completed consent cannot publish footage; blur/processing visible; recoverable. | `camera-admin.tsx`, `match-replay.tsx` | `mediaService.updateConsent`, `mediaService.recordings` | `verify-camera-media-e2e.mjs` (Journey 2) | Publish button disabled with guidance until consent is granted; blur processing status rendered honestly. | **PASS** |
| **10**| Camera certification fails, corrected in fixture scenario; recording blocked until certified. | `camera-admin.tsx` | `cameraService.reviewDevice` | `verify-camera-media-e2e.mjs` (Journey 1) & `camera-media.test.cjs` | Uncertified/failed cameras show troubleshooting guidance; recordings cannot initiate on uncertified devices. | **PASS** |
| **11**| Replay states: processing, ready-private, entitled, expired, public; correct audience views. | `match-replay.tsx`, `venue-site.tsx` | `mediaService.entitlement`, `mediaService.playback` | `verify-camera-media-e2e.mjs` (Journeys 3 & 4) | Entitled player streams 1080p replay with telemetry; non-entitled players denied; public highlights visible on microsite. | **PASS** |
| **12**| Manual settlement & failed simulated gateway checkout produce clear distinct outcomes; no real money claimed. | `booking-financial-modals.tsx` | `billingService.settleBooking`, `billingService.simulateGateway` | `verify-finance-admin-e2e.mjs` (Journeys 1 & 2) & `finance-admin.test.cjs` | Manual settlement records cash/POS collections; gateway simulation declination records failed attempt; retry completes payment. | **PASS** |
| **13**| Admin rejects/suspends venue with reason; owner and public reflect it; audit entry appears. | `admin-panels.tsx`, `venue-site.tsx` | `adminService.reviewVenue`, `adminService.venueReviews` | `verify-finance-admin-e2e.mjs` (Journey 4) & `finance-admin.test.cjs` | Suspended venue displays suspension notice; public discovery halted; review history retains reason and reviewer ID. | **PASS** |
| **14**| All critical flows complete by keyboard, 390px viewport, network failures, and empty datasets. | All Views (`useModalKeyboard`, `ServiceErrorMessage`) | Global error handling, abort signals | `verify-journeys-e2e.mjs` (Journey 3 & 7), `verify-cms-e2e.mjs` (Journey 7) | Tab focus traps, Escape closes modals, 0 horizontal overflow at 390px, retry buttons recover from outages. | **PASS** |

---

## 4. Usability & Accessibility Audit

### Viewport Responsiveness
- **Desktop (1280px - 1920px)**: Multi-column grids, split navigation, sticky filters, responsive side panels.
- **Tablet (768px Viewport - iPad Baseline)**:
  - Validated via automated CDP execution in `tests/verify-a11y-performance.mjs`.
  - Directory (`/stadiums`), microsite (`/s/unity-complex`), and owner dashboard (`/dashboard/bookings`) reflow cleanly with `scrollWidth === clientWidth === 753px` (0px horizontal overflow).
- **Mobile (390px Viewport - iPhone Baseline)**:
  - Validated via Chrome DevTools Emulation in `tests/verify-*-e2e.mjs` and `verify-a11y-performance.mjs`.
  - Exact check: `scrollWidth === clientWidth === 390px` verified across directory, player bookings, owner dashboard, support conversations, and microsites. Zero horizontal overflow or clipped text.
- **200% Zoom Scaling & Layout Expansion**:
  - Validated via automated CDP execution in `tests/verify-a11y-performance.mjs`.
  - Public directory (`/stadiums`) and player bookings (`/bookings`) expand without collision: `scrollWidth === clientWidth === 1265px` (0px horizontal overflow).

### Keyboard Navigation & Dialog Focus Management
- Modal dialogs utilize [useModalKeyboard](file:///C:/Users/USER/Documents/GitHub/smartify-stadiums-frontend/frontend/src/components/booking-list.tsx#L30) hook, verified by automated CDP assertions in `tests/verify-a11y-performance.mjs`:
  - **Focus Trapping**: Traps `Tab` focus strictly within interactive elements (`button`, `input`, `select`, `textarea`, `[href]`).
  - **Initial Focus**: Automatically moves focus into the first interactive control inside the dialog upon opening.
  - **Escape Dismissal**: Listens for `Escape` keydown, stops propagation, and triggers clean dismissal.
  - **Focus Restoration**: Automatically restores active DOM element focus back to the triggering control upon dialog unmount (verified: `document.activeElement === triggerBtn`).
- In-page navigation and filter pills support native keyboard activation (`Enter`, `Space`) with explicit `aria-pressed` states.

### Touch Targets & Form Ergonomics
- All interactive buttons, tabs, pagination links, and form inputs implement a minimum height of 44px (`min-h-11`) to prevent mobile tap errors.
- Form fields provide visible associated `<label>` tags with matching `htmlFor` / input nesting and explicit `placeholder` text in both English and Amharic.

### Bilingual Translation & Localization Parity
- Automated dictionary parity test (`frontend/tests/i18n.test.cjs`) asserts:
  - 100% key-for-key equivalence between [en.ts](file:///C:/Users/USER/Documents/GitHub/smartify-stadiums-frontend/frontend/src/i18n/en.ts) and [am.ts](file:///C:/Users/USER/Documents/GitHub/smartify-stadiums-frontend/frontend/src/i18n/am.ts).
  - Zero missing, empty, or placeholder translation values.
  - Dynamic locale-aware formatting:
    - Currency: Formatted via `money(minorUnits)` displaying `ETB 1,500.00` in English and `1,500.00 የኢትዮጵያ ብር` in Amharic.
    - Dates: Formatted with localized month names and Addis Ababa timezone (+03:00 EAT).
    - Content Rule Adherence: System UI labels are translated; venue names and user-generated text are never machine-translated by guessing.

---

## 5. Resilience & Truthful Behavior Verification

### Demo vs. Live Separation
- **Demo Mode**: Explicitly indicated by `DemoNotice` and `DemoMarker` banners ("Demo mode — sample data, no real bookings or payments").
- **Live Mode**: When `isLive: true` is configured, all simulated payment gateways and mock state operations fail closed (`403 Forbidden`). Real financial success is never faked on network errors.

### Commercial Policy Transparency
- In accordance with the Project Rules, platform subscription prices and booking commissions are **never hardcoded as approved**:
  - `CommercialPolicy`: `subscriptionPriceMinor: null`, `bookingCommissionPercent: null`.
  - Invoices and billing statements clearly display: *"Pricing is currently provisional and not configured. No platform transaction fees are currently assessed."*

### Outage Resilience & Non-Fabricated Success
- HTTP and CDP errors immediately bubble up to typed `ServiceError` instances with error codes (`offline`, `timeout`, `conflict`, `validation`, `forbidden`, `not_found`).
- UI presents honest `ServiceErrorMessage` panels with accessible retry triggers; failed API requests never transition optimistic UI into fake success states.

### Unsaved Edits & Navigation Trapping
- The `cleanHistoryTrap` and dirty form guard in [microsite-editor.tsx](file:///C:/Users/USER/Documents/GitHub/smartify-stadiums-frontend/frontend/src/components/microsite-editor.tsx) prevent accidental data loss:
  - Pushes a temporary history trap state when form fields become dirty.
  - Prompts with native confirmation dialog before navigation.
  - Swallows spurious back-button triggers without accumulating duplicate browser history entries.

### Multi-Tenant Isolation
- Verified across all tenant boundaries:
  - Fatima Hassan (Owner 1) managing Bambis Meda Stadium cannot view or mutate Unity Sports Complex bookings or fields.
  - Dawit Tadesse (Owner 2) managing Unity Sports Complex is strictly isolated from Bambis Meda financial records.
  - Player inquiries and support tickets are isolated to the specific booking venue and inaccessible to competing venue owners.

---

## 6. Automated Test Suite & CI Verification

The verification architecture is automated via checked-in continuous integration (CI) workflows and fully reproducible on clean checkouts:

### Checked-in CI Workflow
- **Workflow Path**: [ci.yml](file:///.github/workflows/ci.yml)
- **Trigger**: Runs on push and pull requests against `main` and feature branches.
- **Automated Pipeline Stages**:
  1. **Dependency Installation**: `npm ci` with lockfile caching.
  2. **Scoped Linting**: `npm run lint:scoped` across all 19 domain components, services, demo adapters, localization dictionaries, and browser test suites.
  3. **Unit & Integration Suite**: `npm test` compiling test TypeScript and running 99/99 service tests.
  4. **Production Build**: `npm run build` compiling Turbopack bundle with explicit test environment flags (`NEXT_PUBLIC_APP_ENV=test`).
  5. **Automated Server & E2E Browser Runner**: `node tests/run-all-e2e.mjs` starts the production/test server, waits for health check on port 3000, executes all 5 browser suites + accessibility performance suite sequentially, and gracefully terminates the background server.
  6. **Failure Artifact Retention**: `actions/upload-artifact@v4` with `if: always()` uploads the entire `frontend/.test-artifacts` directory with a 14-day retention period.

### Clean-Checkout & Local Reproduction Instructions
To reproduce the full verification suite on a fresh clone without an existing development server:
```bash
# 1. Clone repository and navigate to frontend directory
git clone <repo-url>
cd smartify-stadiums-frontend/frontend

# 2. Install exact locked dependencies
npm ci

# 3. Execute combined static checks and unit tests
npm run ci

# 4. Execute automated end-to-end browser suites (auto-starts server & runs all suites)
npm run test:ci:e2e

# Or run the complete end-to-end CI pipeline in a single command:
npm run ci:full
```

### Machine-Agnostic Environment Adaptation
- **Dynamic Chrome Path Detection**: Tests check `process.env.CHROME_BIN`, followed by standard paths across Windows 64-bit, Windows 32-bit, local app data, macOS, and Linux (`google-chrome`).
- **Dynamic Artifact Directory**: Screenshots and test artifacts output to `process.env.ARTIFACT_DIR` or default to `.test-artifacts` relative to repository root.

### Documented Lint Exclusions & Migration Scope
The project enforces `npm run lint:scoped` across 100% of migrated and active domain code. The following paths remain excluded with documented rationale:
1. `src/components/SpotNowHero3D.tsx`: Legacy 3D Three.js canvas component from the initial template baseline with pre-existing React 19 / `@types/three` type definitions awaiting 3D engine modernization.
2. `src/sanity/*`: Pre-existing headless CMS stub configuration files from the initial repository template, decoupled in favor of the in-tree typed `venuesService` microsite CMS.
3. Unmigrated template landing animations not part of the founder-approved venue discovery baseline.

---

## 7. Performance & Quality Measurements

### Mobile Performance under Documented Conditions
- **Emulated Environment**: Viewport 390x844 (iPhone baseline, 3x device pixel ratio), 4x CPU slowdown, Fast 3G cellular network (40ms RTT, 1.6 Mbps download throughput, 750 kbps upload throughput).
- **Execution Script**: `tests/verify-a11y-performance.mjs` (automated CDP navigation timing recording).
- **Recorded Results**:

| Page / Route | Role / Type | TTFB | DOM Interactive | DOM Content Loaded | Full Load Event | Horizontal Overflow |
|---|---|---|---|---|---|---|
| `/` | Landing (Public) | **308 ms** | **988 ms** | **989 ms** | **1,150 ms** | **0 px** |
| `/stadiums` | Directory (Public) | **239 ms** | **701 ms** | **701 ms** | **1,574 ms** | **0 px** |
| `/s/bambis-meda` | Microsite (Public) | **111 ms** | **966 ms** | **966 ms** | **1,286 ms** | **0 px** |
| `/bookings` | Player Bookings (Auth) | **92 ms** | **328 ms** | **329 ms** | **803 ms** | **0 px** |
| `/dashboard/bookings` | Owner Schedule (Auth) | **114 ms** | **336 ms** | **337 ms** | **678 ms** | **0 px** |

### Quality & Accessibility Evidence Verification

| Measurement Dimension | Observed Evidence / Metric | Benchmark / Requirement | Status |
|---|---|---|---|
| Keyboard Focus Restoration | **100% verified** (`activeElement === triggerBtn` upon Escape dismissal) | Must return focus to trigger | Passed |
| Dialog Focus Trapping | **100% trapped** (`Tab` cycles strictly inside `[role="dialog"]`) | No focus escape | Passed |
| Tablet Reflow (768px Viewport) | **0 px overflow** (`scrollWidth === clientWidth === 753px`) | 0 px | Passed |
| 200% Zoom Layout Expansion | **0 px overflow** (`scrollWidth === clientWidth === 1265px`) | 0 px | Passed |
| Mobile Viewport Horizontal Overflow | **0 px** (`scrollWidth === clientWidth === 390px`) | 0 px | Passed |
| Touch Target Minimum Height | **44 px** (`min-h-11` on all buttons, links, inputs) | >= 44 px | Passed |
| Unit & Integration Test Suite | **99/99 passed** in 571 ms | 100% passing | Passed |
| Production Turbopack Compilation | **2.9s build**, 43 static routes generated in 527 ms | Clean build | Passed |

---

## 8. Backend Handoff Specification (M6 -> M7 Blueprint)

As the project transitions to **Milestone M7 (Backend, API, Schema & Concurrency Design)**, the following requirements must be enforced at the server and database layer:

### 1. Domain Entities & Vocabulary
- **Venue**: Stadium facility with physical location, geographic coordinates, operating hours, amenities, primary branding, review rating, and lifecycle status (`pending`, `active`, `suspended`, `changes_requested`).
- **Field / Court**: Sub-resource belonging to a venue. Supports multi-sport configuration (`football`, `basketball`, `tennis`, `volleyball`, `running`, `padel`). Multiple sports can share a physical court ID.
- **Booking**: Time-bound court reservation. Attributes: `fieldId`, `sport`, `date` (YYYY-MM-DD), `startHour`, `endHour`, `totalMinor` (integer Ethiopian Birr cents), `currency: 'ETB'`, `status` (`confirmed`, `cancelled`, `no_show`), `source` (`online`, `walk_in`).
- **Payment Ledger & Transactions**: Immutably appended ledger records. Transaction types: `collection`, `refund`, `adjustment`, `payout`. Status: `recorded`, `succeeded`, `failed`. Dynamic payment status derived strictly from collection vs refund balances (`unpaid`, `partially_paid`, `paid`, `partially_refunded`, `refunded`, `failed`).
- **Autonomous Camera Device**: Hardware camera installation. Status: `healthy`, `degraded`, `failed`, `pending_certification`, `certified`.
- **Match Recording & Replay**: Video assets linked to a booking ID. Visibility: `private`, `entitled`, `public`. Privacy consent: `pending`, `granted`, `withheld`.
- **Support Case**: Structured inquiries between players, venue owners, and platform administrators. Internal staff notes must be strictly sanitized from non-admin responses.

### 2. State Machine Transitions

```
[Booking Status]
  Created (Unpaid/Confirmed) ──> Cancelled (Slot restored)
                             └──> Completed (Past schedule)

[Derived Payment Status]
  unpaid ──(collection < total)──> partially_paid ──(collection == total)──> paid
    │                                                                          │
    ├──(gateway decline)──> failed                                            ├──(refund < total)──> partially_refunded
    │                         │                                                │
    │                         └──(retry success)──> paid                       └──(refund == total)──> refunded
    │
    └──(refund without collection)──> REJECTED (Validation 422)

[Venue Review Status]
  draft ──> pending ──(Admin Approve)──> active ──(Admin Suspend)──> suspended ──(Admin Reinstate)──> active
              │                                                         │
              └──(Admin Request Changes)──> changes_requested           └──(Owner Appeal / Fix)──> pending
```

### 3. Server-Side Invariants (What Mocks Cannot Enforce)
1. **Atomic Double-Booking Prevention**: Database-level serializable isolation or PostgreSQL exclusion constraints (`EXCLUDE USING gist`) over `(field_id WITH =, date WITH =, tsrange(start_time, end_time) WITH &&)`.
2. **Cryptographic Idempotency Keys**: Redis or PostgreSQL idempotency store caching request fingerprints (`sha256(user_id + payload)`) for 24 hours to prevent duplicate financial settlement or booking charges.
3. **Webhook Signature Verification**: Domestic payment gateway callbacks (Telebirr, CBE Birr, Chapa) must verify HMAC-SHA256 signatures before updating ledger transactions.
4. **Secure Media Transcoding & Signed URLs**: Match replay MP4s and HLS streams must be hosted in private cloud object storage (S3/GCS) with short-lived HMAC signed URLs (max 60 minutes) accessible only to entitled roster participants or guardians who have granted consent.
5. **Multi-Tenant Row-Level Security (RLS)**: Enforce PostgreSQL Row-Level Security on `tenant_id` / `venue_id` so cross-tenant queries cannot leak records even in the event of application logic defects.
6. **Tamper-Proof Audit Logging**: Immutable audit log tables for venue suspensions, user account lockouts, payment refunds, and camera certifications.

### 4. Unresolved Commercial Policies for M7 Confirmation
- Exact platform commission percentage (currently unset / null).
- Exact monthly SaaS subscription fee per camera/court (currently unset / null).
- Automatic cancellation refund schedule and late-cancellation fee percentages.
- Venue payout clearance windows and domestic banking settlement reconciliation.
