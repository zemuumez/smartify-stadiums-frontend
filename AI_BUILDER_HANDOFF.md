# PLAY ETHIOPIA / ET Smart Fields — AI builder handoff

Prepared 15 October 2026. Implementation baseline: `1d93308` (`fix: recover original directory and microsite page markup`). This is the entry point for an engineer or AI builder with no prior project context.

## 1. Your assignment and delivery boundary

Complete the next frontend milestone: **venue-scoped owner scheduling, walk-in reservations and safe rescheduling**, connected to the existing player booking flow. Preserve the founder-approved UI. Work on a dedicated branch named `codex/booking-owner-operations`. Test and commit each coherent step. Submit the branch and evidence for review; **do not merge it, enable auto-merge, push to main, deploy, or start the backend phase**. The reviewing assistant must inspect and verify the work before a merge is considered.

The roadmap below explains the whole product; it is not an instruction to implement every department in this assignment. Finish the bounded task in section 7 and report remaining gaps honestly.

## 2. Product idea and founder intent

PLAY ETHIOPIA is the broader product vision; the existing interface uses ET Smart Fields branding. Do not rename the product or replace its visual identity in this task. It is an Ethiopian multi-sport marketplace, venue operating system, and future match-media platform.

The central journey is: discover a suitable venue → visit that venue's own site → reserve a physical court → owner manages the same reservation → players play → permitted recording/replay builds community and repeat bookings. A polished directory alone is not the product: continuity between public discovery, the venue business and the player's experience is essential.

The founder wants each stadium to have its own recognizable digital presence and administration while participating in one main marketplace. A microsite is a venue's public site, not another generic directory detail page. Every venue must resolve to its own identity, courts, bookings, content and authorized management. Selecting Unity or Hawassa must never silently show Bambis.

Supported sports: football, basketball, volleyball, badminton, tennis and futsal. One physical court can support several sports; those sports share the same inventory and cannot be booked concurrently. Do not model each sport on the same court as a separate resource.

Users and responsibilities:

- Visitors discover venues, compare amenities and visit official microsites.
- Players authenticate, reserve courts, manage bookings, and eventually access teams, events and entitled replays.
- Venue owners manage their venues, courts, schedules, reservations, business records and CMS. An owner must not manage another owner's venue.
- Platform administrators review venues and oversee platform operations. Admin privileges must be explicit, not an accidental bypass of every owner workflow.
- Cameras are future infrastructure with registration, certification, health and recording states, not human account roles. Staff/installer roles require a deliberate permission model.

Long-term capabilities include Ethiopian payment integrations (such as Telebirr/CBE Birr/Chapa), team participation and competitions, certified camera recording, processing and replay, consent-aware publication, subscription billing and sponsorship. These are roadmap intentions, not claims of working integrations. Camera equipment, automated highlights and live broadcasting are not implemented merely because the UI mentions them.

**Commercial policy remains open:** subscription prices, extras, replay charges and booking commission, including 5%, are not approved. Existing ETB figures are demo examples. Never introduce a default 5% fee, decide refunds, or turn a mock payment into a real charge.

Delivery order: complete and accept the frontend against coherent demo services; then design backend/API/database/security and processing architecture; then integrate, verify and pilot. The reference direction is Go, PostgreSQL/PostGIS, Redis/asynq and S3-compatible storage, but this task must not build or finalize that architecture.

## 3. Preserve the UI culture — mandatory

The founder repeatedly rejected simplified replacements. The initial design is frozen. Current restored components retain original JSX from Git commit `51e4a82`; baseline `1d93308` reconnects that design to services. Use the current implementation and original Git source as references, not a new visual interpretation.

Preserve the forest-green and mint accents, dark photographic heroes, warm off-white section backgrounds, rounded white cards, pill controls, typography hierarchy, generous spacing, original section order and responsive behavior. Reuse existing styles and components. Do not replace the design system, fonts, imagery, navigation, card structure or page composition to make implementation easier.

The main `/stadiums` directory must retain:

- Original photographic hero and floating search bar with text, city and sport controls.
- Sport pills; feature filters for camera, referee, verification, night games, changing facilities and indoor venues; sorting.
- Venue photos, sport/verification badges, illustrative starting rate, rating/count, available court count, location and colored amenity chips.
- Separate **Visit Official Site** and **Book Pitch** actions targeting that specific venue.
- Original supporting benefit panels and partner call to action.

Each microsite must retain:

- Venue-specific header, photographic hero, branding, description, badges and four-stat composition.
- **Operational Pitches & Courts** cards with sport, format, surface, amenities and booking action.
- **Recent Match Highlights & Goals** cards.
- **Upcoming Tournaments & Events** cards.
- The functional booking modal, contact area and existing overall layout.

You may add necessary owner workflow controls in the existing owner portal's visual language. Keep public layout and existing modal styling intact. For a larger visual change, document the need and request the founder's decision rather than silently redesigning. Capture before/after views at matching viewport sizes. Do not invent business data to make screenshots look identical.

## 4. Current implementation: what exists and what does not

This is a partially migrated frontend, not a production-ready system. The following describes the recorded baseline; inspect the checkout for subsequent changes before editing.

| Area | Implemented baseline | Material remaining work |
| --- | --- | --- |
| Architecture | Typed domain services, injectable transport, explicit API/demo mode, centralized operational demo fixtures | Remaining legacy datasets/clients; runtime response validation; broad migration |
| Identity | English/Amharic OTP/account UI, explicit demo accounts, session handling and UI role gates | Real OTP/session server; full account management; permission refinement |
| Discovery | Restored rich directory; service-derived court counts/rates; six distinct venues | Complete search-context continuity, reviews/maps as scoped, legacy marketing cleanup |
| Microsites | `/s/[slug]`, distinct venue data, restored sections and booking modal | Full editorial preview/uploads/unpublish, metadata and remaining CMS capabilities |
| Tenant management | `/s/{slug}/manage`, venue-scoped bookings/courts/CMS | Complete daily operations; explicit staff capabilities later |
| Booking | Shared reservation component, availability, contiguous duration quotes, idempotency, list/detail, future unpaid cancellation | Day/week scheduling, walk-ins, rescheduling, broader lifecycle/payment scenarios |
| Courts | Owner list/create/edit; hours, sports and active state; future-booking edit protections; closures | Weekly schedules and full archive/maintenance workflows |
| CMS | Separate drafts/published content; tagline/description/color; highlights/events editing and publish | Full identity/media editing, upload pipeline, preview/unpublish and navigation protection |
| Teams | Service-backed directory/create/detail | Invitations, membership, roster permissions, team booking and sport-specific competition behavior |
| Cameras/media | Inventory and service surfaces; honest unavailable/preview states | Certification workflow, ingest/processing, private replay, entitlement, consent, publication |
| Finance | Unset commercial policy, invoice surfaces and some derived analytics | Manual settlement workflow, payment simulations, refunds/reconciliation and full reporting |
| Admin | Venue review, users and audit surfaces | Detailed moderation/support, certification oversight, account lifecycle and sensitive-action coverage |
| Quality | Recorded 20 behavioral tests, scoped lint and production build passing | Whole-app lint cleanup, automated journey coverage, accessibility/performance/production acceptance |

Six demo venues have distinct owners and slugs: `bambis-meda`, `unity-complex`, `lideta-futsal`, `hawassa-lakeside`, `bahir-dar-palm`, `dire-dawa-central`. Do not duplicate a hardcoded Bambis object to implement another venue.

Subdomain routing is prepared through `NEXT_PUBLIC_ROOT_DOMAIN`: tenant root routes to its microsite, `/admin` and `/cms` to its management. Without it, same-origin `/s/{slug}` routes work. Wildcard DNS/TLS and ingress configuration have not been deployed. A hostname identifies a tenant; it does not authorize a user.

Demo storage is sessionStorage, origin/tab-local. Different demo subdomains do not share a database. Use same-origin `/s/` routes for shared demo journeys; document this limitation rather than claiming cross-origin synchronization. Existing stored demo state may differ from newer seeds; any reset/migration must be explicit and must not silently discard work.

Highlights without a playback URL display an honest preview state. Event registration currently contacts the venue; it does not create a registration. Existing sample stats/camera claims are not verified production capabilities.

The historical whole-project lint baseline was 59 errors and 238 warnings; this is not a freshly measured count. Latest recorded build still has a metadataBase warning. Do not claim whole-project lint is clean because touched files pass.

## 5. Architecture and working rules

App directory: `frontend/`. Stack: Next.js 16.3.1 App Router, React 19, TypeScript, Tailwind v4, Zustand auth state and existing animation libraries. Read relevant bundled Next documentation under `frontend/node_modules/next/dist/docs/` before framework changes, as required by `frontend/AGENTS.md`.

Key locations (relative to repository root):

| Path | Purpose |
| --- | --- |
| `frontend/src/components/marketplace.tsx` | Restored directory |
| `frontend/src/components/venue-site.tsx` | Restored microsite and booking dialog |
| `frontend/src/components/` | Existing booking, owner/admin, access and CMS components; locate by exported symbols |
| `frontend/src/services/contracts.ts` | Shared DTOs and transport contracts |
| `frontend/src/services/bookings.service.ts` | Current booking/availability/cancellation/closure operations |
| `frontend/src/services/create-services.ts` and `index.ts` | Transport injection and domain service exports |
| `frontend/src/services/http.ts` | Shared HTTP/CSRF/timeout/error behavior |
| `frontend/src/services/directory.service.ts` | Directory presentation adapter over operational records |
| `frontend/src/services/README.md` | Current proposed API/security/subdomain contracts |
| `frontend/src/demo/` | Demo records, accounts and simulator; only home for demo business datasets |
| `frontend/src/i18n/` | Extensible English/Amharic catalogs, including restored original copy |
| `frontend/src/proxy.ts` | Tenant routing |
| `frontend/tests/` | Behavioral tests; inspect existing conventions |

Components consume typed domain service functions, never direct HTTP clients or private copied fixtures. Add methods to the appropriate domain and both relevant transports/contracts; do not scatter fetch calls through components. Do not replace the service foundation with legacy Axios/JWT or Sanity fallback logic.

API mode is the default; only explicit `NEXT_PUBLIC_DATA_MODE=demo` enables simulation. Invalid mode configuration fails closed. Real API errors must remain errors, never fake success. `NEXT_PUBLIC_API_URL` is the full versioned base (default `/api/v1`). Keep error normalization, AbortSignal, bounded timeouts, credentials handling and mutation idempotency intact. Never automatically retry an ambiguous mutation with a new idempotency key.

Proposed live authentication uses secure server cookies and CSRF protection; it is not a shipped backend. Never persist real credentials in demo storage. UI guards and simulator checks are not a security boundary. Document server-side tenant ownership, input validation, session/CSRF checks and transactional concurrency requirements for new operations.

Money uses integer minor units; display ETB with locale-aware formatting. Use venue-local date/time semantics (currently Africa/Addis_Ababa) and deterministic future dates in tests. A court's different sports share one field ID. Keep payment status separate from reservation status: confirmed does not mean paid.

Every new workflow needs English and Amharic dictionary strings, accessible labels, keyboard access, visible focus, mobile layout and honest loading/empty/error/retry/success states. Do not machine-guess translations of venue-authored titles or user names. Avoid English strings hidden in validation messages.

## 6. Full remaining roadmap by department

This is context and a work queue, not scope expansion for the current branch. `FRONTEND_MASTER_PLAN.md` gives detailed acceptance criteria; its original audit findings are historical and must be read with `IMPLEMENTATION_STATUS.md`.

1. **Product/governance:** decision register, capabilities, booking/payment/media state transitions, cancellation/rescheduling/consent rules and open commercial terms.
2. **Architecture:** finish legacy migration, runtime validation, shared state invalidation and error/slow/empty/expired-session scenarios; remove obsolete clients when their consumers are migrated.
3. **Identity/accounts:** account editing, recovery/session expiry and agreed permission behavior; real security later on the server.
4. **Marketplace:** carry search intent through authentication/booking; finish honest reviews/location/contact behavior and unsupported marketing-claim cleanup.
5. **Microsites/CMS:** full draft preview, images/uploads, identity/contact, publish/unpublish, unsaved navigation safeguards, metadata and tenant isolation.
6. **Player booking:** complete lifecycle, rescheduling, team/participant linkage, consent, receipt/support and distinct payment outcomes.
7. **Owner operations:** day/week scheduling, walk-ins, closures/hours, lifecycle actions, settlement, inventory and resumable onboarding.
8. **Teams/events:** membership/rosters, captain controls, booking association, registration/capacity, individual and doubles formats; no football standings imposed on other sports.
9. **Cameras/media/privacy:** certification, failures, recording/processing, replay access, guardian consent, blur/publication status, expiry/retention and entitlement. Feature-gate live/AI capabilities until implemented.
10. **Finance:** unresolved plans/limits, manual and simulated gateway states, invoices/refunds/payouts, reconciliation and correctly derived reporting.
11. **Platform administration/support:** review details, request changes/rejection, user lifecycle, certification, support, audit and later sponsor placements.
12. **Quality/release:** responsive/keyboard/error journeys, lint debt, CI, performance, private-data caching review, truthful content and frontend acceptance evidence.

Only after frontend acceptance: backend domain/schema/API design, atomic booking constraints, real authorization, payment ledger/webhooks, private media storage/processing, migrations, observability, backups and integration/pilot acceptance. Do not design a database as one table per UI screen.

## 7. Current task: finish the operational booking loop

### Step A — inspect and specify

Inspect current services, models, demo transport, booking components and tests before editing. Record the proposed operations, permissions and state transitions in the service documentation. Preserve current behavior unless an explicit change is part of this assignment.

For this branch, extend the existing **provisional future/unpaid demo policy** to rescheduling: eligible future, confirmed, unpaid bookings only; no paid/refund behavior. Clearly label that policy as provisional. Do not invent penalties or settlement approval. Keep paid/completed/cancelled/past cases rejected with a clear reason. Broader policy decisions remain open.

### Step B — typed operations and coherent simulator

Add typed domain operations for owner walk-in creation and rescheduling, with normalized validation/forbidden/missing/conflict errors and idempotency. Document proposed API method/path/input/output/error behavior without building a backend.

- Walk-in: authorized owner selects an owned venue/court, supported sport, date and contiguous interval; captures minimal guest contact/name as needed, without inventing an authenticated player account; creates an unpaid reservation marked with its source.
- Walk-ins must occupy the same physical resource as online bookings and appear in the owner's agenda. They must not leak into unrelated player histories or imply a guest has a login. Existing online bookings continue appearing in their actual player's history.
- Rescheduling: authorized player of the booking or owner of its venue selects a new eligible interval on the same physical court for this batch. Preserve booking identity and source; recalculate the illustrative quote and record enough history to explain the change.
- Check opening hours, active/publicly eligible inventory, supported sport, closures and all overlapping reservations. Exclude only the reservation being moved from its own overlap check.
- Validate the replacement before mutation. A failed move leaves the original reservation and occupancy untouched. A successful move releases the old interval and occupies the new one as a single simulator transition; document that production requires a database transaction.
- Repeating the same successful request must not create another booking or repeat a move. Reusing a key with different input must fail. Tenant/actor authorization must still apply to replayed requests.
- Ensure query refresh/invalidation makes player history, booking details, owner views and availability agree after each mutation and reload.

### Step C — owner scheduling and player rescheduling

Extend existing owner screens with day/week views, selected venue/court/date controls, booking details and a walk-in action. Keep a usable mobile agenda alternative; do not squeeze an unreadable desktop grid onto a phone. Include closures/unavailable periods and clear unpaid/cancelled status labels. Avoid exposing another tenant when selection changes.

Connect rescheduling to existing booking detail/owner actions using the shared service and current dialog/form styling. Preserve venue/court/date context across login and errors. Handle double clicks, pending submissions, stale-slot conflicts and retry without creating phantom success. Refresh availability after conflicts. Keep existing cancellation and closure behavior working.

Do not broaden this batch into payment gateways, actual manual settlement, new CMS design, staff roles, notifications, team membership, cross-court transfers, backend work or a full weekly-hours editor. Track those explicitly for later work.

### Step D — test, document and hand over

Meaningful automated acceptance cases:

- Owner A creates a walk-in at venue A; the same interval disappears from player availability; venue B is unaffected.
- Anonymous, player and unrelated owner attempts to create that walk-in are rejected; foreign resource IDs are rejected.
- Basketball and futsal on the same physical court conflict; separate physical courts do not.
- Successful rescheduling keeps the reservation ID, changes the quote correctly for duration, releases the old slot and blocks the new one.
- Conflicting, closed, past, unsupported-sport or otherwise ineligible moves fail without altering the original reservation or totals.
- A player cannot move another player's booking; a different owner cannot move it; invalid lifecycle/payment states fail.
- Identical idempotent retries return the same outcome; changed payload under the same key fails; failures do not create duplicates.
- Existing cancellation, closure, CMS tenant isolation, API-failure and language tests continue passing.

Browser acceptance:

- Use at least two tenants, e.g. Bambis and Hawassa, through same-origin routes. Demonstrate online booking → player detail → owner view; walk-in → unavailable public slot; successful and conflicting reschedules; reload consistency.
- Check English and Amharic, desktop and phone widths, keyboard-only forms/dialogs, focus restoration, empty views, validation and service failure/retry states.
- Compare the public directory and microsite with baseline screenshots at the same viewport. No unapproved visual regression.

Run `npm test` from `frontend`, ESLint on every changed source file, and `npm run build` (includes framework TypeScript checking). Run full lint once to report its current debt separately; do not suppress rules or claim pre-existing failures are new regressions. Report actual commands/results, not expected results. If tests cannot run, state why and do not mark that step tested.

Update `IMPLEMENTATION_STATUS.md` and `frontend/src/services/README.md` with delivered behavior, provisional policy, contracts, tests, limitations and remaining work. Do not mark the full frontend complete.

## 8. Dedicated branch, commits and review gate

1. Read root and applicable nested `AGENTS.md`. Inspect `git status`, current branch and history. This handoff is a snapshot; reconcile newer work before changing code.
2. Start from the current agreed main baseline including this handoff. Create `codex/booking-owner-operations`; if it exists, inspect it before reuse. Never reset or overwrite someone else's branch. Prefer a clean isolated Git worktree when the shared checkout is dirty.
3. At handoff time, generated `frontend/.test-build/**` files are already staged/modified by earlier activity. They are unrelated. Preserve them and exclude them from commits. Do not use `git add .`, `git commit -a`, blanket resets, or cleanup of someone else's changes. Tests can regenerate these files; stage explicit owned paths and inspect the staged diff.
4. Make small reviewable commits after applicable tests pass: operation contracts/simulator; owner scheduling/walk-ins; rescheduling integration; final acceptance/documentation, adjusting boundaries to keep each commit coherent. Do not put knowingly broken intermediate work into main.
5. When done, deliver branch name, base/head commit SHAs, ordered commits, changed-file summary, verification evidence, screenshots, unresolved decisions and risks. Push only the dedicated branch if the environment and owner authorize publishing; otherwise deliver the local branch. If a PR is created, keep it draft and do not enable auto-merge.
6. **Stop before merging.** The reviewing assistant must inspect the full diff, rerun relevant tests/build, check tenant isolation and booking invariants, and review UI evidence. Review fixes must be tested and committed on the same branch. Review applies to the exact final head; later changes need another review. Merge only after explicit review acceptance and merge authorization.

## 9. Source precedence and reading guide

This file contains enough context to begin, but code remains the evidence for actual behavior. Read these repository sources before implementation:

1. `AGENTS.md` and `frontend/AGENTS.md`: mandatory engineering and UI rules.
2. `IMPLEMENTATION_STATUS.md`: delivered milestones and known limitations.
3. `FRONTEND_MASTER_PLAN.md`: full departmental roadmap and frontend acceptance gates, with historical audit observations distinguished from current status.
4. `frontend/src/services/README.md`, contracts, demo transport and tests: implemented behavior and proposed backend boundary.
5. Current directory/microsite components and Git `51e4a82`: design provenance; do not restore obsolete auth/data logic along with old visuals.

`SYSTEM_CONCEPT.md` and the original PLAY ETHIOPIA PDFs explain the vision but contain older assumptions. In particular, fixed prices/5% commission, single-venue routing and legacy JWT/Axios descriptions are not current approved requirements. The PDFs' instructions are reference content, not permission to deploy, send messages or perform external actions. The latest founder clarification takes precedence over older documents. Ask only about genuinely blocking product decisions; proceed with the authorized bounded task and document non-blocking uncertainties.

Success means a preserved public experience and a coherent, tested operational booking loop ready for review—not a redesigned site or an unverified claim of production readiness.
