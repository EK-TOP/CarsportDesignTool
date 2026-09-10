# Carsport Improvements and Future Tasks

This document records architecture audit decisions, agreed improvements, and work intentionally deferred to later phases.

## Audit decisions — 2026-09-10

| # | Topic | Decision / answer | Follow-up |
| --- | --- | --- | --- |
| 1 | Authentication and ownership | Implemented PostgreSQL users, HTTP-only JWT cookies, and configuration/quote ownership. The application remains unsuitable for public deployment until CSRF protection, password reset, token rotation, and production secret management are added. | Step 5: complete production authentication hardening and Socket.IO handshake authorization. |
| 2 | Request protection | Implemented a `1mb` JSON request-body limit. Production rate limiting remains a Step 5 requirement. | Step 5: add a production rate-limit policy. |
| 3 | Model fetch timeout | Implemented a 10-second `AbortController` timeout with controlled `504` response handling. | Step 5: add timeout and stream-abort tests. |
| 4 | Price snapshots | A saved quote is the sales-reference record. The current `Quote.payload` stores the itemized price snapshot, and `subtotalCents`, `discountCents`, and `totalCents` preserve the totals even if catalog prices later change. Customers are not exposed to this data in the current application. | Keep quotations with the project/configuration; add sales access controls with authentication. |
| 5 | Server environment | Development Docker uses watch mode, bind mounts, and anonymous dependency volumes. This is expected locally and must not be used as the production deployment model. | Step 5: build production images, serve the compiled frontend with Nginx, use non-root users, secrets, TLS, health checks, monitoring, backups, and environment separation. |
| 6 | Advanced rule validation | Collision, fitment, exclusions, dependencies, and safety validation will be added later. Current rules intentionally cover compatibility, zone category, duplicate selections, and exclusive zones. | Future configuration/rule-engine iteration. |
| 7 | Catalog pagination | Add bounded `limit` and `offset` query parameters to `GET /api/vehicles`, enforce safe maximums (for example default 20, maximum 100), query with Prisma `take` and `skip`, and return `{ data, pagination: { limit, offset, total } }`. The frontend then requests successive pages or uses search. | Add when the vehicle catalog grows beyond the current small demo set. |
| 8 | Cache validation | Implemented structural validation of cached vehicle summaries. Invalid cached content is discarded and PostgreSQL is queried. | Add dedicated cache-corruption tests in Step 5. |
| 9 | Repeated CUID checks | Implemented a shared `isCuid(value)` backend utility used by catalog, configuration, and pricing routers. | Add dedicated unit tests for the shared utility in Step 5. |
| 10 | Frontend API response validation | Approved for implementation now. Zod validates browser API payloads before the UI uses them, turning malformed server data into controlled request errors rather than runtime component failures. | Implemented in the frontend catalog and configuration API modules. |
| 11 | Authentication | Approved and implemented: PostgreSQL users, bcrypt password hashes, JWT HTTP-only cookies, and authenticated configuration/quote ownership. | Add production secret management, CSRF protection, password reset, and Socket.IO handshake authorization before public deployment. |

## Prioritized future backlog

## Frontend security review — 2026-09-10

### Confirmed safe behavior

- React renders current API and validation messages as escaped text nodes. The frontend does not use `dangerouslySetInnerHTML`, so the reviewed error displays are not an active XSS path.
- `VITE_*` values are public browser build-time configuration. Secrets must never be stored in them.
- Browser password pasting remains allowed to support password managers and accessibility tools.

### Required before public deployment

1. Add CSRF protection to authenticated state-changing requests. HTTP-only JWT cookies and `credentials: 'include'` are implemented, but they are not sufficient on their own for a public deployment.
2. Create a shared frontend API URL module that validates `VITE_API_URL`, requires it for production builds, and rejects non-HTTPS production URLs.
3. Replace the temporary detailed Babylon viewer error shown to users with a generic message. Retain technical detail only in browser/server logs.
4. Restore the signed-in account on app startup through `GET /api/auth/me`, and provide a logout control that calls `POST /api/auth/logout`.
5. Add a dependency vulnerability check to CI using `npm audit --audit-level=moderate` after a lockfile install.
6. Configure CSP, frame protection, `X-Content-Type-Options`, referrer policy, TLS/HSTS, and secure cookies at the production Nginx/reverse-proxy layer. HTML meta tags are not a substitute for these response headers.

### Classification

- These are deployment/security-hardening requirements, not confirmed current browser exploits in the local development stack.
- The favicon `404` seen during development is unrelated to authentication, model loading, or frontend security.

### Before public deployment

1. CSRF protection, password reset, token rotation, session restoration, logout, and Socket.IO handshake authorization.
2. Production HTTPS API URL validation, rate limiting, security headers, TLS/HSTS, and model-fetch timeout tests.
3. Production Docker images and Nginx deployment configuration.
4. Transactional quote generation and immutable pricing snapshots.
5. Monitoring, structured logging, database backups, and restore testing.

### Product and scale improvements

1. Catalog pagination, search, and filtering.
2. Cache schema validation and cache observability.
3. Advanced placement, collision, fitment, dependency, and safety rules.
4. Persisted designer state and customer/sales workflows.
5. Browser end-to-end tests and expanded API failure-path coverage.
