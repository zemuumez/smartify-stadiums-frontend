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
