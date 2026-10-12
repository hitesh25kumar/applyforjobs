# Job Applyer Chrome extension

This is a Manifest V3 extension for user-controlled recruiter-post capture and the existing job-form preparation flow. Recruiter capture requires the user to select one post's text in a visible tab and click **Capture selected post**. The extension does not search pages, scroll, bulk-read post cards, submit forms, read cookies/passwords, or handle CAPTCHA/MFA. Use it only on sources and with content your use is permitted to process under the source site's terms.

## Build and test locally

Requirements: Node.js/npm and Google Chrome.

```sh
cd chrome-extension
npm ci
npm test
npm run build:dev
```

The loadable unpacked extension is `chrome-extension/dist` (relative to the repository root). The automated visible-window test mocks `chrome.windows.create`; use the manual smoke test below to verify the actual Chrome UI on your machine.

## Local Chrome smoke test

1. Start the backend at `http://localhost:3000` with its normal local MongoDB and Firebase configuration, and start the frontend at `http://localhost:5173`. Sign in to the dashboard with a Firebase user whose profile is set up.
2. Open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select `chrome-extension/dist`. For a code update, select **Reload** on the extension.
3. On the signed-in dashboard, use **Pair extension**. Development builds include the localhost dashboard bridge, so pairing completes from the dashboard when the extension is loaded. If pairing is not detected, copy the one-time code to the extension popup; it is valid for 10 minutes. Verify the popup reports **connected**.
4. Click the extension icon. Enter an HTTPS page URL that you are permitted to use, then click **Start Automation**. Verify that Chrome opens a separate, focused, visible browser window at that URL. This starts an owner-scoped run in the API.
5. In the visible page, manually select only the text of one hiring post. Click the extension icon again and choose **Capture selected post**. The extension sends only the selected text and that tab's URL over HTTPS to the paired API. The existing backend extraction code identifies all explicit valid email addresses and saves the post in the existing MongoDB-backed recruiter leads.
6. In the dashboard, open **Recruiter Discovery**. Verify the extension run, persisted activity, counters, and saved post appear. Posts without email are still saved and labeled **Email missing**. Re-capturing a post exercises duplicate handling. Click **Finish recruiter run** when done.
7. To check worker recovery, open `chrome://extensions`, use the extension's service-worker inspection controls to stop/restart its worker, reopen the popup, and verify pairing/run state remains available. The token and active run ID are stored in `chrome.storage.local`; a revoked/expired token must be paired again.

If the API is unavailable during capture, the popup shows the API error and retains the active run so you can retry after restoring connectivity. The backend uses the normalized source URL/source key to refresh an existing lead rather than silently counting an unmatched database conflict as a duplicate. A Dashboard stop action ends the persisted extension run as well.

## Production build and configuration

Build against the exact deployed origins. Do not commit secrets or production credentials:

```sh
cd chrome-extension
JOB_APPLYER_API_URL=https://<your-render-api-host> \
JOB_APPLYER_DASHBOARD_ORIGIN=https://<your-firebase-hosting-domain> \
npm run build
```

The production build output is `chrome-extension/dist`. It contains only the configured API host and exact dashboard origin in the generated host permissions/content-script matches; it does not request all-sites, cookie, or password permissions. If no dashboard origin is configured, the manual one-time pairing-code flow in the popup remains available, but dashboard auto-pairing is not injected.

For the deployed backend:

1. Load the unpacked build in Chrome and copy the extension ID shown on `chrome://extensions`.
2. Set Render `EXTENSION_ORIGIN` to the exact `chrome-extension://<extension-id>` origin. Set `CORS_ORIGINS` to the exact Firebase Hosting origin(s) serving the dashboard; preserve any other required exact frontend origins.
3. Rebuild with the exact API/dashboard URLs above, reload the unpacked extension, sign in to the dashboard, and pair it. If Chrome assigns a different extension ID, update `EXTENSION_ORIGIN` and reload/redeploy the backend configuration.
4. Confirm the Render API can connect to the existing MongoDB Atlas database and that the current recruiter lead/run/activity indexes have been applied. No new MongoDB URI, collection, or database is introduced by extension capture.

The Render/Firebase/Atlas deployment values and a real authenticated production round-trip must be verified in the operator's deployment environment; they are not embedded in this repository.
