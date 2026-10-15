# Project delivery rules

- Follow FRONTEND_MASTER_PLAN.md. Multi-sport support is confirmed. Subscription prices, extras and commission are provisional; never hardcode commercial policy as approved.
- Keep all demo business records under frontend/src/demo. Components must not contain private copies of demo datasets. Distinguish demo from live mode explicitly; API failures must never create demo success.
- Put requests behind typed, domain-specific functions in frontend/src/services. UI components import services, not HTTP clients. Shared DTOs, request errors and transport behavior belong in the service layer. Document proposed contracts for the future backend.
- Frontend-first does not mean security in the browser: deny unauthorized UI access, never persist real credentials in demo storage, and document required server-side authorization, validation and concurrency guarantees.
- Use extensible translation dictionaries. English and Amharic are required. New user-facing workflows must support both; update document language and locale-aware formatting. Do not translate venue/user-authored content by guessing.
- Build and verify mobile layouts, keyboard access, accessible labels, loading, empty, error and retry states alongside desktop behavior.
- Test meaningful behavior for each implementation step, run applicable lint/type/build checks, then commit that step with a clear message. Do not commit unrelated pre-existing changes or claim untested functionality is complete.
- Track completed work and remaining migration in IMPLEMENTATION_STATUS.md. Do not present a partially migrated frontend as fully integrated or production-secure.
- Preserve the founder-approved venue directory and stadium microsite designs. Service migrations must retain rich filters, venue perks, individual venue destinations, operational court cards, highlights, events and the booking modal; do not replace them with simplified generic pages.
