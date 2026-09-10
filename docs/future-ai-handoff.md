# Future AI Conversation Handoff

Use this document at the start of future Carsport work. Read [project-progress.md](project-progress.md), [testing.md](testing.md), [architecture.md](architecture.md), and [improvements-and-future-tasks.md](improvements-and-future-tasks.md) before changing code.

## Current published baseline

- **Branch:** `main`
- **Latest published commit:** `92ef72e` — user authentication and resource ownership.
- **Implemented phases:** Foundation, catalog/database, 3D vehicle loading, configuration validation/persistence, pricing/quotation foundation, and the Step 5 authentication substep.
- **Local runtime:** Docker Compose; frontend at `http://localhost:5173`, backend at `http://localhost:4000`, realtime service at `http://localhost:5000` and disabled by default.
- **Database:** PostgreSQL 16, accessed through Prisma only.
- **Cache:** Redis 7, non-authoritative; catalog falls back to PostgreSQL.

## Implemented user flow

1. User selects **Demo Sport** from the catalog.
2. Babylon.js loads the base GLB in the central canvas through `GET /api/assets/:assetId/model.glb`.
3. User selects compatible parts in the configuration panel.
4. Backend validates compatibility and placement zone, persists a configuration, and returns `valid`, `warnings`, and `errors`.
5. Valid configurations create a saved, itemized EUR quote. Values are stored as integer cents and quote payloads preserve price snapshots.

## Important implementation constraints

- The vehicle viewer must call Babylon `SceneLoader.LoadAssetContainerAsync('', modelUri, scene)`; this argument order was required by the installed Babylon.js version.
- Model assets are proxied through the backend. Do not restore direct browser loading from external hosts without reviewing CORS, availability, and authorization.
- Docker anonymous `node_modules` volumes can retain stale dependencies. After package changes, use an image rebuild plus `--renew-anon-volumes` when testing the active dev stack.
- PowerShell can block `npm.ps1`; use `npm.cmd` or Docker-based package/test commands.
- Every performed test, browser confirmation, migration, build, or deployment check must be added to [testing.md](testing.md) with expected and actual results.
- Do not begin a permission-gated project step until the user approves it. Complete testing, documentation, commit, and push before requesting the next approval.

## Current limitations — intentionally deferred

- Authentication uses PostgreSQL users, bcrypt password hashes, and HTTP-only JWT cookies. Configuration and quote requests are user-owned. Password reset, CSRF protection, token rotation, and Socket.IO handshake authorization remain unimplemented.
- Realtime collaboration is disabled and must remain disabled until authentication, authorization, persistence, and multi-instance coordination exist.
- Placement rules do not yet include geometry collision, fitment measurements, exclusions, dependencies, or safety validation.
- Docker Compose is a development stack, not a production deployment.

## Next approved-work candidate: Step 5

Step 5 is production hardening and deployment preparation. It should be broken into explicit approved substeps:

1. Add CSRF protection, password reset, token rotation, and Socket.IO handshake authorization.
2. Add rate limiting, security headers, CSP, TLS/HSTS at the reverse proxy, and complete model timeout tests.
3. Create production Docker images, Nginx static/reverse-proxy configuration, non-root containers, and environment/secrets separation.
4. Add CI checks for the full backend test suite, production builds, image builds, and deployment workflow.
5. Add health/ready checks, structured logging, monitoring, PostgreSQL backup/restore runbook, and operational documentation.

## Verified commands

Run from the repository root through Docker Compose:

- Start/rebuild local stack: `docker compose up -d --build`
- Backend integration suite: `docker compose exec -T backend npm test`
- Frontend lint: `docker compose exec -T frontend npm run lint`
- Frontend build: `docker compose exec -T frontend npm run build`

Record the result in [testing.md](testing.md). Do not claim a browser feature works until a user or enabled browser inspection confirms it.
