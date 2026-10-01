import * as admin from 'firebase-admin';
export declare class FirebaseService {
    private app;
    constructor();
    verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken>;
    getUserByUid(uid: string): Promise<admin.auth.UserRecord>;
    createCustomToken(uid: string): Promise<string>;
    deleteUser(uid: string): Promise<void>;
}
