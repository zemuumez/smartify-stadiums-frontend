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
- `POST /bookings` (with `teamId`): authorized team captain creates a reservation on behalf of their team.
  - Authority: the authenticated user must be the recorded `captainId` of the specified `teamId`. Unauthorized callers receive 403 `forbidden`.
  - Compatibility: the team's sport must strictly match the court/booking sport. Mismatches receive 422 `validation`.
  - Authoritative attribution: `teamName` is derived server-side from the team record; client-provided team names are discarded.
  - Visibility: the booking appears in both player and owner schedules, as well as the team schedule.

### Teams operations and privacy
- `GET /teams`: list public teams (ID, name, sport, city, captain name, description, member count).
- `GET /teams/:id`: get full team profile and roster member list.
- `POST /teams`: authenticated player creates a team, becoming its captain and first member.
- `POST /teams/:id/join`: authenticated player requests to join. Duplicate pending requests or requests from existing members receive 409 `conflict`.
- `GET /teams/:id/requests`: captain lists pending join requests. Non-captains receive 403 `forbidden`.
- `POST /teams/:id/requests/:requestId/approve`: captain approves join request, adding player to roster.
- `POST /teams/:id/requests/:requestId/reject`: captain rejects join request.
- `POST /teams/:id/leave`: member leaves team. Captains cannot leave if other members remain (must transfer captaincy first; otherwise 409 `conflict`). Sole captain leaving deletes the team.
- `DELETE /teams/:id/members/:memberId`: captain removes a member from the roster. Captain cannot remove themselves (409 `conflict`). Non-captains receive 403 `forbidden`.
- `GET /teams/:id/bookings`: list team match bookings.
  - Member view (captains, members, admin): returns full booking records including `totalMinor`, `paymentStatus`, and contact info.
  - Public view (non-members, guests): returns sanitized match fixtures (`id`, `venueId`, `fieldId`, `sport`, `date`, `startHour`, `endHour`, `status`), stripping financial amounts, payment statuses, and guest phone numbers.

### Venue events and operational registrations
- `GET /venues/:venueId/events`: list public events for a venue, returning dynamic capacity (`spots`, `registeredCount`, `availableSpots`, `isFull`, `isClosed`) and the caller's registration status.
- `GET /venues/:venueId/events/:eventId`: detail view for a single event.
- `POST /venues/:venueId/events/:eventId/registrations`: register for an event.
  - Formats:
    - `singles`: registers individual player. Capacity counts individuals.
    - `doubles`: registers player with optional `partnerName`. Capacity counts pairs.
    - `team`: requires `teamId`. Authenticated user must be captain of a team matching the event sport. Capacity counts teams.
  - Validation: closed events (past date/time) or full events (`availableSpots === 0`) receive 409 `conflict`. Duplicate registration by the same player/team receives 409 `conflict`.
- `POST /venues/:venueId/events/:eventId/registrations/:registrationId/cancel`: cancel registration.
  - Allowed actors: registering player, registering team captain, or venue owner/admin.
  - Effect: registration marked `cancelled`, restoring 1 available spot. Cancelling an already cancelled registration receives 409 `conflict`.
- CMS separation and safety invariants:
  - Event metadata (title, date, time, sport, format, total spots) is editorial content stored in `Microsite.events`.
  - Registrations are authoritative operational records stored independently.
  - CMS edit safety: saving a microsite draft cannot delete an event with active registrations, cannot reduce capacity below existing active registrations, and cannot change an event's sport or format while active registrations exist. Such attempts receive 409 `conflict`.

## Testing

`npm test` compiles the service/demo layer and runs Node's built-in test runner without adding dependencies. Tests cover mode safety, OTP failure, tenant scope, shared-court overlap, idempotency, quotes, cancellations/closures, draft publication, unset pricing, CSRF and HTTP failure behavior. Passing simulator tests does not prove server security.

## Venue microsites and subdomains

The restored directory, public microsites and management screens share the same venue IDs and service contracts. Demo seeds live in `src/demo`; directory display rates/counts are derived from the operational courts, not separate UI arrays. Six sample venues each have an owner account and separate draft/published content. Demo state v2 intentionally starts fresh so the old two-venue state cannot mask the restored catalog.

- Without domain configuration: `/s/bambis-meda`, `/s/unity-complex`, etc. Management: `/s/{slug}/manage`.
- With `NEXT_PUBLIC_ROOT_DOMAIN=yourdomain.com` at build/deployment: links use `https://{slug}.yourdomain.com/`. Tenant `/admin` and `/cms` rewrite to that venue's management screen. `/cms` selects the CMS tab.
- Local subdomains: set `NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000` and restart/rebuild. Chromium resolves `bambis-meda.localhost:3000` locally. No external DNS changes have been made.
- Deployment requires wildcard DNS and TLS plus a host allowlist at the ingress. A venue slug selects content; it does not authorize an administrator. Backend must derive tenant membership from the authenticated session and validate each field/booking/content resource. Never trust an incoming tenant ID or forwarded host alone.
- Keep sessions host-only by default; shared cross-subdomain login must be designed explicitly. Demo sessionStorage is origin/tab-local: reservations made on one demo subdomain are not shared across origins. Real backend storage is required for shared production data. Same-origin `/s/` routes support the shared local demo workflow now.
- CMS `Microsite` includes `highlights`, `events`, `heroImage`, `logoUrl`, `announcement`, `contactPhone`, `contactEmail`, `socialLinks`, `gallery`, and `primaryColor`. Save/publish/unpublish stays scoped to `/owner/stadiums/{id}/microsite`. Draft changes remain private until publication.
- `POST /owner/stadiums/{id}/microsite/publish`: publishes the venue's draft site, making it publicly available at `/s/{slug}` with dynamic primary-color branding, logo, photo showcase, and social links.
- `POST /owner/stadiums/{id}/microsite/unpublish`: removes the public microsite (public visitors receive an honest 404 / unpublished notice), while retaining the owner's draft, booking records, court schedules, and management access. Unpublishing preserves local uncommitted draft edits and never suspends the venue or cancels reservations.
- Operational separation: court inventory, hourly pricing, schedules, closures, and reservations are strictly operational data managed through `venuesService` and `bookingsService`. Editorial CMS content never duplicates or overrides court rates or availability.
- Supported media policy: remote images must strictly match Next.js configured remote patterns (`images.unsplash.com`, `playethiopia.com`, `*.playethiopia.com`) or be local root-relative assets starting with `/`. Insecure HTTP, protocol-relative `//`, and arbitrary hosts are rejected with accessible alerts before saving.
- Internal navigation protection: client-side routing, dashboard tab switches, and browser history popstate are intercepted whenever draft edits are unsaved, prompting confirmation before discarding state.
- Decoupled preview: draft preview mode reuses the shared `VenueSite` renderer with authorized owner data, enabling unapproved or pending venues to preview their microsites before public activation.
- Live preview: renders the draft in-context using the public microsite renderer (`VenueSite`), allowing venue owners to preview unsaved or saved changes without publishing.
- Highlights without media show an explicit preview state. Event registration currently contacts the venue; there is no simulated registration/payment success. Prices are illustrative, and commission remains unresolved.
