# Implementation status

## Accepted working rules

The founder approved FRONTEND_MASTER_PLAN.md and requires centralized demo data, domain-specific request services, backend integration readiness, security, extensible English/Amharic support, mobile usability and tested incremental commits. These requirements are recorded in AGENTS.md.

## Baseline

- Production build and TypeScript pass at the audit baseline.
- Existing lint baseline: 59 errors and 238 warnings.
- The pre-existing frontend/package-lock.json modification is unrelated and must be preserved.
- The current task starts M0/M1 and migrates existing screens onto the shared foundation. The remaining milestones are not complete merely because infrastructure exists.

## Delivery log

- Step 0: recorded the approved plan and durable delivery rules. Checked the plan and rules for scope consistency; no application behavior changed.
- Step 1: added typed domain services, cookie/CSRF HTTP transport, explicit demo/API selection, centralized operational fixtures and a persistent demo adapter. Twelve behavioral tests pass. Backend endpoints/session design are proposed contracts; legacy page migration follows. No claim of backend security or full frontend completion.
- Step 2: introduced typed English/Amharic catalogs, persistent locale selection, localized account screens and responsive owner/admin shells with access gates. Removed automatic demo authentication and hardcoded admin PINs from the active login routes. Registration now uses real service states instead of a timed onboarding success. Fourteen tests, scoped lint and production build pass. Browser checks verified Amharic labels/document language, narrow-layout rendering without horizontal overflow, and anonymous admin denial. Unmigrated legacy content remains English and is tracked for later migration.
- Step 3: connected discovery, venue-specific `/s/[slug]` microsites, booking form/history/detail, owner reservations/closures and microsite drafts/publishing to the services. Replaced obsolete single-venue microsite aliases with discovery redirects. Fourteen tests, scoped lint and production build pass. Browser tested basketball search with a future date, correct court context through sign-in, a two-hour ETB 3,000 illustrative reservation, unpaid confirmation and visibility of the same record in its owner's portal. The owner view is currently a date-filtered agenda; week-grid scheduling, walk-ins and rescheduling remain later work.
- Step 4: migrated owner overview, venue submissions, court editing, camera inventory, billing, account display, team directory/create/detail and admin venue review/users/audit screens onto domain services. Added field ownership and reservation-conflict checks in the simulator and new-venue drafts. Sixteen behavioral tests, scoped lint and production build pass. Browser verified the owner court inventory and Amharic add-court form at a narrow viewport without horizontal overflow. Advanced analytics, profile editing, team membership workflows and camera operations remain pending; these screens do not simulate successful unsupported actions.

## Microsite design correction — restored venue experience

Restored the screenshot-based venue directory (hero, city/search/sport controls, feature chips, sorting, venue cards/perks and separate site/booking links) and stadium microsite composition (branded header/hero, operational courts, highlights, events, contact and accessible native booking dialog). All six catalog venues resolve to distinct operational records and owner accounts; no default-Bambis fallback. Rates/counts come from court records.

Added venue-specific management at `/s/{slug}/manage`, scoped bookings/closures, court editing, and a locked CMS with editable highlights/events plus draft/publish behavior. Added configurable subdomain links and Next proxy rewrites for tenant `/`, `/admin`, `/cms`; deployment/DNS/TLS and cookie/session requirements are documented in the services README. External DNS was not changed. Demo data is origin-local; real shared backend storage and server authorization are still required. Demo storage schema v2 starts fresh to replace the previous two-venue seed.

Validation: 19 behavioral tests pass, including exact subdomain boundaries, actual Next proxy rewriting, six distinct tenants, cross-owner CMS rejection and publication isolation. Scoped lint and production build pass (existing metadataBase warning remains). Browser verified city filtering, Hawassa identity, tennis-court selection through sign-in, a two-hour unpaid demo reservation, visibility in Hawassa management, and the Amharic CMS and booking dialog at a narrow viewport without overflow. Media with no playback source is labeled preview; event registration uses venue contact. This correction does not mark the entire master plan complete.

The pre-existing venues-page conflict was resolved as part of the restoration. Pre-staged generated `.test-build` artifacts are excluded from the implementation commit.
- UI baseline follow-up: restored the original container widths/padding, heading emphasis, microsite hero height, section spacing, card sizing and desktop grid breakpoints from the pre-migration implementation. Recorded an explicit freeze on redesigns in AGENTS.md. Scoped lint and production build pass; browser screenshot checked the directory heading, floating search bar and filter layout. Data remains venue-specific; no service behavior changed.
- Exact-reference restoration: replaced the approximate directory component with the original pre-migration JSX from commit 51e4a82 and restored the original microsite hero, four-stat row, court cards, replay cards and tournament cards from that commit. Kept current venue-scoped services, CMS and functional booking dialog. Added a directory presentation adapter, centralized original Bambis sample court/highlight content and public demo metrics, plus an English/Amharic catalog for the restored copy. Demo figures/planned capabilities are marked with a compact indicator that does not shift the reference layout. Twenty tests, scoped lint and production build pass; browser screenshots checked original directory hero/search/filter spacing, Bambis hero/stats, court order and Amharic mobile rendering without overflow. This supersedes the earlier approximate CSS-only restoration.
- Step 5 (Booking and owner operations): implemented venue-scoped owner scheduling, walk-in reservations, and safe rescheduling on branch `codex/booking-owner-operations`. Added typed operations (`createWalkIn`, `reschedule`) to `bookingsService` and atomic simulator transitions in `demo/transport.ts`. Walk-in reservations occupy the same court inventory, mark `source: 'walk_in'` with guest contact info, and appear in the venue owner schedule without leaking into player accounts. Rescheduling enables players and venue owners to move eligible future, confirmed, unpaid bookings to available slots on the same court, recalculating quotes and recording schedule history (`originalSchedule`). Enforced physical court conflicts across sports, maintenance closures, court operating hours, and idempotency keys. Added Day/Week schedule views, venue/court filters, maintenance closure alerts, walk-in modals, and rescheduling dialogs to `BookingList` with complete English and Amharic localization. 23 behavioral tests pass (`npm test`), scoped ESLint is clean (0 errors, 0 warnings on all touched files), and production build passes (`npm run build`). Full project lint debt measured at 57 errors and 64 warnings. Commercial policy, paid refunds, manual settlement, and backend concurrency guarantees remain pending future backend milestones.
- Step 6 (Review findings regression resolution): resolved all five review findings on `codex/booking-owner-operations`:
  1. Restored full player booking visibility: removed accidental venue/date filter constraints from player views. Players now see all their active and historical bookings across all venues and dates, while owner views remain properly scoped to active venue and day/week view.
  2. Implemented timezone-safe calendar navigation and Monday-based week generation using UTC-noon arithmetic in `src/services/sports.ts` (`shiftDays`, `getWeekDays`, `parseDateParts`, `formatDateParts`). Verified day stepping and Monday-start week calculations in Ethiopia's timezone (UTC+3) without date repeating or shift distortion.
  3. Added full keyboard modal behaviors (`useModalKeyboard`) with initial focus placement, Tab/Shift+Tab focus trapping, Escape key listener, and focus restoration to the trigger element for both `WalkInModal` and `RescheduleModal`.
  4. Secured venue-switch closure targeting by keying `ClosureForm` by `effectiveVenueId` and deriving `targetFieldId` dynamically from active fields, eliminating stale court selection and confirming simulator denies cross-venue closures.
  5. Fixed rescheduling pricing integrity and error handling: eliminated arbitrary ETB 1,500/hr fallback rate, displaying `—` and disabling submission for unpriced courts, and added `<ServiceErrorMessage>` with retry for availability query failures.
  Validation: 27 behavioral tests pass (`npm test`), scoped ESLint passes cleanly (0 errors, 0 warnings), and production build succeeds (`npm run build`). Verified full desktop and mobile English and Amharic journeys.
- Step 7 (Review blockers resolution): resolved the cleared-date calendar crash, migrated regression tests to exercise shared production logic, and recorded browser journey evidence:
  1. Cleared-date calendar crash fix: added `isValidDate` validation and UTC calendar fallbacks in `src/services/sports.ts` (`shiftDays`, `getWeekDays`, `parseDateParts`, `formatDateParts`), ensuring invalid or cleared date strings safely default to `venueToday()` instead of producing `NaN` date arithmetic. Hardened `displayDate` in `src/i18n/provider.tsx` with try/catch and `—` fallback, preventing `RangeError: Invalid time value` when clearing the date picker in Week view.
  2. Direct testing of production UI logic: replaced duplicated test-local helper logic in `tests/services.test.cjs` with shared, exported production functions from `src/services/sports.ts` (`matchesBookingCriteria`, `resolveTargetCourt`, `computeCourtQuote`, `isValidDate`, `shiftDays`, `getWeekDays`), ensuring components (`BookingList`) and regression tests run identical code for booking filtering, court resolution, pricing quotes, and date calculations. Added assertions for `isValidDate` and empty-date resilience.
  3. Browser journey validation: executed comprehensive CDP browser runs on desktop and mobile viewports (390x844) in English and Amharic, confirming:
     - Desktop owner Week view with cleared date input maintains stable rendering without crashing.
     - Walk-in modal opens with proper focus management, accepts input, and submits bookings.
     - Reschedule modal displays availability slot query errors with an actionable retry button.
     - Mobile layout renders owner calendar, walk-in modal, and player reservations in Amharic without horizontal overflow or clipping.
  Validation: 27 behavioral tests pass (`npm test`), scoped ESLint is 100% clean (0 errors, 0 warnings on all touched files), and the Next.js production build compiles with 0 errors (`npm run build`).
- Step 8 (In-repository reproducible browser journey test and two-venue isolation with switch-back verification):
  1. In-repository test artifact: committed `frontend/tests/verify-journeys-e2e.mjs` (registered in `frontend/package.json` as `npm run test:e2e`), establishing an autonomous, non-synthetic end-to-end browser test suite driven over Chrome DevTools Protocol (CDP) against `http://localhost:3000`.
  2. Walk-in and conflict journeys (Journeys 1 & 2): executes genuine walk-in booking creation for Dawit Kebede (06:00–07:00, Pitch 1 @ Bambis Meda Stadium, ETB 2,500.00), tracking the generated `bambisBookingId`. Re-attempting the exact slot triggers the application's HTTP 409 conflict alert inside the walk-in modal.
  3. Real service error & retry recovery journey (Journey 3): on the same valid date (`2026-10-25`), simulates a genuine transport failure through the service layer without modifying the date input. React renders `<ServiceErrorMessage retry={reload}>` with the "Try again" button. Clicking the application's Retry button triggers `reload()`, recovering all 16 hourly slot buttons (`06:00`–`21:00`).
  4. Rescheduling & reload persistence journeys (Journeys 4 & 5): reschedules the booking to `10:00–12:00` (ETB 5,000.00) with history note badge. Hard page reload (`Page.reload`) reading demo `sessionStorage` (`etsf-demo-v2`) confirms full persistence of the rescheduled card.
  5. Corrected two-venue tenant isolation with switch-back (Journey 6):
     - Switches session to `owner-2` (Dawit Tadesse @ Unity Sports Complex, `venue-2`).
     - Explicitly selects calendar date `2026-10-25` and asserts date input value is `2026-10-25`.
     - Asserted `ownedVenueName === 'Unity Sports Complex'`, `totalCardsOnOct25 === 0`, `dawitLeaked === false`, and the exact `bambisBookingId` is completely absent.
     - Switches session back to `owner-1` (Fatima Hassan @ Bambis Meda Stadium, `venue-1`).
     - Explicitly selects calendar date `2026-10-25` and asserts date input value is `2026-10-25`.
     - Asserts the exact `bambisBookingId` remains intact at `10:00–12:00` for `ETB 5,000.00` with the reschedule history note preserved.
  6. Player view isolation (Journey 7): switches session to `player-1`, verifying personal reservation visibility without owner controls or walk-in actions.
  Validation: All 7 journeys pass cleanly in `npm run test:e2e`. All 27 unit tests pass (`npm test`), scoped ESLint has 0 errors and 0 warnings, and `npm run build` succeeds with 0 errors. UI baseline remains frozen and preserved.
- Step 9 (Venue CMS Publishing & Tenant Isolation):
  1. Typed domain operations & transport contracts: added `unpublish` to `contentService` and simulator (`POST /owner/stadiums/{id}/microsite/unpublish`), updated `Microsite` contract with editorial media fields (`heroImage`, `announcement`), and hardened input validation (HTTPS video URLs, duration formats, valid image paths, character length limits).
  2. Operational data separation: confirmed court inventory, physical court configurations, hourly rates, availability, closures, and reservations are strictly operational resources. CMS edits never duplicate or alter court pricing or availability.
  3. Live in-context draft preview: integrated direct draft preview mode inside `MicrositeEditor` reusing the public `VenueSite` renderer (hero, four live stats, operational pitches/courts cards, match highlights, upcoming events, and native booking dialog) with an unmistakable draft mode banner. Previews render in-memory uncommitted edits without prematurely saving or publishing them.
  4. Precise unpublish lifecycle: unpublishing removes the public microsite from `/s/{slug}` (visitors see an honest, accessible unpublished status notice with directory links) while retaining the venue's active status, owner draft, booking records, and management access. Unpublishing never suspends the venue or cancels reservations.
  5. Unsaved-change protection: implemented dirty state detection, browser `beforeunload` listener, venue-switch interception confirmation in the selector dropdown, and a confirmed "Discard changes" action to prevent accidental data loss.
  6. Honest media handling & reordering: added accessible Move Up / Move Down controls to highlights and events with validation preventing insecure or malformed media URLs.
  7. Full English and Amharic coverage: added 18 localized keys in `en.ts` and `am.ts` covering editor tabs, status badges, unpublish confirmation, dirty state alerts, and unpublished notices.
  Validation: 31 behavioral unit tests pass cleanly (`npm test`). Scoped ESLint has 0 errors and 0 warnings on all touched files. Next.js production build (`npm run build`) compiles with 0 errors. All 7 journeys in the dedicated in-repository browser suite (`npm run test:cms`, `frontend/tests/verify-cms-e2e.mjs`) pass with full CDP assertions across both tenants, desktop and 390x844 mobile viewports in English and Amharic.
- Step 10 (Review findings resolution for venue CMS publishing & tenant isolation):
  1. Internal navigation protection: implemented document capture click interceptor for Next.js `<Link>` / `<a>` clicks, dashboard management tab switches, and browser history `popstate` (back/forward) events when `dirty === true`, prompting `discardConfirm` and aborting navigation if cancelled, preserving user draft edits.
  2. Dirty unpublish preservation: unpublishing now retains in-memory working draft edits (`setDraft(prev => ({ ...prev, published: false }))`) without silently overwriting local edits with the server baseline, and warns via `unpublishConfirmDirty`.
  3. Shared supported-media policy: created `frontend/src/services/media-policy.ts` defining `isSupportedImageUrl` and `isSupportedVideoUrl` strictly matching Next.js configured remotePatterns (`images.unsplash.com`, `playethiopia.com`, `*.playethiopia.com`) and local root-relative paths (`/venues/...`). Insecure `http://`, protocol-relative `//`, and arbitrary hosts are rejected with accessible alerts (`heroImageError`, `logoUrlError`, `mediaUrlError`) before saving, and `VenueSite` gracefully falls back to `venue.image` preventing Next Image runtime crashes.
  4. Decoupled draft preview from public venue activation: `VenueSite` accepts `previewVenue?: Venue;` and `previewFields?: Field[];`. Authorized owner data is passed directly from `MicrositeEditor`, allowing unapproved or pending venues to preview drafts without failing on public 404 lookup.
  5. Complete identity controls & dynamic branding: added branded logo URL (`logoUrl`), public inquiry contact phone (`contactPhone`), inquiry email (`contactEmail`), social media links (`socialLinks`), and facility photo showcase (`gallery`) to `Microsite`. `VenueSite` consumes `site.primaryColor` as dynamic `brandColor` across primary CTA buttons, badges, section accents, and headers, and renders the logo, facility showcase gallery, and social media pills.
  6. Regression test suite expanded: 36 unit tests pass (`npm test`) covering media policy constraints, dirty unpublish preservation, pending venue preview, tenant publishing isolation, and failed save recovery. Scoped ESLint has 0 errors and 0 warnings. Next.js production build compiles with 0 errors (`npm run build`). All 7 CDP browser journeys in `npm run test:cms` pass with verifiable evidence.
- Step 11 (Review findings resolution at f379a56 & b632de7):
  1. Pending-venue preview with owner-scoped courts:
     - In `src/components/venue-site.tsx`, updated court resolution to `previewFields !== undefined ? previewFields : await venuesService.fields(venue.id, signal)`, ensuring supplied `previewFields` (even if empty) bypasses the public endpoint.
     - In `src/components/microsite-editor.tsx`, `Draft` loads authorized owner courts alongside the draft via `Promise.all([contentService.draft(venue.id, signal), fieldsService.list(signal)])`, filters by `f.venueId === venue.id`, and provides `previewFields={fields}` to both `EditForm` and `<VenueSite />`.
  2. Management-tab switching guard in VenueAdministration:
     - In `src/components/venue-administration.tsx`, added `cmsDirty` state and wrapped tab switching buttons in `handleTabChange(nextTab)`.
     - When switching away from CMS while dirty (`tab === 'cms' && cmsDirty`), prompts `window.confirm(t('discardConfirm'))`. If cancelled, the tab switch is aborted and the editor remains mounted with local edits intact.
     - Connected `onDirtyChange` prop from `MicrositeEditor` to report dirty state changes up to the parent shell.
  3. Clean browser Back/Forward protection without history corruption or accumulated entries:
     - In `src/components/microsite-editor.tsx`, decoupled the navigation protection effect from `t` recreation by storing `t` in `tRef` via `useEffect([t])`.
     - Preserves Next.js router history state by merging `window.history.state` (`{ ...baseState, __cmsTrap: true }`) rather than overwriting with a plain object.
     - Pushes a single history trap entry upon entering dirty state. Keystrokes while dirty do not generate repeated entries.
     - On Back → Cancel, prompts discard confirmation and restores the trap entry while keeping the editor mounted and local edits intact.
     - On Back → Confirm, discards local edits, marks confirmed exit, and continues back to the preceding page (`window.history.back()`).
     - Moving Forward from the preceding page returns to the editor cleanly with normal browser forward behavior.
     - When saved or discarded via UI buttons, cleans up the trap entry (`window.history.back()`) so zero duplicate entries are left behind. Repeated edit/save and edit/discard cycles never accumulate entries.
  4. Test coverage & accurate verification semantics:
     - In `tests/services.test.cjs`, the pending preview test uses a test-local simulator function (`resolveVenueSite`) modeling VenueSite's query resolution logic to verify 404 public lookup isolation and owner court resolution without publication.
     - Full production-path and component renderer coverage is provided in the headless browser suite by Journey 8 in `tests/verify-cms-e2e.mjs` (`npm run test:cms`), verifying in-browser pending venue creation, owner court addition, CMS selection, Live Preview rendering of `<VenueSite>` with draft banner and owner court cards, and public 404 access denial.
     - Test 2b and Test 2c in Journey 2 verify dirty tab switching Cancel/Confirm, history length stability across keystrokes, Back → Cancel editor restoration, zero accumulation across repeated edit/save and edit/discard cycles, Back → Confirm navigation to the preceding page (`/stadiums`), and normal Forward traversal back to CMS.
     - All 36 behavioral unit tests pass (`npm test`). Scoped ESLint is 100% clean (0 errors, 0 warnings on all touched files). Next.js production build succeeds with 0 errors (`npm run build`). All 8 journeys in `npm run test:cms` pass cleanly in headless Chrome. UI baseline remains frozen and preserved.

- Step 12 (Resolution of lifecycle history-trap cleanup across unmount paths):
  1. Coordinated lifecycle history-trap cleanup:
     - Exported cleanHistoryTrap() from src/components/microsite-editor.tsx, which inspects window.history.state?.__cmsTrap. If active, sets module-level synchronization flag isCleaningCmsTrap = true, triggers window.history.back(), and awaits the browser popstate event before resolving.
     - handlePopState inside EditForm intercepts isCleaningCmsTrap and suppresses duplicate discard confirmation prompts during programmatic cleanup.
  2. Confirmed management-tab switching cleanup before unmount:
     - In src/components/venue-administration.tsx, handleTabChange awaits cleanHistoryTrap() upon confirmed exit before calling setCmsDirty(false) and setTab(nextTab). Asynchronous history.back() finishes popping the trap entry before the editor unmounts, preventing history queue race conditions.
  3. Confirmed venue switching cleanup before unmount:
     - In src/components/microsite-editor.tsx, handleVenueChange awaits cleanHistoryTrap() upon confirmed venue switch before calling setSelectedId(nextId), ensuring the outgoing dirty editor trap entry is removed prior to unmounting.
  4. Confirmed internal-link navigation cleanup:
     - In handleCaptureClick inside EditForm, confirmed anchor navigation prevents default click dispatch, sets isConfirmedExitRef.current = true, awaits cleanHistoryTrap(), and then executes client-side routing via router.push(...) (or window.location.assign for external URLs). The intended destination is pushed on top of a clean history entry, preventing in-flight history.back() from undoing navigation.
  5. Browser test coverage & non-accumulation verification:
     - In tests/verify-cms-e2e.mjs (Journey 2), added automated tests repeating CMS -> edit -> confirm tab switch -> return -> edit across multiple tabs (bookings, fields), verifying zero history length accumulation and absence of orphan trap entries.
     - Added repeated CMS -> edit -> confirm venue switch -> return -> edit tests across multiple venue selections, verifying zero history accumulation.
     - Added dirty internal-link navigation test with confirmed exit, verifying clean transition to destination and subsequent Back navigation returning to the editor without getting trapped.
     - All 36 behavioral unit tests pass (npm test). Scoped ESLint passes with 0 errors and 0 warnings. Next.js production build (npm run build) succeeds with 0 errors. All 8 browser journeys pass cleanly. Frozen visual baseline preserved.

- Step 13 (Enforcing confirmed history traversal and safe delayed/missing popstate handling):
  1. Confirmed history traversal requirement:
     - Modularized history trap logic into src/services/history-trap.ts.
     - cleanHistoryTrap(timeoutMs = 1000) returns Promise<boolean>, resolving true ONLY after confirmed history traversal via popstate where window.history.state?.__cmsTrap is cleared.
     - If a timeout occurs before popstate fires, cleanHistoryTrap resolves false and records hasPendingDelayedTraversal = true. Timeouts never resolve true or authorize unmounting or navigation.
  2. Safe caller guards & edit preservation:
     - handleTabChange in src/components/venue-administration.tsx, handleVenueChange in src/components/microsite-editor.tsx, and handleCaptureClick in EditForm check if (!cleaned) return;. When cleanup traversal is unconfirmed, tab changes, venue changes, and link routing abort immediately; components remain mounted and dirty edits are 100% preserved.
  3. Safe delayed traversal handling:
     - handleTrapPopState detects hasPendingDelayedTraversal. If a late-arriving popstate from a timed-out cleanup is delivered, it swallows the event without prompting discard confirmation, clears the pending flag, and safely restores the trap entry (history.pushState) to protect dirty edits during subsequent navigation.
  4. Regression test coverage:
     - Created tests/history-trap.test.cjs adding 7 focused unit regression tests verifying immediate clean resolution when trap is absent, confirmed traversal resolution, timeout failure on missing popstate, safe handling of delayed popstate with trap restoration, caller edit preservation upon cleanup failure, and deduplication of concurrent callers.
     - Total unit test suite expanded to 43 passing tests (npm test). Scoped ESLint passes with 0 errors and 0 warnings. Next.js production build succeeds with 0 errors. All 8 browser journeys pass cleanly. Frozen UI baseline preserved.

- Step 14 (Preventing additional cleanup traversals and retry race during unresolved delayed traversal):
  1. Unresolved delayed traversal lock in cleanHistoryTrap:
     - In `src/services/history-trap.ts`, `cleanHistoryTrap()` checks `hasPendingDelayedTraversal` before initiating any Back request. If a timed-out traversal remains unresolved, it returns `Promise.resolve(false)` immediately without issuing `window.history.back()` or registering an authorization listener.
     - Retrying callers (such as re-attempted tab switches, venue changes, or link clicks) are blocked from generating a second Back request or misinterpreting earlier delayed events as authorizing the new request.
     - Callers preserve local edits and keep the editor mounted until recovery completes.
  2. Safe delayed event recovery:
     - Registered a one-time delayed event recovery listener (`delayedRecoveryListener`) on `window` upon cleanup timeout. When the earlier in-flight `popstate` event is delivered, the recovery listener consumes the delayed traversal, unregisters itself, and clears `hasPendingDelayedTraversal = false`.
     - In `handleTrapPopState()`, when mounted dirty editors intercept the delayed popstate, it cleans up `delayedRecoveryListener`, resets the pending flag, restores the history trap, and swallows the event without showing discard dialogs.
     - In `resetHistoryTrapState()`, cleans up `delayedRecoveryListener` unconditionally.
  3. Regression test coverage:
     - Added test `timeout → retry → delayed-event prevents extra Back and does not authorize retry` in `tests/history-trap.test.cjs` against the compiled production helper (`.test-build/services/history-trap`).
     - Verifies:
       - Initial cleanup timeout issues exactly 1 Back request and sets `hasDelayedTraversalPending() === true`.
       - Immediate retry call returns `false`, maintains `backCallCount === 1` (zero extra Back calls), and keeps `hasDelayedTraversalPending() === true`.
       - Delivery of delayed popstate from the first Back request completes recovery and clears the pending flag without authorizing the retry.
       - Subsequent cleanup after recovery completes proceeds cleanly and only then issues a fresh Back request if trap is present.
  4. Verification:
     - 44/44 unit tests pass (`npm test`).
     - Scoped ESLint passes with 0 errors and 0 warnings (`npx eslint src/services/history-trap.ts src/components/microsite-editor.tsx src/components/venue-administration.tsx`).
     - Next.js production build compiles with 0 errors (`npm run build`).
     - All 8 CMS browser journeys pass (`npm run test:cms`). Frozen UI baseline strictly preserved.

- Step 15 (Milestone M4 Part 1 Step 1: Teams & Event Registration Domain Services, Mock Transport, and Invariants):
  1. Branch & scope:
     - Merged `codex/venue-cms-publishing` into `main` at `6dd246a` after independent sign-off.
     - Created branch `codex/teams-events` to implement Teams & Event Registration (Milestone M4 Part 1).
  2. Participation format & dynamic capacity:
     - Added `ParticipationFormat` (`'team' | 'singles' | 'doubles'`) explicitly to `SiteEvent`, `EventRegistration`, and `EventDetails`.
     - Modeled dynamic capacity semantics: `team` counts teams, `singles` counts individuals, `doubles` counts pairs.
     - `availableSpots` computed dynamically as `Math.max(0, event.spots - registeredCount)`.
  3. CMS content vs. operational registrations separation:
     - `Microsite.events` holds editorial event definitions; operational registrations live in `eventRegistrations`.
     - In `transport.ts`, saving/publishing CMS drafts strictly enforces registration safety:
       - Attempting to delete an event with active registrations is rejected with 409 `conflict`.
       - Attempting to reduce event capacity below active registrations is rejected with 409 `conflict`.
       - Attempting to change sport or format while active registrations exist is rejected with 409 `conflict`.
       - Events with zero registrations can be safely removed or resized.
  4. Team authority validation & privacy boundaries:
     - `POST /bookings` accepts `teamId`, validates caller is the team captain, verifies court sport matches team sport, and server-side derives authoritative `teamName` (ignoring tampered client values).
     - `GET /teams/:id/bookings`: members/captains see full booking records including `totalMinor`, `paymentStatus`, and contact details; public non-members see sanitized match schedule with financial and personal contact fields stripped.
  5. Mutation consistency & spot management:
     - Duplicate submissions rejected: duplicate team join requests, duplicate event registrations (same player or same team) return 409 `conflict`.
     - Registration rejected for closed events (past date/time) or full events (`availableSpots === 0`).
     - Registration cancellation marks status `cancelled` and restores capacity once; re-cancellation is rejected with 409 `conflict`.
  6. Verification:
     - Created `tests/teams-events.test.cjs` with 12 comprehensive unit regression tests covering team creation, join moderation, roster leaving/removal, team booking authority, visibility boundaries, format handling, spot arithmetic, cancellation recovery, and CMS safety invariants.
     - Total unit test suite expanded from 44 to 56 passing tests (`npm test`).
     - Scoped ESLint is 100% clean (0 errors, 0 warnings on all touched services and fixtures).
     - Production Next.js build compiles cleanly (`npm run build`).

- Step 16 (Milestone M4 Part 1 Step 2: UI Integration, Complete Localization, and 4 Reproducible Browser Journeys):
  1. UI integration across teams, bookings, and venues:
     - src/components/team-panels.tsx: rendered TeamDetail and TeamList with useServiceQuery. Added Captain Controls for pending join requests (Approve/Reject) and roster management (Remove member). Added membership actions (Request to Join, pending badge, Leave Team with inline confirmation). Added Team Matches section enforcing privacy boundary (members see full ETB financials and payment status; public non-members see match schedule with financial amounts masked).
     - src/components/booking-form.tsx: captain team selector appears when booking a court whose sport matches the captain''s team; passes teamId and preserves booking context across login via returnTo.
     - src/components/booking-list.tsx: displayed teamName · teamMatch badge in both player bookings list and venue owner bookings overview.
     - src/components/venue-site.tsx: integrated dynamic eventDetails, participation format badges (formatTeam, formatSingles, formatDoubles), real-time spots open, and EventRegistrationDialog modal supporting team (captain selection), singles (individual), and doubles (partner name entry) registrations, along with self-service cancellation that restores capacity.
  2. Full localization (English & Amharic):
     - Added matching keys to src/i18n/en.ts and src/i18n/am.ts: captain, teamRoster, requestToJoin, joinRequestPending, leaveTeam, leaveTeamConfirm, removeMember, removeMemberConfirm, captainPanel, pendingRequests, noPendingRequests, approveRequest, rejectRequest, teamBookings, noTeamBookings, bookForTeam, selectTeam, individualBooking, eventRegistration, registerForEvent, cancelRegistration, cancelRegistrationConfirm, registrationSuccess, registrationCancelled, partnerName, partnerNamePlaceholder, partnerNameRequired, selectRegistrationTeam, formatTeam, formatSingles, formatDoubles, spotsAvailable, eventFull, eventClosed, teamSpotsOpen, playerSpotsOpen, pairSpotsOpen, teamMatch, rosterEmpty, youAreCaptain, teamMember, noMatchingTeam, registered.
  3. Reproducible browser journeys (frontend/tests/verify-teams-events-e2e.mjs):
     - Journey 1: Teams, Captaincy, and Member Moderation: Sara Mengistu submits join request to Bole Lions FC; Captain Abebe Kebede reviews and approves; roster updates to include Sara with Remove button; Sara visits, clicks Leave Team, confirms, and is cleanly removed from the roster.
     - Journey 2: Captain Team Booking and Privacy Boundaries: Abebe books Pitch 1 on behalf of Bole Lions FC; booking card displays Bole Lions FC · Team match in player and owner views; captain views team bookings with ETB financials; non-member public view masks financial figures.
     - Journey 3: Venue Events across Two Venues: Bambis Meda (football team event) registers Bole Lions FC with capacity decrement; Unity Sports Complex (tennis singles event) registers Sara as individual, then cancels registration, restoring capacity and re-enabling registration button.
     - Journey 4: Mobile Viewport (390x844) & Amharic Localization: verified document.documentElement.scrollWidth <= window.innerWidth (no horizontal overflow) and complete Amharic strings on mobile team profile and venue microsite.
  4. Verification results:
     - 56/56 unit tests pass (npm test).
     - Scoped ESLint passes with 0 errors and 0 warnings on all touched files.
     - Next.js production build compiles with 0 errors (npm run build).
     - All 4 end-to-end browser journeys pass cleanly (node tests/verify-teams-events-e2e.mjs).
     - Saved screenshot artifacts: journey1_join_request_pending.png, journey1_captain_approved_roster.png, journey2_team_booking_badge.png, journey3_event_registered_venue1.png, journey4_mobile_amharic_team.png, journey4_mobile_amharic_venue.png.
     - Frozen UI baseline strictly preserved. No merge, push, or deployment.

- Step 17 (Milestone M4 Part 1 Step 3: Resolution of 6 Review Findings on Teams & Event Registration):
  1. Revalidate event registrations when publishing (Finding 1):
     - Extracted validateEventRegistrationInvariants in frontend/src/demo/transport.ts.
     - Invoked the invariant check in both draft save (PATCH /owner/stadiums/:id/microsite) AND draft publish (POST /owner/stadiums/:id/microsite/publish), guaranteeing that if registrations occur against a published event while a draft removing, shrinking, or mutating that event is pending, publication is rejected with 409 conflict.
     - Added comprehensive regression test in tests/teams-events.test.cjs.
  2. Faithful event preview & honest failure handling (Finding 2):
     - In frontend/src/components/venue-site.tsx, preview mode (previewSite || isDraftPreview) maps eventDetails directly from previewSite.events / draft definitions rather than loading stale published events.
     - Live requests to eventsService.list bubble genuine errors directly to useServiceQuery without fabricating zero registrations, full availability, or open status.
     - Added regression test asserting honest error bubbling for nonexistent venues.
  3. Complete explicit participation formats & doubles validation (Finding 3):
     - In frontend/src/components/site-content-editor.tsx, added explicit format selector (formatTeam, formatSingles, formatDoubles) for each CMS event, with dynamic capacity labels (capacityTeams, capacitySingles, capacityDoubles). New events initialize with format: 'team'.
     - In frontend/src/demo/transport.ts and frontend/src/components/venue-site.tsx, enforced non-empty partnerName (rejecting empty or whitespace strings with 422 validation).
     - Added negative tests in tests/teams-events.test.cjs verifying empty, whitespace, and omitted partner names are rejected.
  4. Removal of private booking references from public responses (Finding 4):
     - Defined dedicated PublicTeamMatch DTO in frontend/src/services/contracts.ts (with opaque matchId: 'match-' + team.id + '-' + date + '-' + startHour + '-' + idx), completely omitting private id, bookingId, totalMinor, and paymentStatus.
     - Updated TeamMatchDetail extending PublicTeamMatch for authorized captains and members.
     - Updated frontend/src/demo/transport.ts and frontend/src/components/team-panels.tsx to key match listings by matchId.
     - Added unit regression test verifying non-members receive strictly undefined for all private booking references.
  5. Restore pending join status after reload (Finding 5):
     - Added teamsService.myRequest(teamId, signal) endpoint returning the caller's persisted pending TeamJoinRequest or null.
     - In frontend/src/components/team-panels.tsx, queried myRequest for authenticated non-members and derived isPending = pendingRequested || myRequest?.status === 'pending', rendering the persistent joinRequestPending badge across reloads.
     - Added unit regression test verifying persisted request retrieval across sessions.
  6. Resilient registration-dialog loading states (Finding 6):
     - Migrated EventRegistrationDialog in frontend/src/components/venue-site.tsx to useServiceQuery, providing explicit loadingInitial and initialError states with an actionable retry button (ServiceErrorMessage).
     - Distinguished guest unauthenticated status (401 / unauthorized returns currentUser = null) from genuine network/server errors (which bubble up to initialError), preventing authentication or network failures from misrepresenting as 'no matching team'.
  7. Verification:
     - 59/59 unit tests pass (npm test).
     - Scoped ESLint is 100% clean (0 errors, 0 warnings on all touched files).
     - Next.js production build succeeds with 0 errors (npm run build).
     - All 4 end-to-end browser journeys pass (node tests/verify-teams-events-e2e.mjs).
     - Preserved frozen UI baseline. No merge into main, push, or deploy.

- Step 18 (Milestone M4 Part 1 Step 4: Resolution of Event Dialog Stale Registration & Team Profile Error States):
  1. Event dialog fresh registration resolution:
     - In frontend/src/components/venue-site.tsx, replaced registeringEvent object state with registeringEventId: string | null. Resolved effectiveEvent dynamically via resolveEffectiveEvent(registeringEventId, eventDetails).
     - In frontend/src/lib/use-service-query.ts, updated reload() to preserve previous data during background reloads (setState(prev => ({ ...prev, loading: true }))), and updated venue-site guard to if (query.loading && !query.data) so the dialog and page do not unmount on query reload.
     - Registration and cancellation complete with confirmation messages displayed inside the mounted dialog. Upon closing deliberately, clicking Registered ✓ reopens the dialog resolving fresh details (Cancel Registration), never offering the completed registration form again with a stale snapshot.
  2. Team-profile honest failure & retry handling:
     - In frontend/src/services/teams.service.ts, exported fetchTeamDetailData(id, deps, signal) and isGuestAuthError(err). Explicitly treats 401 unauthorized as me = null (genuine guest user), while bubbling real auth service errors (500/network), captain join-request query failures, personal join-request query failures, and team lookup failures to query.error.
     - In frontend/src/components/team-panels.tsx, integrated fetchTeamDetailData with ServiceErrorMessage error={query.error} retry={query.reload}, preventing operational failures from misrepresenting as 'signed out', empty join requests, or active Join buttons.
  3. Actual storage reconstruction, renderer resolution, and browser test coverage:
     - Storage reconstruction: updated teamsService.myRequest unit test in tests/teams-events.test.cjs to serialize storage state, reconstruct a brand new simulator instance, and verify join request persistence across storage reloads.
     - Production renderer resolution: added unit test exercising resolveVenueSiteEvents (confirming draft events take precedence in preview mode) and resolveEffectiveEvent (confirming fresh registration details resolve dynamically).
     - Error state isolation: added unit test exercising fetchTeamDetailData, verifying 401 returns me = null while operational failures reject to trigger retry.
     - Browser E2E coverage in tests/verify-teams-events-e2e.mjs:
       - Journey 1: reloaded the page via CDP after join request submission, asserting 'Join request pending' persists across page reload; added Step 1d asserting operational query failures render honest error state with retry button.
       - Journey 3: asserted registration dialog stays mounted with confirmation success text after submission, verified deliberate close, and verified re-opening Registered ✓ resolves fresh details (Cancel Registration button, no registration form).
  4. Verification results:
     - 60/60 unit tests pass (npm test).
     - Scoped ESLint passes with 0 errors and 0 warnings on all touched files.
     - Next.js production build compiles with 0 errors (npm run build).
     - All 4 end-to-end browser journeys pass cleanly (node tests/verify-teams-events-e2e.mjs).
     - Frozen UI baseline strictly preserved. Continued on branch codex/teams-events; no merge into main, push, or deploy.

- Step 19 (Milestone M4 Part 1 Step 5: Shared Query-Hook Resource Identity and Lifecycle Correction):
  1. Shared query-hook resource identity correction:
     - In frontend/src/lib/use-service-query.ts, updated useServiceQuery to accept an optional explicit query key (supporting useServiceQuery(loader, key) and useServiceQuery(key, loader)).
     - Derived effectiveData and effectiveLoading by checking areQueryKeysEqual(state.key, serializedKey).
     - Same-resource refreshes (reload() or identical query key) preserve previous data during loading, keeping mounted UI elements (such as confirmation dialogs and active forms) mounted.
     - Resource identity changes (switching team, venue, or preview context) immediately reset effectiveData to undefined during render, preventing any flash of previous actionable data while the new resource loads.
     - Passed explicit query keys in frontend/src/components/team-panels.tsx (id) and frontend/src/components/venue-site.tsx (['venue-site', slug, !!previewSite, !!isDraftPreview, previewVenue?.id] and ['event-registration-dialog', event.id, event.format, event.sport]).
  2. Hook and component lifecycle tests:
     - Added comprehensive hook lifecycle unit test in frontend/tests/teams-events.test.cjs exercising:
       a. Same-resource reload preserving data and keeping confirmation dialogs mounted without skeleton unmounts.
       b. Switching resources with delayed backend responses immediately resetting data to undefined and rendering loading skeletons, proving previous actionable data is never accessible or displayed during the delay.
     - Added browser E2E verification in frontend/tests/verify-teams-events-e2e.mjs (Step 1e) validating that switching team routes immediately clears previous team controls and never displays stale actions.
  3. Verification results:
     - 61/61 unit tests pass (npm test).
     - Scoped ESLint passes with 0 errors and 0 warnings on all touched files.
     - Next.js production build compiles with 0 errors (npm run build).
     - All 4 end-to-end browser journeys pass cleanly (node tests/verify-teams-events-e2e.mjs).
     - Frozen UI baseline strictly preserved. Continued on branch codex/teams-events; no merge into main, push, or deploy.

- Step 20 (Milestone M4 Part 2 Step 1: Camera & Recording Domain Contracts, Simulator, Fixtures & Unit Tests):
   1. Domain contracts & DTOs:
      - In frontend/src/services/contracts.ts, established typed CameraDevice, CameraCertificationStatus (pending, passed, failed, revoked), CameraConnectivityStatus (online, offline, unknown), CameraRegisterInput, CameraUpdateInput, and CameraCertificationReviewInput.
      - Established typed MatchRecording, RecordingStatus (scheduled, recording, uploading, processing, ready, failed), PrivacyConsent, PrivacyConsentStatus (pending, granted, denied, revoked), PrivacyProcessing, PrivacyBlurStatus (pending, processing, completed, failed), PublicationControl, MediaVisibility (private, unlisted, public), ReplayPlayback, and PublicHighlight.
   2. Typed service operations:
      - In frontend/src/services/media.service.ts, implemented cameras, registerCamera, updateCamera, certifyCamera, recordings, recordingDetail, retryRecording, advanceRecordingDemoState, updateConsent, completePrivacyBlur, updatePublication, unpublishRecording, replays, bookingReplay, and venueHighlights.
   3. Centralized fixtures and simulator:
      - In frontend/src/demo/fixtures.ts, seeded initial camera devices across Bambis Meda (venue-1) and Unity Sports Complex (venue-2), including passed, failed, and pending devices with honest failure reasons and recovery guidance.
      - Seeded booking-linked match recordings across both venues, representing ready, scheduled, recording, failed, and processing states, complete with Creative Commons licensed sample playback attribution.
      - In frontend/src/demo/transport.ts, implemented tenant-scoped camera and recording routes, certification gates (owners cannot self-certify), recording retry, demo lifecycle advancement, consent updates, privacy face-blurring, publication invariants (rejecting public visibility if consent or face-blur is incomplete), unpublication, entitled replay playback, and microsite public highlights.
   4. Unit test suite:
      - In frontend/tests/camera-media.test.cjs, implemented 11 behavioral tests covering 2-owner isolation, admin certification separation, recording lifecycle transitions, honest error/unavailable states, team member entitlement, consent and blur publication gating, minor guardian consent enforcement, public listing boundaries, unpublication, and storage reconstruction persistence.

- Step 21 (Milestone M4 Part 2 Step 2: Camera Admin UI, Recording Lifecycle, Replay Playback, Consent Matrix & Browser E2E Suite):
   1. Venue owner camera administration:
      - In frontend/src/components/camera-admin.tsx, implemented OwnerCameras with scoped camera listing, registration and editing dialogs, field assignment dropdowns, separated certification and connectivity status pills, failure reason displays, and actionable recovery guidance.
      - Implemented simulated AdminReviewModal enabling platform inspection with passed, failed, and revoked outcomes (owners strictly barred from self-certifying).
   2. Recording lifecycle & privacy controls:
      - Added Recordings tab in owner administration showing all venue recordings with status pills, failure notices, retry buttons for eligible failed recordings, and interactive demo state advancement simulator.
      - Implemented comprehensive RecordingDetailModal with participant consent toggles (granted, denied, revoked), minor guardian consent controls, privacy face blur simulation, publication visibility dropdown (private, unlisted, public) protected by conservative privacy invariants, and unpublication controls.
   3. Player replay library & playback:
      - In frontend/src/components/match-replay.tsx, created accessible ReplayModal with HTML5 video controls, Creative Commons licensed playback attribution (Big Buck Bunny), honest non-playable states (processing, failed, forbidden, expired, unavailable), and keyboard Escape listener.
      - In frontend/src/components/booking-list.tsx, embedded Match Replay trigger on entitled player booking cards and owner reservation lists without shifting Fiber hook indices or displacing reschedule/cancel button order.
   4. Microsite highlights integration:
      - In frontend/src/components/venue-site.tsx, connected Recent Match Highlights & Goals section to mediaService.venueHighlights(venue.id), displaying published match clips with interactive video preview dialogs.
   5. Internationalization & key parity:
      - In frontend/src/i18n/en.ts and frontend/src/i18n/am.ts, added all camera, recording, consent, blur, visibility, and replay keys with 100% key parity (72/72 tests verifying dictionary parity).
   6. In-repository browser test suite:
      - Created frontend/tests/verify-camera-media-e2e.mjs verifying all 6 comprehensive browser journeys over Chrome DevTools Protocol:
        - Journey 1: Owner camera administration, court assignment, failure recovery guidance, and admin certification modal.
        - Journey 2: Match recordings tab, retry action, detail inspection, privacy/consent publication blocking, and public publishing.
        - Journey 3: Player booking detail replay button, HTML5 video rendering, attribution text, and keyboard Escape closing.
        - Journey 4: Microsite public match highlights grid and preview dialog playback.
        - Journey 5: Mobile viewport (390x844) responsive layout and Amharic localization without overflow.
        - Journey 6: Demo state persistence across full browser reload.
   7. Full verification results:
      - 72/72 unit tests pass (npm test).
      - Scoped ESLint passes with 0 errors and 0 warnings across all touched files.
      - Next.js production build passes with 0 errors (npm run build).
      - All 4 end-to-end browser test suites pass cleanly:
        - Camera, Match Media & Privacy suite: 6/6 journeys pass (node tests/verify-camera-media-e2e.mjs).
        - Booking operations suite: 7/7 journeys pass (node tests/verify-journeys-e2e.mjs).
        - CMS publishing suite: 8/8 journeys pass (node tests/verify-cms-e2e.mjs).
        - Teams & events suite: 4/4 journeys pass (node tests/verify-teams-events-e2e.mjs).
      - Preserved frozen UI baseline. Working strictly on branch codex/camera-media-privacy; no merge into main, push, or deploy.

- Step 22 (Milestone M4 Part 2 Review Findings Resolution: Privacy, Entitlements, Admin Review & Honest Lifecycle):
   1. Stopped auto-manufacturing completed recordings:
      - New online bookings and walk-in reservations create honest scheduled recordings with status: 'scheduled', playbackUrl: null, pending consent, and pending face blur. Recordings are only attached if the court has an active camera installed.
      - GET requests (GET /bookings/:id/replay) are strictly read-only and never create missing recordings or grant consent. Bookings without recordings return honest entitlementStatus: 'unavailable', canPlay: false, and clear explanation without mutating simulator state.
      - Centralized sample media URLs, thumbnail assets, and CC-attribution into SAMPLE_MEDIA_CONFIG in frontend/src/demo/fixtures.ts.
   2. Explicit replay entitlements:
      - Added typed ReplayEntitlement contract in frontend/src/services/contracts.ts and mediaService.grantReplayEntitlement in frontend/src/services/media.service.ts.
      - Replaced team membership blanket access and hardcoded fixture-ID exceptions with explicit entitlement records in state.entitlements. Approved team members cannot play private recordings without an explicit entitlement grant.
   3. Centralized public eligibility and expiry checks:
      - Unified isRecordingPubliclyEligible(rec) validation across venue highlights, replay library listing, and playback endpoints. Expired recordings (retentionExpiresAt in the past) are excluded from public highlights.
      - Public playback responses omit private booking references (bookingId: undefined).
      - Added CMS highlight URL validation on draft save and publish (/owner/stadiums/:id/microsite), rejecting highlights referencing ineligible or expired recordings.
   4. Usable administrator camera certification workflow:
      - Created platform administrator review surface at /admin/cameras (AdminCameras in frontend/src/components/admin-panels.tsx and frontend/src/app/admin/cameras/page.tsx).
      - Added cameras navigation link to adminLinks in frontend/src/components/workspace-shell.tsx.
      - Removed owner-inaccessible review submission button from OwnerCameras; owners see certification status badges, failure reasons, and recovery guidance.
      - Certified cameras update status to certified, certificationStatus: 'passed', and clear failure reasons and recovery guidance.
      - Updated browser E2E test to execute administrator certification at /admin/cameras, asserting that the camera status actually updates to passed and displays Certified on the owner screen.
   5. Restored honest highlight error state:
      - In frontend/src/components/venue-site.tsx, stopped swallowing highlight service failures into empty arrays. Captured highlightsError and rendered an accessible ServiceErrorMessage error={highlightsError} retry={query.reload} within the highlights section.
   6. Complete localization and demo boundaries:
      - Localized "4K Broadcast" (broadcast4k), privacy policy text (privacyPolicyInvariant), "Minor participants present" (minorParticipantsPresent), guardian consent buttons (guardianGrant, guardianDeny), and admin review notices with 100% parity across English and Amharic dictionaries.
      - Gated simulation controls in RecordingDetailModal behind isDemoMode with a clear demoSimulationOnly tag.
      - Kept retention duration configurable in fixtures and commercial policy explicitly provisional.
   7. Full verification results:
      - 75/75 unit tests pass (npm test).
      - Scoped ESLint passes with 0 errors and 0 warnings on all touched files.
      - Next.js production build passes with 0 errors (npm run build).
      - All 4 end-to-end browser test suites pass cleanly:
        - Camera, Match Media & Privacy suite: 6/6 journeys pass (node tests/verify-camera-media-e2e.mjs).
        - Booking operations suite: 7/7 journeys pass (node tests/verify-journeys-e2e.mjs).
        - CMS publishing suite: 8/8 journeys pass (node tests/verify-cms-e2e.mjs).
        - Teams & events suite: 4/4 journeys pass (node tests/verify-teams-events-e2e.mjs).
      - Preserved frozen UI baseline. Working strictly on branch codex/camera-media-privacy; no merge into main, push, or deploy.
