# Deployment and Local Development

## Render API

1. Create a Render Blueprint from the repository-root `render.yaml`.
2. Configure `MONGODB_URI`, `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT`, and `CORS_ORIGINS` as Render secrets/environment variables. `CORS_ORIGINS` must contain the exact Firebase Hosting origin. Set `EXTENSION_ORIGIN` to the exact `chrome-extension://<id>` origin shown by Chrome after loading/signing the extension; this changes when an unpacked extension gets a different ID.
3. For recruiter post extraction, optionally set `RECRUITER_ALLOWED_DOMAINS` to a comma-separated allowlist of public HTTPS source domains. URL fetching is disabled if empty and always excludes LinkedIn. The extractor uses a separate unauthenticated Playwright browser, blocks non-HTTPS/out-of-allowlist requests and private-address DNS results, and does not bypass access restrictions. The API Docker image installs the matching Playwright Chromium; pasted text/CSV extraction does not require browser access.
4. Deploy and check `https://<render-service>.onrender.com/health`.

The Render service hosts the API only. Do not configure browser profiles or export/upload LinkedIn, Naukri, Instagram, or other site cookies to Render. Users can choose either the existing local browser agent or the Chrome extension. The extension only assists a user-selected current tab, reads JobPosting metadata on demand, prepares supported fields after another explicit click, and never submits an application. It does not bypass CAPTCHA/MFA or anti-bot controls. Naukri-specific automation is not enabled; the extension currently supports only generic pages exposing valid JobPosting JSON-LD.

## Firebase Hosting

1. Configure the Firebase web-app values in `frontend/.env.production.local`, including `VITE_API_URL=https://<render-service>.onrender.com`.
2. Add the Firebase Hosting domain to Firebase Authentication's authorized domains and enable the Google provider in Firebase Console.
3. Build and deploy:

   ```sh
   cd frontend && npm ci && npm run build
   cd .. && npx firebase-tools deploy --only hosting --project <firebase-project-id>
   ```

`firebase.json` serves `frontend/dist` and rewrites client routes to `index.html`. A production Google login cannot be verified without the corresponding Firebase project configuration.

## Local API and Frontend

1. Configure MongoDB and Firebase Admin values in `backend/backend/.env` using the names in `.env.example`. Do not overwrite an existing `.env`.
2. Start the API:

   ```sh
   cd backend/backend
   npm ci
   npm run start:dev
   ```

   The local API listens on port 3000 by default. Set `PORT` to override it.
3. In another terminal:

   ```sh
   cd frontend
   npm ci
   npm run dev
   ```

   The Vite `/api` proxy forwards to `http://localhost:3000`.

## Visible Local LinkedIn Runner

1. Sign in to the app and use **Generate pairing code** on the dashboard.
2. In a terminal from the repository root, install the runner and Chromium:

   ```sh
   cd backend/automation
   npm ci
   npx playwright install chromium
   cd ../../companion
   npm ci
   npm run dev -- --api <api-url>
   ```

   For local development, use `http://localhost:3000`; for deployment, use the Render API base URL. Enter the one-time code from the dashboard when prompted.
3. The companion starts the local runner, which opens a visible browser on that computer. Enter the one-time code when prompted and sign in to LinkedIn there. The login profile remains on that computer under `~/.job-applyer/browser-profile`; it is not sent to the API.
4. Queue the LinkedIn run from the dashboard. Keep the runner terminal/browser open to receive progress and pause/stop controls.

Pairing codes expire after 10 minutes. The local runner polls the API over HTTPS for deployed use. The companion is a command-line wrapper, not a packaged desktop installer. Naukri/Instagram server-side browser endpoints are not enabled.

### Local runner heartbeat troubleshooting

If the runner repeatedly prints `Heartbeat failed: Cannot GET /automation/local-runner/heartbeat`, stop that runner with `Ctrl+C` and restart it after updating `backend/automation`. The heartbeat endpoint is a `POST`; older local-runner builds accidentally sent `GET`. The corrected runner sends `POST` explicitly. The backend route is `POST /automation/local-runner/heartbeat`.

## Chrome extension (alternative user-controlled mode)

1. Build the unpacked Manifest V3 extension (the extension directory installs its own TypeScript compiler):

   ```sh
   cd chrome-extension
   npm ci
   npm run build
   npm test
   ```

   The loadable directory is `chrome-extension/dist`. Production defaults to `https://job-applyer-api.onrender.com`; override with `JOB_APPLYER_API_URL=https://<your-render-host> npm run build`. Set `JOB_APPLYER_DASHBOARD_ORIGIN=https://<your-firebase-domain>` while building to inject the dashboard bridge and grant that exact dashboard origin. Production builds without that value support manual popup pairing only. For local development run `npm run build:dev` (localhost API/dashboard), or override with `JOB_APPLYER_API_URL=http://localhost:3000 npm run build`. The build requests only the configured API/dashboard hosts, plus `activeTab`, `scripting`, `storage`, `alarms`, and the `windows` permission needed to open a visible Chrome window.
2. In Chrome, open `chrome://extensions`, enable Developer mode, and choose **Load unpacked**. Select `chrome-extension/dist`. Record the extension ID and configure the exact `EXTENSION_ORIGIN=chrome-extension://<id>` in Render. Set `CORS_ORIGINS` to the exact Firebase Hosting origin(s). Reload the extension after deployment/CORS configuration.
3. Sign in to the dashboard and click **Pair extension**. When built with the exact dashboard origin, pairing can be sent through the dashboard bridge; otherwise enter the one-time code in the popup. Codes expire in 10 minutes; tokens expire in 30 days and can be revoked from the dashboard or popup.
4. For recruiter capture, enter a permitted HTTPS source page in the extension popup and click **Start Automation**. Chrome opens a visible window. Select one post's text manually and click **Capture selected post**; the extension sends only the selected text and source URL. The shared backend extracts/saves the post and emits persisted dashboard events. There is no automated scrolling, bulk-reading, form submission, CAPTCHA/MFA handling, cookie access, or password collection. Only use sources whose current terms permit this user-selected capture workflow.
5. The existing job-application form assistance remains available separately: open a supported job page, click **Prepare current job**, then **Prepare form fields** to fill supported visible fields using an allow-listed profile subset. Check every value and submit manually. Report a confirmed or uncertain outcome in the dashboard; confirmation creates the application-history record.

See [`chrome-extension/README.md`](./chrome-extension/README.md) for the reproducible local Chrome smoke test, service-worker recovery steps, and exact production configuration.

The extension does not request all-sites access, read cookies, submit forms, operate LinkedIn/Naukri selectors, or automate CAPTCHA/MFA. Platform-specific adapters require a separate policy review. The extension pairing/task Mongo indexes are created by Mongoose; validate unique indexes against existing data before deploying to a populated database.

## Recruiter post extraction

The dashboard exposes **Recruiter Post Extract** as a distinct page and quick action. It is separate from the existing **Start local LinkedIn run** / application-assistance flow. Paste LinkedIn post text manually; LinkedIn pages are never fetched automatically. Public URL extraction requires an exact configured `RECRUITER_ALLOWED_DOMAINS` allowlist and matching Playwright Chromium browser installation. CSV files need a `post_text`, `text`, `content`, `description`, `url`, or `source_url` column. Extracted leads are owner-scoped, saved for manual review, and never trigger outreach.

The API persists discovery queue inputs and run/activity records in MongoDB and retries queued work after an API restart. This is an in-process worker (not a separately scaled queue); use a durable external queue before running multiple API replicas. Activity logs are retained for 90 days.

Gmail OAuth, secure resume storage/attachment, and draft creation are not configured or implemented. The recruiter page does not mark outreach sent or display a fake Gmail success state; manual email outreach remains outside this workflow.

## MongoDB Atlas

Use a dedicated least-privilege database user, restrict network access to the API deployment, and retain Atlas backups. MongoDB schema indexes are created by Mongoose; production index rollout and restore procedures still need an environment-specific verification.
