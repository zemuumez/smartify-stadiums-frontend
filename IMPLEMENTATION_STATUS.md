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
