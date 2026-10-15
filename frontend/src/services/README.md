# Frontend service boundary

Components import named domain services from `@/services`. Each domain owns its request paths and typed inputs/outputs; `http.ts` owns network behavior. `createServices(transport)` lets tests inject the simulator without changing UI contracts.

- `authService`: OTP, login, registration, current account, logout.
- `venuesService`: public discovery, detail, fields, owned venues, registration.
- `bookingsService`: availability, online reservations, owner walk-ins, safe rescheduling, cancellation, closures.
- `contentService`: public microsites, private drafts, save and publish.
- `teamsService`: directory, detail, creation.
- `mediaService`: owner cameras and entitled replay lists.
- `billingService`: unresolved commercial policy, invoices, derived analytics.
- `adminService`: users, venue review and audit entries.

Methods represent implemented contract surfaces; do not add imaginary successful methods for features not yet implemented. More operations are added with their corresponding workflow tests.

## Modes

Unset `NEXT_PUBLIC_DATA_MODE` means `api`. Only the exact value `demo` opts in to simulation. Typos fail closed. Demo records live in `src/demo/fixtures.ts`; the mock transport dynamically loads only in demo mode. Demo state persists in sessionStorage when available and never contains real credentials. It is deliberately not a cross-tab database or security boundary.

All remaining legacy page-local datasets and direct clients must be migrated before M6. The existence of these services alone does not complete that migration.

## Proposed backend contract

`NEXT_PUBLIC_API_URL` is the FULL versioned base, default `/api/v1`; do not append `/api/v1` twice. Responses are direct typed objects/arrays, not mixed envelopes. HTTP errors use 400/422 validation, 401 session, 403 permission, 404 missing, 409 conflict, 429/503 unavailable. UI translates normalized error codes and does not display raw server bodies. Runtime schema validation at each domain boundary remains a follow-up before live integration.

Live auth is a proposed secure-cookie session contract: Secure, HttpOnly session cookies with suitable SameSite policy, server-side Origin and CSRF verification, and precise credentialed CORS if using a separate origin. `GET /auth/csrf` returns `{ token }`; all mutations send `X-CSRF-Token`. Login/register return the account, not browser-persisted tokens. No automatic mutation retries. The client supports AbortSignal and bounded timeouts. Real OTP delivery, rate limiting and authorization belong on the server.

The existing legacy JWT backend assumptions are not claimed compatible with this contract. Backend design must reconcile them intentionally. Requests are not silently downgraded to mock data on failure.

Bookings send an Idempotency-Key; shared physical courts have one field ID even across different sports.
The simulator supports future unpaid manual-settlement bookings, future unpaid cancellation, owner walk-in reservations, and safe rescheduling. These are explicitly provisional demo policies; broader commercial policy, paid-status refunds, penalties, and settlement approval remain open. Commission and subscription prices remain null.

### Booking operations and permissions
- `POST /bookings`: authorized player creates online reservation. Input: `fieldId`, `sport`, `date`, `startHour`, `endHour`, `idempotencyKey`. Output: `Booking` with `source: 'online'`.
- `POST /owner/walk-ins`: authorized owner/admin creates walk-in reservation for an owned venue court. Input: `venueId`, `fieldId`, `sport`, `date`, `startHour`, `endHour`, `guestName`, optional `guestPhone`, `idempotencyKey`. Creates an unpaid reservation marked `source: 'walk_in'` and `playerId: ''`. Walk-ins occupy the same physical court inventory as online bookings and appear in the venue owner's schedule; they do not leak into player histories or create pseudo-accounts.
- `POST /bookings/:id/reschedule`: authorized actor moves a future, confirmed, unpaid booking to a new eligible interval on the same physical court.
  - Allowed actors: the player who owns the booking, the owner of the venue where the booking takes place, or platform admin. Unauthorized actors receive 403 `forbidden`.
  - Allowed states: `status === 'confirmed'` and `paymentStatus === 'unpaid'` only. Past bookings, cancelled bookings, or paid bookings receive 409 `conflict`.
  - Eligibility checks: the target slot must be strictly in the future, within court open/close hours, on an active court supporting the booking's sport, without conflicting closures or overlapping reservations (excluding the booking itself from its own slot check).
  - Atomic transition: a failed move leaves the original reservation and occupancy untouched; a successful move releases the old interval and occupies the new interval in a single transition, recalculating the quote according to duration and recording original schedule history (`originalSchedule`). Database transactions and row-level locking are required in production.
  - Idempotency: replaying an identical request returns the same result; reusing the key with different parameters returns 409 `conflict`. Actor authorization is checked before idempotency reuse.
- `POST /bookings/:id/cancel`: player or venue owner cancels a future unpaid booking, releasing the slot.

## Testing

`npm test` compiles the service/demo layer and runs Node's built-in test runner without adding dependencies. Tests cover mode safety, OTP failure, tenant scope, shared-court overlap, idempotency, quotes, cancellations/closures, draft publication, unset pricing, CSRF and HTTP failure behavior. Passing simulator tests does not prove server security.

## Venue microsites and subdomains

The restored directory, public microsites and management screens share the same venue IDs and service contracts. Demo seeds live in `src/demo`; directory display rates/counts are derived from the operational courts, not separate UI arrays. Six sample venues each have an owner account and separate draft/published content. Demo state v2 intentionally starts fresh so the old two-venue state cannot mask the restored catalog.

- Without domain configuration: `/s/bambis-meda`, `/s/unity-complex`, etc. Management: `/s/{slug}/manage`.
- With `NEXT_PUBLIC_ROOT_DOMAIN=yourdomain.com` at build/deployment: links use `https://{slug}.yourdomain.com/`. Tenant `/admin` and `/cms` rewrite to that venue's management screen. `/cms` selects the CMS tab.
- Local subdomains: set `NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000` and restart/rebuild. Chromium resolves `bambis-meda.localhost:3000` locally. No external DNS changes have been made.
- Deployment requires wildcard DNS and TLS plus a host allowlist at the ingress. A venue slug selects content; it does not authorize an administrator. Backend must derive tenant membership from the authenticated session and validate each field/booking/content resource. Never trust an incoming tenant ID or forwarded host alone.
- Keep sessions host-only by default; shared cross-subdomain login must be designed explicitly. Demo sessionStorage is origin/tab-local: reservations made on one demo subdomain are not shared across origins. Real backend storage is required for shared production data. Same-origin `/s/` routes support the shared local demo workflow now.
- CMS `Microsite` includes `highlights`, `events`, `heroImage`, and `announcement`. Save/publish/unpublish stays scoped to `/owner/stadiums/{id}/microsite`. Draft changes remain private until publication.
- `POST /owner/stadiums/{id}/microsite/publish`: publishes the venue's draft site, making it publicly available at `/s/{slug}`.
- `POST /owner/stadiums/{id}/microsite/unpublish`: removes the public microsite (public visitors receive an honest 404 / unpublished notice), while retaining the owner's draft, booking records, court schedules, and management access. Unpublishing never suspends the venue or cancels reservations.
- Operational separation: court inventory, hourly pricing, schedules, closures, and reservations are strictly operational data managed through `venuesService` and `bookingsService`. Editorial CMS content never duplicates or overrides court rates or availability.
- Live preview: renders the draft in-context using the public microsite renderer (`VenueSite`), allowing venue owners to preview unsaved or saved changes without publishing.
- Highlights without media show an explicit preview state. Event registration currently contacts the venue; there is no simulated registration/payment success. Prices are illustrative, and commission remains unresolved.
