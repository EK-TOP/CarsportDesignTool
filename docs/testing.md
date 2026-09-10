# Carsport Test Record

This file is the permanent verification record for Carsport. Every future test, build check, API check, migration check, browser validation, or deployment verification must be added here when it is performed.

## Recording rules

For every verification, record:

1. **Date** and implementation phase.
2. **Purpose** — what behavior is being verified.
3. **Environment** — local Node.js, Docker Compose, CI, browser, or production-like environment.
4. **Method** — command, endpoint, test suite, or manual steps.
5. **Expected result**.
6. **Actual result**.
7. **Outcome** — pass, fail, blocked, or not run.
8. **Related change** — commit identifier when available.

Never mark a feature as working unless this document contains fresh passing verification evidence for it.

## Test environment

| Area | Current toolchain |
| --- | --- |
| Runtime | Node.js LTS 24.19.0 installed locally; Node.js 20 in Docker images |
| Database | PostgreSQL 16 in Docker Compose |
| Cache | Redis 7 in Docker Compose |
| API | Express backend on `http://localhost:4000` |
| Frontend | React/Vite on `http://localhost:5173` |
| Realtime | Socket.IO on `http://localhost:5000`, disabled by default |
| CI | GitHub Actions workflow in `.github/workflows/verify.yml` |

## Completed verification record

### Foundation runtime validation

- **Date:** 2026-09-10
- **Phase:** Foundation setup
- **Purpose:** Confirm that the initial Docker stack runs and serves its basic application endpoints.
- **Environment:** Local Docker Compose.
- **Method:** Started the stack with Docker Compose; requested `GET http://localhost:4000/health`; requested `http://localhost:5173`.
- **Expected result:** Backend health endpoint returns success and frontend returns HTTP 200.
- **Actual result:** Health response was `{"status":"ok","service":"carsport-backend"}`. Frontend returned HTTP 200.
- **Outcome:** **Pass**.
- **Related change:** `2a9976b`.

### Catalog API integration tests

- **Date:** 2026-09-10
- **Phase:** Step 1 — database and catalog domain
- **Purpose:** Confirm that PostgreSQL-seeded catalog data is returned by the running API.
- **Environment:** Local Docker Compose with PostgreSQL, Redis, backend, and seeded Demo Sport catalog.
- **Method:** Ran `node --test backend/test/catalog.integration.test.js` against `http://localhost:4000`.
- **Expected result:** Demo Sport appears in the vehicle list and its detail response contains two compatible parts.
- **Actual result:** `2` tests passed and `0` failed.
- **Outcome:** **Pass**.
- **Related change:** `1d6314e`.

### Database migration validation

- **Date:** 2026-09-10
- **Phase:** Pre-Step 2 hardening
- **Purpose:** Verify the PostgreSQL asset ownership constraint migration applies successfully.
- **Environment:** Local Docker Compose PostgreSQL database.
- **Method:** Ran the Compose migration service with `prisma migrate deploy`.
- **Expected result:** `20260910130000_enforce_asset_owner` is applied successfully.
- **Actual result:** Prisma reported all migrations applied successfully, including `20260910130000_enforce_asset_owner`.
- **Outcome:** **Pass**.
- **Related change:** `b5d891e`.

### Hardened catalog contract check

- **Date:** 2026-09-10
- **Phase:** Pre-Step 2 hardening
- **Purpose:** Confirm the backend still serves catalog data after Prisma-only database access and startup changes.
- **Environment:** Local Docker Compose.
- **Method:** Requested `GET /api/vehicles`, selected the `DEMO-SPORT-01` result, then requested `GET /api/vehicles/:vehicleId`.
- **Expected result:** Demo Sport is returned with two compatible parts and EUR currency.
- **Actual result:** Vehicle `Demo Sport`, `2` compatible parts, and `EUR` were returned.
- **Outcome:** **Pass**.
- **Related change:** `b5d891e`.

### Step 2 model asset contract check

- **Date:** 2026-09-10
- **Phase:** Step 2 — 3D vehicle loading
- **Purpose:** Verify the selected vehicle detail API exposes GLB model metadata to the frontend.
- **Environment:** Local Docker Compose after the idempotent seed job completed.
- **Method:** Requested the Demo Sport vehicle detail and inspected its `assets` collection.
- **Expected result:** One asset has `type: "model"`, MIME type `model/gltf-binary`, and a `.glb` URI.
- **Actual result:** The API returned the Buggy GLB asset URI from the Khronos glTF Sample Assets repository with the expected model MIME type.
- **Outcome:** **Pass**.
- **Related change:** Step 2 work in progress; not committed at the time of this entry.

### Step 2 model URL availability correction

- **Date:** 2026-09-10
- **Phase:** Step 2 — 3D vehicle loading.
- **Purpose:** Diagnose the viewer's model-load error reported after selecting Demo Sport.
- **Environment:** Local Docker Compose backend container and the public model host.
- **Method:** Requested the seeded GLB URL with `wget`, then tested the replacement Khronos GLB URL and reseeded the catalog.
- **Expected result:** The model URL returns a browser-loadable response.
- **Actual result:** The original `glTF-Sample-Assets` URL returned HTTP `404`, explaining the browser error. The replacement `glTF-Sample-Models` URL returned HTTP `200`, has a 7,885,636-byte response, and includes `Access-Control-Allow-Origin: *`. The idempotent seed now updates existing model records and created records alike. After reseeding, the catalog integration suite passed `2/2` and asserted the replacement URL returned by the API.
- **Outcome:** **Pass** (root cause corrected).
- **Related change:** Step 2 work in progress; not committed at the time of this entry.

### Step 2 Babylon loader API correction

- **Date:** 2026-09-10
- **Phase:** Step 2 — 3D vehicle loading.
- **Purpose:** Diagnose the remaining vehicle-model load error after correcting the model URL.
- **Environment:** Local Docker Compose frontend container with Babylon.js `7.54.3` resolved from the application lockfile.
- **Method:** Reproduced `SceneLoader.LoadAssetContainerAsync` execution with Babylon's `NullEngine`, then compared the thrown argument-type error to the viewer call.
- **Expected result:** The loader receives the Babylon scene and GLB source in its installed-version API order.
- **Actual result:** The viewer initially passed `(modelUri, scene)`, causing Babylon to treat the scene object as a string source and throw `sceneSource.startsWith is not a function`. The temporary headless probe established that the loaded Babylon version uses separate root URL, filename, and scene parameters. The final browser error confirmed that `(scene, modelUri)` instead generated a `[object Object]` URL. The production call was corrected to `('', modelUri, scene)`; the temporary headless probe was removed because Node does not provide browser `XMLHttpRequest` transport.
- **Outcome:** **Pass** (root cause corrected).
- **Related change:** Step 2 work in progress; not committed at the time of this entry.

### Step 2 corrected viewer build

- **Date:** 2026-09-10
- **Phase:** Step 2 — 3D vehicle loading.
- **Purpose:** Verify the viewer compiles after the Babylon loader API correction.
- **Environment:** Local Docker Compose one-off frontend container using `npm ci`.
- **Method:** Ran `npm ci && npm run lint && npm run build`.
- **Expected result:** Linting and the production build both complete successfully.
- **Actual result:** ESLint completed without findings. Vite transformed `2,000` modules and built successfully in `54.32s`; it emitted only the existing non-blocking Babylon.js chunk-size advisory.
- **Outcome:** **Pass**.
- **Related change:** Step 2 work in progress; not committed at the time of this entry.

### Step 2 local model delivery

- **Date:** 2026-09-10
- **Phase:** Step 2 — 3D vehicle loading.
- **Purpose:** Prevent browser access to the external model host from blocking vehicle rendering.
- **Environment:** Local Docker Compose backend and frontend services.
- **Method:** Added `GET /api/assets/:assetId/model.glb`, which validates the asset ID and trusted HTTPS source, then streams the GLB through the local backend. Restarted backend and frontend development services. Ran the catalog integration suite and a clean frontend lint/build verification.
- **Expected result:** The browser can request a local `.glb` endpoint with the GLB MIME type; integration, lint, and build checks pass.
- **Actual result:** The first API test returned `404` because the backend watcher did not detect the Windows bind-mounted router change. After restarting the backend, all `3` integration tests passed, including the endpoint response (`200`, `model/gltf-binary`). The frontend was restarted, then `npm ci && npm run lint && npm run build` passed; Vite completed in `46.27s` with only the existing non-blocking Babylon.js chunk-size advisory.
- **Outcome:** **Pass** (after development-service restart).
- **Related change:** Step 2 work in progress; not committed at the time of this entry.

### Step 2 frontend dependency refresh

- **Date:** 2026-09-10
- **Phase:** Step 2 — 3D vehicle loading.
- **Purpose:** Resolve Vite's failure to import the newly declared `prop-types` package from the running development container.
- **Environment:** Local Docker Compose frontend service.
- **Method:** Recreated the frontend service with renewed anonymous volumes, then rebuilt its Docker image and recreated it again with `--build --force-recreate --renew-anon-volumes`. Confirmed the active container dependency tree with `npm ls prop-types`.
- **Expected result:** The active frontend container resolves `prop-types` and Vite can compile `VehicleViewer.jsx`.
- **Actual result:** A restart alone retained an image built before the dependency was added. Rebuilding installed `269` packages; the active container reports direct `prop-types@15.8.1` plus the deduplicated dependency used by `eslint-plugin-react`.
- **Outcome:** **Pass**.
- **Related change:** Step 2 work in progress; not committed at the time of this entry.

### Step 2 complete local GLB payload validation

- **Date:** 2026-09-10
- **Phase:** Step 2 — 3D vehicle loading.
- **Purpose:** Verify that the local model endpoint streams a complete and valid binary glTF payload, not only successful response headers.
- **Environment:** Local Docker Compose backend service.
- **Method:** Ran the catalog integration test and fully read the streamed model response. The test validates non-empty content and the binary glTF magic bytes `67 6c 54 46` (`glTF`).
- **Expected result:** The endpoint returns a complete valid GLB response for the selected vehicle.
- **Actual result:** All `3` integration tests passed. The model endpoint streamed the full payload successfully and its first four bytes matched the GLB signature.
- **Outcome:** **Pass**.
- **Related change:** Step 2 work in progress; not committed at the time of this entry.

### Step 2 runtime health and loader diagnostics

- **Date:** 2026-09-10
- **Phase:** Step 2 — 3D vehicle loading.
- **Purpose:** Check whether browser network entries indicated a backend outage and make any remaining browser-only load rejection observable.
- **Environment:** Local Docker Compose backend and frontend services.
- **Method:** Requested the backend health endpoint from its running container, inspected backend startup logs, restarted the frontend, and ran its active-container lint command after adding loader-error logging.
- **Expected result:** Backend is healthy, no backend startup error is present, and the viewer diagnostic code passes linting.
- **Actual result:** `/health` returned `{"status":"ok","service":"carsport-backend"}` and the backend log reported `Carsport API listening on port 4000`. The favicon HTTP 404 reported by the browser was unrelated. The first lint run correctly identified an undeclared `console` browser global; after declaring it, the active frontend lint command passed without findings.
- **Outcome:** **Pass** (after lint configuration correction).
- **Related change:** Step 2 work in progress; not committed at the time of this entry.

### Step 2 final SceneLoader argument correction

- **Date:** 2026-09-10
- **Phase:** Step 2 — 3D vehicle loading.
- **Purpose:** Correct the precise Babylon loader API call identified from the browser's model-load error.
- **Environment:** Local Docker Compose frontend service and Firefox browser diagnostic output.
- **Method:** Interpreted the reported URL prefix `[object Object]` and GLB magic failure, then updated the call to `LoadAssetContainerAsync('', modelUri, scene)`. Restarted the frontend service and ran its active-container lint/build commands.
- **Expected result:** Babylon requests the local `/api/assets/:assetId/model.glb` endpoint without prepending an object value, and the frontend checks pass.
- **Actual result:** The browser had received HTML beginning with `<!do` because the previous call formed `[object Object]http://localhost:4000/...`; its little-endian numeric magic value was `1868833084`, not the expected GLB signature. The corrected call separates root URL, filename, and scene. Frontend lint passed and Vite built successfully in `53.16s`, with only the existing non-blocking Babylon.js chunk-size advisory.
- **Outcome:** **Pass**.
- **Related change:** Step 2 work in progress; not committed at the time of this entry.

### Step 2 frontend lint configuration correction

- **Date:** 2026-09-10
- **Phase:** Step 2 — 3D vehicle loading.
- **Purpose:** Validate JSX parsing and React source linting before publishing the vehicle viewer.
- **Environment:** Local Docker Compose one-off frontend container.
- **Method:** Ran `npm run lint` before and after configuring ESLint for JSX, React's automatic JSX runtime, and viewer prop validation.
- **Expected result:** ESLint parses all JSX files and reports no errors or warnings.
- **Actual result:** The initial attempt failed because JSX parsing was not configured. After JSX parsing was enabled, the React rules exposed legacy-runtime and prop-validation errors. The final configuration uses `eslint-plugin-react`, automatic JSX runtime rules, stable model URI dependencies, and `PropTypes`; `npm ci && npm run lint` completed with no output or findings from ESLint.
- **Outcome:** **Pass** (after configuration correction).
- **Related change:** Step 2 work in progress; not committed at the time of this entry.

### Step 2 frontend production build

- **Date:** 2026-09-10
- **Phase:** Step 2 — 3D vehicle loading.
- **Purpose:** Confirm the Babylon.js GLB loader, selected-vehicle detail flow, and viewer UI compile into a production bundle.
- **Environment:** Local Docker Compose one-off frontend container using a clean `npm ci` install.
- **Method:** Ran `npm ci && npm run lint && npm run build`.
- **Expected result:** Linting passes and Vite completes a production build.
- **Actual result:** ESLint completed without findings. Vite transformed `2,000` modules and built successfully in `29.45s`. Vite reported a non-blocking advisory that the Babylon.js JavaScript chunk is larger than `500 kB` after minification.
- **Outcome:** **Pass** (with non-blocking bundle-size advisory).
- **Related change:** Step 2 work in progress; not committed at the time of this entry.

### Step 2 catalog integration tests

- **Date:** 2026-09-10
- **Phase:** Step 2 — 3D vehicle loading.
- **Purpose:** Confirm the running API continues to serve the seeded vehicle and its GLB model asset contract.
- **Environment:** Local Docker Compose backend service.
- **Method:** Ran `node --test test/catalog.integration.test.js` inside the backend container.
- **Expected result:** Demo Sport appears in the catalog and its detail contains two compatible parts plus a `.glb` model asset.
- **Actual result:** `2` tests passed and `0` failed. The detail assertion confirmed a model asset with `type: "model"` and a `.glb` URI.
- **Outcome:** **Pass**.
- **Related change:** Step 2 work in progress; not committed at the time of this entry.

### Step 2 frontend behavior

- **Date:** 2026-09-10
- **Phase:** Step 2 — 3D vehicle loading.
- **Purpose:** Confirm the selected vehicle renders in the browser after the final model-delivery and Babylon loader corrections.
- **Environment:** Local Firefox browser at `http://localhost:5173` with the Docker Compose application stack running.
- **Method:** Refreshed the designer, selected **Demo Sport**, and observed the resulting viewer behavior.
- **Expected result:** The base vehicle GLB loads in the central canvas, with the selected vehicle’s configuration information shown in the right panel.
- **Actual result:** User confirmed the vehicle model works properly.
- **Outcome:** **Pass**.
- **Related change:** `0c52e36`.

### Step 3 configuration foundation

- **Date:** 2026-09-10
- **Phase:** Step 3 — configuration and rule foundations.
- **Purpose:** Verify persisted compatible-part configurations and structured placement validation.
- **Environment:** Local Docker Compose PostgreSQL, backend, and frontend services.
- **Method:** Applied the placement migration and seed data; ran `npm test` in the backend container and `npm run lint` in the frontend container.
- **Expected result:** Valid placements persist; invalid zones return structured errors; catalog/model tests remain intact; frontend lint passes.
- **Actual result:** All `5` backend tests passed, including valid configuration persistence and invalid-zone validation. Frontend lint completed without findings.
- **Outcome:** **Pass**.
- **Related change:** `fa44ec6`.

### Step 3 browser configuration save

- **Date:** 2026-09-10
- **Phase:** Step 3 — configuration and rule foundations.
- **Purpose:** Confirm the configuration UI displays the server validation result after saving selected compatible parts.
- **Environment:** Local browser with the Docker Compose application stack.
- **Method:** Selected compatible options in the designer and saved the configuration.
- **Expected result:** The UI presents a successful structured validation response when the selected parts use valid placement zones.
- **Actual result:** User confirmed the **Configuration is valid** message appeared after saving the options.
- **Outcome:** **Pass**.
- **Related change:** `fa44ec6`.

### Step 4 pricing and quotation foundation

- **Date:** 2026-09-10
- **Phase:** Step 4 — pricing and quotations.
- **Purpose:** Verify authoritative itemized quote creation for valid persisted configurations.
- **Environment:** Local Docker Compose PostgreSQL, backend, and frontend services.
- **Method:** Applied the quotation migration; ran the complete backend test suite and frontend lint/build checks.
- **Expected result:** A valid configuration produces an itemized EUR quote, with correct integer-cent totals; all checks pass.
- **Actual result:** All `6` backend tests passed, including a quote total of `4,728,900` cents for Demo Sport plus the rear spoiler. Frontend lint passed after correcting a viewer cleanup warning. Vite production build passed with only the existing non-blocking Babylon.js chunk-size advisory.
- **Outcome:** **Pass**.
- **Related change:** `651c332`.

### API hardening regression check

- **Date:** 2026-09-10
- **Phase:** Post-Step 4 hardening.
- **Purpose:** Confirm request-size limiting, shared validation, cache validation, and model-fetch timeout changes preserve application behavior.
- **Environment:** Local Docker Compose backend.
- **Method:** Ran `npm test` in the backend container.
- **Expected result:** Existing catalog, model delivery, configuration, and pricing behavior remains valid.
- **Actual result:** All `6` backend integration tests passed.
- **Outcome:** **Pass**.
- **Related change:** `d63c9f8`.

### Authentication foundation

- **Date:** 2026-09-10
- **Phase:** Step 5 authentication substep.
- **Purpose:** Verify user migration, registration-backed authenticated requests, and frontend account form static checks.
- **Environment:** Local Docker Compose PostgreSQL, backend, and frontend.
- **Method:** Rebuilt the stack, ran backend `npm test`, and frontend `npm run lint`.
- **Expected result:** Users authenticate through HTTP-only JWT cookies and protected configuration flows remain functional.
- **Actual result:** Migration completed; all `6` backend tests passed using a registered temporary user cookie. Frontend lint passed after declaring the browser `FormData` global.
- **Outcome:** **Pass**.
- **Related change:** `92ef72e`.

## Test entry template

### [Test name]

- **Date:** YYYY-MM-DD
- **Phase:** Foundation / Step number / Hotfix
- **Purpose:**
- **Environment:**
- **Method:**
- **Expected result:**
- **Actual result:**
- **Outcome:** Pass / Fail / Blocked / Not run
- **Related change:** Commit ID or pull request
