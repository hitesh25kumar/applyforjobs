import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    type User,
} from 'firebase/auth';
import { firebaseConfig } from './config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Authentication helper functions
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const signInWithEmail = async (email: string, password: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const signUpWithEmail = async (email: string, password: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const resetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getCurrentUser = (): Promise<User | null> => {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });
};
