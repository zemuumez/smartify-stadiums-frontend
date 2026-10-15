# Frontend service boundary

Components import named domain services from `@/services`. Each domain owns its request paths and typed inputs/outputs; `http.ts` owns network behavior. `createServices(transport)` lets tests inject the simulator without changing UI contracts.

- `authService`: OTP, login, registration, current account, logout.
- `venuesService`: public discovery, detail, fields, owned venues, registration.
- `bookingsService`: availability, reservations, cancellation, closures.
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

Bookings send an Idempotency-Key; shared physical courts have one field ID even across different sports. The simulator supports future unpaid manual-settlement bookings and future unpaid cancellation only; these are explicitly provisional demo policies. Commission and subscription prices remain null. Database constraints and transactions must enforce real concurrency independently of this simulator.

## Testing

`npm test` compiles the service/demo layer and runs Node's built-in test runner without adding dependencies. Tests cover mode safety, OTP failure, tenant scope, shared-court overlap, idempotency, quotes, cancellations/closures, draft publication, unset pricing, CSRF and HTTP failure behavior. Passing simulator tests does not prove server security.

## Venue microsites and subdomains

The restored directory, public microsites and management screens share the same venue IDs and service contracts. Demo seeds live in `src/demo`; directory display rates/counts are derived from the operational courts, not separate UI arrays. Six sample venues each have an owner account and separate draft/published content. Demo state v2 intentionally starts fresh so the old two-venue state cannot mask the restored catalog.

- Without domain configuration: `/s/bambis-meda`, `/s/unity-complex`, etc. Management: `/s/{slug}/manage`.
- With `NEXT_PUBLIC_ROOT_DOMAIN=yourdomain.com` at build/deployment: links use `https://{slug}.yourdomain.com/`. Tenant `/admin` and `/cms` rewrite to that venue's management screen. `/cms` selects the CMS tab.
- Local subdomains: set `NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000` and restart/rebuild. Chromium resolves `bambis-meda.localhost:3000` locally. No external DNS changes have been made.
- Deployment requires wildcard DNS and TLS plus a host allowlist at the ingress. A venue slug selects content; it does not authorize an administrator. Backend must derive tenant membership from the authenticated session and validate each field/booking/content resource. Never trust an incoming tenant ID or forwarded host alone.
- Keep sessions host-only by default; shared cross-subdomain login must be designed explicitly. Demo sessionStorage is origin/tab-local: reservations made on one demo subdomain are not shared across origins. Real backend storage is required for shared production data. Same-origin `/s/` routes support the shared local demo workflow now.
- CMS `Microsite` includes `highlights` and `events`. Save/publish stays scoped to `/owner/stadiums/{id}/microsite`. Draft changes remain private until publication. Only public HTTPS media should be supplied; private replay authorization and signed URLs are future backend work.
- Highlights without media show an explicit preview state. Event registration currently contacts the venue; there is no simulated registration/payment success. Prices are illustrative, and commission remains unresolved.
