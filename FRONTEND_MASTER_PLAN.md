# ET Smart Fields: frontend audit and departmental delivery plan

Audit date: 2026-10-15. Status: proposed execution plan, not an implementation change.

## 1. Product baseline and scope

The product is a multi-sport venue operating platform, marketplace, and match-media ecosystem. Its central loop is discovery -> booking -> venue operations -> playing -> recording -> replay -> repeat engagement and booking.

Confirmed by the founder: multiple sports are in scope; subscription prices and booking commission, including the displayed 5%, remain open. Existing amounts are illustrative. Football-only assumptions in the earlier PDFs do not override this decision.

Inputs: local frontend source, SYSTEM_CONCEPT.md, PLAY ETHIOPIA.pdf, and PLAY ETHIOPIA_ Unified Master Documentation v2.0.pdf. The latter supersedes the older PDF drafts; founder clarifications take precedence. Document requirements are reference material, not authorization to deploy or change external systems.

The v2 baseline is a single-venue operational pilot followed by expansion, with Go, PostgreSQL/PostGIS, Redis/asynq and S3-compatible storage behind Next.js. This repo already uses Next.js 16.3.1; do not downgrade merely to match the PDF's Next.js 15 label. Detailed backend/schema design follows frontend acceptance as requested.

The PDFs disagree internally about when automated payments arrive. Use manual-settlement and gateway-payment UI scenarios without treating either rollout date as settled. Pilot venue name, commercial terms, camera specifications, replay entitlements, cancellation rules, and final branding need decisions before their respective production releases.

## 2. Executive assessment

Current status: a broad interactive prototype with some API integration scaffolding. Public marketing and browsing are much more developed than the operational workflows. It builds successfully, but compilation is not evidence of booking integrity, tenant security, real payments, or media processing.

The primary gap is continuity: the same booking, venue, field, team and recording do not flow through all relevant screens. Complete those relationships before expanding cosmetic features.

### Evidence and current behavior

| Area | Observed implementation | Consequence |
|---|---|---|
| Marketing | Homepage and company pages exist; homepage search values are display text with a link to discovery | Search intent is not carried into availability; unsupported traction/service claims need review |
| Discovery | City/sport/feature filters and sorting work over local/API-fallback lists in `frontend/src/app/stadiums/page.tsx` | Good starting point; API records are mixed with demo defaults, including ratings and prices |
| Venue routing | Listing and detail links repeatedly target `/microsite` | Different venue choices collapse into the Bambis demo |
| Booking | Both `/bookings` and `/bookings/new` redirect to `/microsite#fields` | No dedicated history/detail flow; query context is discarded |
| Checkout | Main microsite and its layout each implement separate booking modals | Duplicate behavior; fixed August 2026 dates; timer/local success instead of a booking record |
| Price calculation | `calculateTotal` uses one base rate plus extras while slots include one and two hours | Duration and total are inconsistent even within the demo |
| Identity | Auth store attempts API calls but catches failures by authenticating demo users | Invalid credentials/server failures can appear successful; not production authentication |
| Authorization | Dashboard checks authentication, not owner role; admin layout lacks an access gate; admin login uses demo keys | Role-specific UI and session states are incomplete; server enforcement remains future work |
| Owner onboarding | Account/venue/fields/camera/plan wizard; venue saved as one `registered_stadium` localStorage object | Cannot serve as a coherent multi-venue registration and review workflow |
| Owner operations | Fields and cameras have attractive lists; field edit only changes unused selection state; add/link controls lack complete flows | No daily booking calendar, manual closures or end-to-end inventory management |
| Microsite CMS | Editor save toggles a success indicator; main microsite is hardcoded; some subpages call Sanity with fixed `bambis-meda` slug | Owner edits do not publish to independent venue sites |
| Teams | Directory filters work; creation sets a local success flag; profile uses fixed roster/history | Teams lack persisted identity, membership workflow and booking linkage |
| Media | Camera statuses and live components exist; live page is coming soon; clipping reports local success | No integrated processing, consent, access entitlement or publication workflow |
| Finance/analytics | Plan cards, invoices and charts are mostly fixed samples | UI cannot yet explain changes from bookings, cancellations or payment states |
| Administration | User/stadium tables and some filtering exist | Venue review, suspension, certification and audit actions are incomplete |
| Reliability | PWA/offline components and service-worker file exist, but no registration was found in inspected source | Offline readiness is not demonstrated; cache policy requires private-data review |
| Delivery quality | Build passes; no dedicated automated test suite or CI workflow found in tracked source inventory | User journeys, accessibility and release safety are not yet verified |

### Verification boundary

- `npm run build`: passed, including TypeScript and static page generation. Warnings: missing metadataBase and deprecated Sanity image builder import.
- Browser: inspected rendered homepage, microsite and opened reservation form on the existing localhost server. Confirmed fixed dates, duplicated booking entry points and displayed prototype claims. No payment submitted.
- Source: reviewed route inventory, handlers, models, role gates, CMS hooks, navigation and configuration.
- Full mobile/device/accessibility/performance audit remains work below; this is not a claim that every screen has passed visual QA.
- `npm run lint`: failed with 297 findings (59 errors, 238 warnings). Findings include explicit `any` types, React purity/effect violations and unused code. Resolve errors and review warnings as part of M1/M6; do not suppress rules wholesale to create a green gate.
- Existing modification to `frontend/package-lock.json` predates this audit and is preserved.

## 3. What "frontend finished" means

Before backend design, all approved workflows must work coherently against an explicitly selected mock data adapter. A saved booking should appear in the player's history and the owner's calendar; publishing a venue should update that venue's public microsite; state should survive page navigation and a refresh within the demo environment.

Use realistic deterministic fixtures, at least two distinct venue tenants, all six supported sports, and explicit error scenarios. Mock persistence is a development tool, not secure storage. Never switch silently from a failed real API request into demo success.

Define TypeScript view models, operation inputs/outputs, error categories and state transitions now. These are frontend contracts, not a final relational database schema. The later backend phase will review and refine them.

Every released control must perform its action, show an honest unavailable state, or be removed. Each journey needs loading, empty, validation, forbidden, missing-resource, failure/retry, success and offline behavior where applicable. No production claim should depend on a mock side effect.

Backend integration and a second acceptance pass are still required after frontend completion. Frontend-only tests cannot prove cross-user concurrency, authorization, payment settlement or private media protection.

## 4. Departments and work packages

Departments are ownership areas, not a requirement to hire separate teams. One engineer can execute them in dependency order. P0 = foundation or core booking blocker; P1 = required grand-plan workflow; P2 = later enhancement that must be explicitly released or feature-gated.

### D01. Product, business rules and delivery governance — P0

Tasks:
- Maintain a decision log separating founder-approved rules, provisional assumptions and unresolved commercial terms.
- Define role/capability matrix for visitor, player, team captain, owner and platform admin. Treat installers and additional venue staff as capability decisions, not automatically new account roles.
- Document state transitions for venue review, bookings, payment, camera certification, media processing/publication and team membership.
- Define cancellation/rescheduling eligibility, pending-booking expiry/occupancy, manual confirmation, participant access to video, and consent UX before implementing dependent screens.
- Define multi-sport rules: supported sports per physical resource, sport/format selection, capacities, and shared-court conflicts. Basketball and futsal on the same physical court must share availability.
- Keep plan prices, commission, extras and replay package amounts configurable and visibly illustrative until approved. Do not require settling prices to finish the UI.
- Clarify claims outside the core plan, such as homepage infrastructure construction services, and remove or qualify unverified metrics and promises.

Acceptance: a short product decision register and role/state matrices cover each workflow; no developer silently invents commercial policy. Dependencies: none.

### D02. Frontend architecture and shared UI — P0

Tasks:
- Consolidate duplicated Stadium/Field/Booking models and money/time representations. Preserve missing data as unknown rather than filling it with invented ratings or prices.
- Introduce a typed service boundary for identity, venues, availability, bookings, content, teams, media and finance; components consume it rather than importing page-local fixtures.
- Create explicit mock and future API adapters with scenario controls for slow requests, failures, conflicts, expired sessions and empty datasets.
- Separate public, player, owner, admin and venue-site shells; consolidate duplicated booking/auth/player-portal modals.
- Standardize forms, buttons, dialogs, tables, pagination, notifications, empty states and status badges; use shared tokens instead of divergent page styles.
- Centralize date/time formatting using the venue timezone, ETB display and selected-duration calculations; select one minor-unit convention at the contract boundary.
- Add route-specific loading/error/not-found states and a consistent navigation/return-url strategy.

Acceptance: the same fixture entity renders consistently across all surfaces, mutations refresh dependent views, and no real-service error becomes mock success. Dependencies: D01 initial decisions.

### D03. Identity, account and access experience — P0

Tasks:
- Complete phone registration/login with invalid/expired OTP, resend cooldown, throttling feedback, network failure, logout and expired-session states.
- Remove hardcoded admin credentials from production paths; isolate demo role switching behind explicit development configuration.
- Enforce frontend role/capability routing, including direct URL entry, while documenting that real security is enforced by the future server.
- Preserve booking intent through authentication; include profile editing, account status, privacy preferences and notification preferences.
- Add guardian-consent collection/status for academy or school bookings without falsely marking consent complete.
- Bound token-refresh retries, coordinate simultaneous refresh attempts and clear auth state consistently on failure. Review the final session-storage approach during backend security design.

Acceptance: visitor/player/owner/admin scenarios receive the correct pages; failed authentication never signs a user in; return to the intended booking works. Dependencies: D01, D02.

### D04. Public marketplace and discovery — P0

Tasks:
- Make homepage location/sport/date/time/duration search functional and carry it through URL parameters to discovery and booking.
- Complete shareable filters, sorting, pagination and meaningful no-results/error states; include all supported sports consistently.
- Resolve each venue/field to its correct identity and microsite. Unknown or suspended venues must not become the default demo venue.
- Show venue-specific details, hours, facilities, actual available sport formats and review states. Introduce post-booking review submission and owner response UI if included in the release.
- Specify proximity/map behavior and permission-denied fallback before offering location search; current configuration disables geolocation.
- Fix misleading footer destinations and stale dates; make contact/support forms report actual mock-adapter outcomes rather than cosmetic success.

Acceptance: a search for a non-football court retains its date, sport and venue context through selection and checkout. Dependencies: D02, D05, D06 contracts.

### D05. Stadium microsites and content publishing — P0

Tasks:
- Introduce venue-specific routing, proposed `/s/[slug]`, and a deliberate migration from `/microsite` and duplicated stadium detail content. Final route is a product decision; this is a proposal.
- Render venue identity, branding, gallery, contact/hours, sports/fields, events, services, approved reviews and permitted match content from one venue context.
- Finish editor controls for identity, colors, images, content ordering and events; include upload validation, progress/failure, preview, draft, publish/unpublish and unsaved-change protection.
- Model published content separately from drafts. Owner changes must not become public until publication succeeds.
- Resolve CMS ownership: Sanity can hold editorial content, while operational rates, inventory, availability and access permissions should have one authoritative service. Do not maintain contradictory copies.
- Provide title/description/share images, canonical URLs, sitemap inclusion and unpublished/not-found states per venue.
- Include future sponsor placement previews and replay-unlock states without asserting live advertising or approved prices.

Acceptance: owners of two fixture venues edit and publish independently; correct content appears at two distinct URLs; private/draft footage never appears in public UI fixtures. Dependencies: D02, D03, D07; media publishing also depends on D09.

### D06. Booking and player self-service — P0

Tasks:
- Restore real frontend booking list/detail/new routes instead of redirects.
- Build one shared reservation flow: venue -> physical field/court -> sport/format -> date -> available interval/duration -> player/team -> optional services -> consent where relevant -> review -> settlement choice -> status.
- Display opening hours, manual closures, unavailable slots and stale-slot conflicts. Follow the documented 60-minute base granularity provisionally; longer bookings select contiguous intervals with correct totals.
- Calculate illustrative quotes from duration and configurable extras; keep platform fee separate and unresolved rather than hardcoding 5%.
- Distinguish pending, confirmed, cancelled, completed and no-show from unpaid, processing, paid, failed and refunded payment states.
- Provide manual-settlement and simulated gateway flows, cancellation/rescheduling, policy explanation, receipt/detail, booking reference and notification outcome.
- Prevent duplicate submissions in the UI and support an idempotency token in the proposed operation contract. Actual atomic booking protection belongs to the later backend.
- Build player's upcoming/past bookings, booking details, team association, consent status, replay status and support entry points.

Acceptance: one fixture booking is visible consistently in player history, owner calendar and relevant reporting; conflict/failed-payment scenarios do not become confirmed bookings. Dependencies: D01-D03, D07 inventory, D10 settlement contract.

### D07. Venue owner operations — P0

Tasks:
- Finish resumable onboarding, review submission and approved/rejected/pending states; camera or subscription selection must not automatically imply verification.
- Add an active-venue selector and complete venue/field create/edit/archive workflows with validation and dependency explanations.
- Add the missing day/week booking calendar and booking queue/detail views: filter by court, create walk-in booking, approve/reject where applicable, record manual settlement, mark completed/no-show and handle cancellation/rescheduling.
- Build weekly hours and date-specific closure/maintenance editors, with affected-booking conflict feedback.
- Support shared physical courts and multiple sport configurations without treating each sport as independently bookable inventory.
- Make dashboard metrics and lists derive from shared fixture bookings and inventory; distinguish occupancy from payment collection.
- Add staff/capability settings only once the product permission model is agreed.

Acceptance: an owner can run a simulated day's operations from the portal and see the same availability as a player. A closure immediately removes affected slots from the public booking UI. Dependencies: D01-D03, D06.

### D08. Teams, events and competitions — P1

Tasks:
- Persist mock team creation to a real fixture ID; make detail pages resolve that ID and handle not-found.
- Add team sport/format, captain controls, invitations/join requests, approve/reject, leave/remove and roster management.
- Connect booking-on-behalf-of-team and authorized replay access to membership scenarios.
- Add event details and registration/capacity/closed states; connect owner event management to public listings.
- Separate standings by sport and competition. Basketball, volleyball, tennis and badminton must not inherit football goals/draws or share one league table.
- Define singles/doubles and individual participation where relevant instead of forcing every sport into a football roster model.
- Stage tournament brackets, automated results and expanded competition administration as a separately accepted P2 release if their rules are not ready.

Acceptance: creating a team, joining it and making a team booking remains coherent after navigation; event registration updates available capacity in mock state; no mixed-sport standings. Dependencies: D02, D03, D06, D05.

### D09. Camera, match media and privacy — P1

Tasks:
- Complete camera registration, field assignment, certification pending/passed/failed, offline, revoked and service-recovery UI.
- Separate installer certification evidence from a timed success animation. Secret/device-key display must support masked and one-time states.
- Model a booking-linked match recording with scheduled/recording/uploading/processing/ready/failed states and owner retry/status views.
- Build media library and replay detail with sample playable media, processing failures, unavailable media, expired access, privacy and retention states.
- Build owner approval/publication controls for private/unlisted/public content; enforce guardian-consent and face-blur status in the mock scenarios before publication.
- Design replay-package entitlement/locked/unlocked states, download/share restrictions, clip-generation progress/failure, and deletion/expiry UX. Prices remain unresolved.
- Keep live broadcast, multi-angle switching, chat and automated highlights clearly feature-gated until their end-to-end contracts and release scope are accepted; include the frontend scenarios in the full roadmap.

Acceptance: a fixture booking progresses to a private processed replay; authorized players can access it; public visibility requires explicit permitted publication; a failed certification never appears live. Dependencies: D03, D05-D08, D10 entitlement contract.

### D10. Billing, payments, revenue and analytics — P1

Tasks:
- Create configurable plan/entitlement presentation with pending pricing; reconcile inconsistent field/camera/storage limits across onboarding, pricing and billing.
- Build subscription state, plan-change/cancellation and usage-limit UI without inventing approved limits or charging anyone.
- Complete manual invoice/settlement records and simulated gateway initiated/processing/paid/failed/refund states.
- Show gross bookings, collected payments, refunds, proposed fee and payout status separately. Do not assume all booking value is earned or collected revenue.
- Add invoice detail/download, reconciliation exceptions and payout pending/completed/failed UI scenarios for later integration.
- Drive charts, date-range filters and venue/field/sport breakdowns from the shared dataset; handle zero activity and exports.
- Include replay purchases and sponsor reporting in their staged release; define event meanings before adding analytics instrumentation.

Acceptance: one cancellation/refund changes the appropriate totals without conflating booking status and payment state; unset pricing is an honest supported UI state. Dependencies: D01, D02, D06, D07; replay/sponsor views depend on D09/D11.

### D11. Platform administration, support and partnerships — P1

Tasks:
- Complete stadium review detail, approve/reject/request-changes, verification evidence, suspension/reactivation and reasons/history.
- Complete user detail, search/filters, suspension/reactivation, role-change review and self-lockout safeguards.
- Add camera certification/revocation oversight, failed-media job views and platform health states.
- Provide append-only audit-log views and sensitive-action confirmation UX; actual logging/integrity remains backend work.
- Add booking/payment support detail and escalation/refund-request interfaces; avoid pretending browser actions execute refunds.
- Add basic sponsor placement management with draft/approved/scheduled/expired states for the media-commercial release. No auction/ad exchange is implied.
- Clarify installer handoff, ownership and certification responsibilities without building a separate installer product prematurely.

Acceptance: admin review changes a fixture venue's owner status and public discoverability; every sensitive mock mutation has a visible reason and audit entry. Dependencies: D03, D05-D10.

### D12. Accessibility, resilience, performance and release engineering — P0 throughout

Tasks:
- Audit keyboard navigation, visible focus, focus trapping/restoration, Escape behavior, dialog labels, input labels/errors, contrast, reduced motion and screen-reader announcements.
- Remove nested main landmarks and unnamed icon actions where present. Test modal layouts on small screens and zoomed text.
- Verify public and operational flows at phone, tablet and desktop widths; do not hide essential operational actions on mobile.
- Use honest offline/read-only states. Never confirm a reservation without server acknowledgement in live mode; avoid caching private player/owner pages or media indiscriminately.
- Review PWA registration/install/update behavior before enabling it; handle session transitions and cache invalidation.
- Measure image/font/script/video costs and large animation bundles; set performance budgets based on representative low-bandwidth mobile testing.
- Add meaningful unit/integration tests for state transitions, quotes, permissions and context preservation, plus end-to-end tests for critical cross-screen journeys.
- Establish CI lint, type/build and journey checks, environment documentation, example configuration without secrets, error reporting, staging and rollback instructions.
- Replace sample traction/review/availability claims in production content with verified values or honest empty states; align privacy text with delivered behavior.

Acceptance: approved journeys pass keyboard/mobile/error-state checks and automated regression tests; production configuration cannot silently activate demo authentication or fabricated business results. Dependencies: continuous across all departments.

## 5. Execution sequence and gates

| Milestone | Departments | Deliverable | Exit gate |
|---|---|---|---|
| M0: Agree the working rules | D01 + D12 baseline | Decision register, role/state matrix, route inventory, release scope | Multi-sport resource model and booking/settlement/consent assumptions explicit; pricing stays open |
| M1: Unify the frontend foundation | D02 + D03 | Shared types/adapters, fixtures, shells, access and reusable UI | Two independent venues and role/error scenarios work without implicit fallbacks |
| M2: Complete one operational loop | D04-D07 + basic D10 | Discover -> correct microsite -> book -> player history -> owner calendar -> cancellation/closure | The same record and status are visible everywhere, including reload and conflict scenarios |
| M3: Complete microsite publishing | D05 + D07 + basic D11 | Draft/editor/preview/publish and venue approval | Two separately branded sites publish independently and preserve booking context |
| M4: Complete community and media frontend | D08 + D09 | Teams/events, certification, recording/replay, consent and entitlement flows | Booking-to-replay workflow and denied/private/failed states are demonstrable |
| M5: Complete commercial and admin frontend | D10 + D11 | Plans, invoices, analytics, support, approvals, sponsor scenarios | Derived data and meaningful actions replace static success; no fixed commercial assumptions |
| M6: Frontend acceptance | D12 + all owners | Regression suite, responsive/accessibility review, truthful content, handoff contracts | Every in-scope route and control passes the definition of done |
| M7: Backend and schema design | Subsequent engineering phase | Domain design, API specification, database/migrations, security/queue/storage design | Reviewed against the accepted frontend journeys and production invariants |
| M8: Integration and pilot | All relevant areas | Real adapters, integration tests, deployment and monitored pilot | Real bookings are atomic; authorization and payments/media behavior verified server-side |

M2 and M3 are intentionally iterative: establish venue-specific rendering first, then complete editorial publishing after the booking loop works. D12 runs during every milestone, not only at the end.

Do not provide a calendar estimate until M0/M1 expose the agreed scope and delivery capacity. Milestone acceptance is more meaningful than an unsupported percentage-complete estimate.

## 6. Required frontend acceptance journeys

1. Visitor searches basketball for a future date, chooses venue B, signs in and returns to the same court/date; venue A content never replaces it.
2. Player books a one-hour and a two-hour fixture interval; totals reflect duration and configurable extras; unset commission remains unset.
3. Slot becomes unavailable before submission; conflict is explained and alternatives offered; no successful booking is invented.
4. Owner enters a walk-in booking or maintenance closure; player-facing availability updates in the shared mock dataset.
5. Player cancels an eligible booking; player history, owner calendar and financial state remain consistent under the documented policy.
6. Owner edits a microsite draft, previews, publishes and reloads; only that venue changes. Invalid slug and suspended venue states work.
7. Player cannot use owner/admin actions; anonymous/expired sessions get the correct return flow. These tests cover UI behavior, not server security.
8. Team captain creates a team, admits a member and books; unauthorized members cannot manage the team in the UI.
9. Academy booking without completed consent cannot publish footage; processing/face-blur status is visible and failures are recoverable.
10. Camera certification fails, then is corrected in a fixture scenario; recording remains unavailable until the accepted state.
11. Replay is processing, ready-private, entitled, expired or publicly approved; each audience sees the correct state.
12. Manual settlement and failed simulated gateway checkout produce different clear outcomes; neither claims a real payment.
13. Admin rejects/suspends a venue with a reason; owner and public views reflect it; an audit entry appears.
14. All critical flows can be completed by keyboard and on a narrow viewport, with network failures and empty datasets.

## 7. Frontend handoff to backend design

Produce at M6: route inventory; domain vocabulary; role/capability matrix; frontend operation contracts and errors; state diagrams; fixture scenarios; unresolved decisions; acceptance tests; and a traceability list from requirements to screens.

Then design the backend and database around business invariants, not one table per screen:
- Venue ownership/membership and tenant boundaries; resource identity for shared multi-sport courts.
- Transactional availability, closures, overlap constraints, booking status history, expiry and idempotency.
- Identity/session verification and API/database authorization; frontend guards remain convenience only.
- Payment ledger, gateway callbacks, reconciliation, refunds and manual settlement; configurable commercial policy.
- Booking participants, guardian consent, replay entitlements, retention and publication controls.
- Camera certification, signed ingest, buffered uploads, asynchronous processing/retries and private object access.
- Editorial content authority and publishing, search/geospatial queries, notification delivery and audit history.
- Indexes, migrations, backup/restore, observability, load/concurrency tests, staging, incident response and rollback.

The backend phase must prove what mocks cannot: concurrent duplicate-booking rejection, no cross-tenant leaks, rejection of invalid ingest signatures, secure media access and reliable payment/webhook behavior. Run the full frontend acceptance suite again against real services before the pilot.

## 8. First actionable implementation batch

1. Freeze the current audit baseline and create the D01 decision register.
2. Establish shared fixture entities, explicit demo mode and typed service boundaries.
3. Implement venue-specific context/routing with two independent microsites.
4. Replace duplicate checkout modals with one booking workflow and real frontend booking history/detail.
5. Build owner calendar and manual closures against the same data.
6. Complete cancellation, conflict and manual-settlement scenarios, then test the connected loop.

This batch establishes the operational foundation for the remaining departments without prematurely designing the final database or treating a polished demo as a production system.
