import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
    private app: admin.app.App;

    constructor() {
        // Initialize Firebase Admin SDK
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : null;

        const projectId = process.env.FIREBASE_PROJECT_ID || 'hiteshkumarportfolio';

        if (serviceAccount) {
            this.app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            // Use service account file path
            this.app = admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        } else {
            // For development without credentials, use project ID only
            // Note: This won't verify tokens properly in production!
            this.app = admin.initializeApp({
                projectId: projectId,
            });
        }
    }

    /**
     * Verify Firebase ID token
     * @param idToken - Firebase ID token from client
     * @returns Decoded token with user information
     */
    async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            return decodedToken;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    /**
     * Get user by Firebase UID
     * @param uid - Firebase user ID
     * @returns Firebase user record
     */
    async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
        try {
            return await admin.auth().getUser(uid);
        } catch (error) {
            throw new UnauthorizedException('User not found');
        }
    }

    /**
     * Create custom token for a user
     * @param uid - Firebase user ID
     * @returns Custom token
     */
    async createCustomToken(uid: string): Promise<string> {
        return await admin.auth().createCustomToken(uid);
    }

    /**
     * Delete a user from Firebase Auth
     * @param uid - Firebase user ID
     */
    async deleteUser(uid: string): Promise<void> {
        await admin.auth().deleteUser(uid);
    }
}
