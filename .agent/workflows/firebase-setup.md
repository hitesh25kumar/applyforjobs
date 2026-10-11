---
description: Quick setup guide for Firebase authentication
---

# Firebase Setup Guide

## Backend Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the wizard
3. Enable Google Analytics (optional)

### 2. Generate Service Account Key
1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click "Generate new private key"
3. Save the JSON file securely

### 3. Configure Backend Environment
Option A - Use file path:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

Option B - Inline JSON (production):
```bash
cp backend/.env.example backend/.env
# Edit .env and paste the entire service account JSON into FIREBASE_SERVICE_ACCOUNT
```

### 4. Install Dependencies
```bash
cd backend
npm install firebase-admin
```

## Frontend Setup

### 1. Add Web App to Firebase
1. In Firebase Console, go to **Project Settings** > **General**
2. Scroll to "Your apps" and click **Web** icon ( </> )
3. Register app with a nickname
4. Copy the `firebaseConfig` object

### 2. Enable Authentication Methods
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Google** provider
3. Enable **Email/Password** provider

### 3. Configure Frontend Environment
```bash
cp frontend/.env.example frontend/.env
# Edit .env and paste Firebase config values
```

### 4. Install Dependencies
```bash
cd frontend
npm install firebase react-router-dom
```

## Testing

### Backend
```bash
cd backend
npm run start:dev
```

Test auth endpoint:
```bash
curl http://localhost:3000/auth/status
# Should return 401 Unauthorized (expected without token)
```

### Frontend
```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5173/login` and test:
- Google OAuth login
- Email/password signup
- Email/password login

## Production Deployment

### Backend
- Set `FIREBASE_SERVICE_ACCOUNT` as environment variable (base64 encoded recommended)
- Ensure `FRONTEND_URL` is set for CORS

### Frontend
- Set all `VITE_FIREBASE_*` environment variables
- Set `VITE_API_URL` to production backend URL

## Troubleshooting

**Error: "Firebase service account not found"**
- Check `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Or ensure `FIREBASE_SERVICE_ACCOUNT` is valid JSON

**Error: "CORS policy blocked"**
- Add frontend URL to backend CORS whitelist in `main.ts`

**Error: "Firebase config is not defined"**
- Check all `VITE_FIREBASE_*` variables are set in frontend `.env`
