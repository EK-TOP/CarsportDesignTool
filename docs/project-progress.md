# Carsport Design Tool — Project Progress

**Status:** Step 3 implemented and verified; awaiting publication.

This document records the work completed from the initial agent specifications through the first catalog-enabled version of the Carsport Design Tool. Each future implementation phase requires explicit approval before work proceeds.

## 1. Reviewed the agent specifications

All files in `aiAgents/` were examined to establish the intended product architecture and responsibilities.

| Agent | Scope established |
| --- | --- |
| Architecture | Enforce boundaries, contracts, and shared technology choices. |
| Frontend | React/Vite applications, Zustand state, API integration, dashboards, and Babylon.js integration. |
| 3D engine | Babylon.js vehicle viewer, assets, anchors, placement, snapping, materials, and collisions. |
| Backend | Express APIs, domain services, repositories, JWT, Redis caching, and WebSocket events. |
| Database | PostgreSQL schemas, Prisma models, migrations, indexes, and relations. |
| Rule engine | Compatibility, placement, fit, collision, dependency, exclusion, and safety validation. |
| Pricing engine | Base prices, component and material prices, promotions, discounts, formulas, and quotes. |
| Server | Docker, deployment, Nginx, monitoring, backup, and CI/CD responsibilities. |

## 2. Defined the foundation architecture

The following runtime structure is now established:

- **Frontend:** React and Vite application with a Babylon.js rendering surface.
- **Backend:** Node.js and Express REST API with PostgreSQL and Redis connections.
- **Realtime server:** Socket.IO service for configuration update events.
- **Database:** PostgreSQL is the primary persistent data store.
- **Cache:** Redis is the shared cache service.
- **Infrastructure:** Docker Compose orchestrates all local development services.

The system boundaries, ownership rules, and initial contracts are documented in [architecture.md](architecture.md).

## 3. Implemented the backend baseline

Created the initial API service in `backend/`:

- `package.json` with Express, PostgreSQL, Redis, CORS, and dotenv dependencies.
- Environment validation for `DATABASE_URL`, Redis URL, API port, and browser origin.
- Express application factory with CORS and JSON request handling.
- `GET /health` endpoint returning service health.
- PostgreSQL connection check during startup.
- Redis client connection during startup.
- Graceful shutdown logic for database and cache connections.
- Initial Prisma data model containing `Vehicle` and `Configuration`.

## 4. Implemented the realtime server baseline

Created the Socket.IO service in `server/`:

- Node.js package configuration with Socket.IO and dotenv.
- Cross-origin configuration for the frontend.
- `session:ready` event sent when a client connects.
- `configuration:updated` event broadcast to collaborating clients.

## 5. Implemented the frontend baseline

Created the React/Vite designer application in `frontend/`:

- Vite and React configuration.
- Responsive vehicle designer workspace.
- Babylon.js engine, scene, camera, ambient lighting, canvas resizing, and disposal lifecycle.
- Zustand store for the selected vehicle.
- Basic vehicle selection control and configuration panel.
- Production build configuration and styles.

The frontend currently provides the visual application shell; it does not yet load a vehicle GLB model or call the backend catalog API.

## 6. Updated local infrastructure

Updated Docker Compose to provide a complete local environment:

- PostgreSQL 16 with persistent data volume and health check.
- Redis 7 with health check.
- Backend service on port `4000`.
- Realtime server service on port `5000`.
- Frontend service on port `5173`.
- Service dependency ordering based on health checks.
- Environment values for PostgreSQL, Redis, ports, and the browser origin.

## 7. Installed and verified the local runtime

- Installed **Node.js LTS 24.19.0**.
- Installed npm dependencies for the backend, realtime server, and frontend.
- Generated package lockfiles for reproducible installs.
- Verified Node.js syntax for backend and realtime server source files.
- Built the frontend successfully, producing `frontend/dist/`.
- Started the Docker Compose stack.
- Verified `http://localhost:4000/health` returns an OK service response.
- Verified the frontend at `http://localhost:5173` returns HTTP 200.

> Note: PowerShell execution policy blocks `npm.ps1` in this environment. Use `npm.cmd` from PowerShell instead of changing the system execution policy.

## 8. Published the foundation to GitHub

Configured the repository-local commit identity based on the latest existing project commit and published the scaffold.

- **Branch:** `main`
- **Commit:** `2a9976b` — `feat: scaffold Carsport design platform`
- **GitHub repository:** `EK-TOP/CarsportDesignTool`

Remote verification confirmed GitHub `main` points to commit `2a9976b2a06e68b6897e77771f12edddb2858fa5`.

## Current project capabilities

The project can now:

1. Start PostgreSQL and Redis locally through Docker Compose.
2. Start an Express API and report its health.
3. Start a Socket.IO realtime service and exchange configuration update events.
4. Serve a React vehicle-designer shell.
5. Render an interactive Babylon.js scene with camera controls.
6. Persist the initial data model design through a Prisma schema.
7. Return active catalog vehicles and individual vehicle details from the API.
8. Seed a Demo Sport vehicle with compatible parts and a material.
9. Load the vehicle selector from the live catalog API.

## Not yet implemented

The following were intentionally not implemented in the foundation phase:

- Authentication and authorization.
- Real GLB/glTF vehicle loading.
- Anchor, zone, free-placement, snapping, and collision logic.
- Rule evaluation and configuration validation.
- Pricing calculation, promotions, discounts, quotations, and currency handling.
- Configuration persistence and API/frontend integration.
- Automated tests, CI/CD workflow, monitoring, backups, and production Nginx configuration.

## Permission-gated next steps

No step below will be started until approval is given.

### Step 1 — Establish the database and catalog domain

- **Completed:** Added Prisma Client and CLI tooling to the backend.
- **Completed:** Added and applied the initial PostgreSQL migration for vehicle, part, material, asset, vehicle-part, and configuration entities.
- **Completed:** Seeded `Demo Sport`, two compatible parts, and `Racing Red` material.
- **Completed:** Added `GET /api/vehicles` and `GET /api/vehicles/:vehicleId` catalog endpoints with Redis-cached vehicle listing.
- **Completed:** Connected the frontend selector to the catalog API, including loading and error states.
- **Verified:** Two HTTP integration tests passed against the seeded API: Demo Sport is listed and returns two compatible parts.

**Result:** A user can select a real demo vehicle returned by the backend.

## 9. Pre-Step 2 hardening

The following audit fixes were completed before 3D asset loading begins:

- Standardized PostgreSQL access on Prisma only; the redundant raw `pg` client was removed.
- Added explicit PostgreSQL and Redis connection timeouts and guarded backend startup/shutdown.
- Made catalog-cache read, write, and invalidation errors non-fatal; PostgreSQL remains the source of truth.
- Added a database constraint requiring every asset to belong to exactly one vehicle or part.
- Added automatic migration and idempotent seed jobs to Docker Compose before the backend starts.
- Restricted development service port bindings to `127.0.0.1`.
- Added route identifier validation, catalog retry UI, and a WebGL viewer fallback message.
- Added a disabled-by-default realtime feature gate, event payload validation, graceful shutdown, and retained commented configuration for future persisted collaboration.
- Added frontend ESLint configuration and a GitHub Actions workflow for frontend lint/build plus Docker-backed catalog integration tests.

**Verified:** PostgreSQL applied the asset-owner migration. The running API returned Demo Sport with two compatible parts and EUR pricing; `/health` and the frontend both responded successfully.

### Step 2 — Load a vehicle in the 3D designer

- **Implemented:** Added an idempotently seeded GLB model asset for Demo Sport.
- **Corrected:** Replaced an obsolete GLB sample URL that returned HTTP 404; reseeding now repairs existing catalog data with the verified CORS-enabled replacement.
- **Corrected:** Passed the Babylon `SceneLoader.LoadAssetContainerAsync` arguments in the installed API order: empty root URL, model URI, then scene.
- **Corrected:** Stream the trusted external GLB through a validated local backend endpoint, eliminating the browser's direct dependency on the external model host.
- **Implemented:** Load selected vehicle details through the catalog API and pass them to the Babylon.js viewer.
- **Implemented:** Load a GLB asset container, dispose the previous selection, and show loading, empty, and asset-error states.
- **Implemented:** Added Front, Side, and Top camera preset controls.
- **Verified:** The model-asset API integration tests pass; frontend lint and production build pass from a clean dependency installation.
- **Verified:** Manual Firefox browser testing confirmed the Demo Sport base model loads properly in the central designer canvas.

**Expected result:** The selected catalog vehicle appears in the interactive 3D viewer.

### Step 3 — Implement the configuration and rule foundations

- **Completed:** Added persistent vehicle placement anchors and exclusive placement zones.
- **Completed:** Seeded Demo Sport rear-aerodynamics and wheel-fitment placement rules.
- **Completed:** Added compatible-part selection and configuration saving in the frontend.
- **Completed:** Added backend configuration persistence and structured `valid`, `warnings`, and `errors` validation responses.
- **Verified:** Backend integration tests pass `5/5`; frontend lint passes; manual browser testing confirmed the **Configuration is valid** result appears after saving compatible options.

**Expected result:** Users can configure compatible components and receive validation feedback.

### Step 4 — Add pricing and quotations

- Add base-price and component-price calculation.
- Implement a price breakdown API and frontend summary.
- Add discounts, campaigns, and formula extension points.
- Generate quotation objects.

**Expected result:** A valid configuration displays an accurate, itemized price.

### Step 5 — Harden and deploy

- Add authentication, tests, CI/CD, environment separation, Nginx, monitoring, and backups.
- Add production Docker image optimizations.

**Expected result:** The product is ready for controlled deployment.

## Approval protocol

Reply with the step to begin, for example: **“Approve Step 1.”**

After approval, only that step will be implemented, tested, documented, committed, and pushed before requesting permission for the following step.
