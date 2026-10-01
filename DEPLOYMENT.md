# Deployment

## Render API

1. Push the repository to a Git provider and create a Render Blueprint from `render.yaml`.
2. Create a MongoDB database (for example, MongoDB Atlas) and set `MONGODB_URI` on the Render service.
3. Set `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT` (the service-account JSON as a single-line secret), and `CORS_ORIGINS` (the Firebase Hosting origin, without a trailing slash).
4. Create a session state file locally for each platform you plan to run:

   ```sh
   cd automation && npm ci
   npm run session:export -- linkedin
   npm run session:export -- instagram
   npm run session:export -- naukri
   ```

   In each opened browser, log in and complete any verification, return to the terminal, and press Enter. In Render, set each corresponding secret (`LINKEDIN_STORAGE_STATE`, `INSTAGRAM_STORAGE_STATE`, `NAUKRI_STORAGE_STATE`) to the full contents of its generated JSON file. Never commit or share these files; they contain active login cookies. Render loads the state into an initially empty profile, then the persistent disk retains browser changes. Re-export and update the Render secret if a session expires.
5. Deploy and verify `https://<render-service>.onrender.com/health` returns `{"status":"ok",...}`.

The Render service uses the Dockerfile's Playwright image and a persistent disk for browser profiles. Production automation runs headless. An expired session will fail its login check; there is no interactive browser on Render. Do not copy a browser profile or service-account key into the repository or Docker image.

## Firebase Hosting

1. Configure the Firebase web-app values from Firebase Console in `frontend/.env.production.local`, including `VITE_API_URL=https://<render-service>.onrender.com`.
2. Add the Firebase Hosting domain to Firebase Authentication's authorized domains.
3. Build and deploy Hosting from the repository root:

   ```sh
   cd frontend && npm ci && npm run build
   cd .. && npx firebase-tools deploy --only hosting --project <firebase-project-id>
   ```

`firebase.json` serves `frontend/dist` and rewrites client-side routes to `index.html`. The backend CORS allowlist must contain the exact deployed Hosting origin.

## Local Development

Leave `VITE_API_URL` unset to use the Vite `/api` proxy to `http://localhost:3001`. The backend listens on `PORT` when provided and otherwise uses port 3001.