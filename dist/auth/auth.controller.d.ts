import { Request as ExpressRequest } from 'express';
import { Model } from 'mongoose';
import { ProfileDocument } from '../profile/schemas/profile.schema';
import { FirebaseService } from './firebase.service';
export declare class AuthController {
    private profileModel;
    private firebaseService;
    constructor(profileModel: Model<ProfileDocument>, firebaseService: FirebaseService);
    register(body: {
        firebaseUid: string;
        email: string;
        firstName?: string;
        lastName?: string;
        photoURL?: string;
    }): Promise<{
        profile: {
            id: import("mongoose").Types.ObjectId;
            firebaseUid: string;
            email: string;
            firstName: string;
            lastName: string;
            onboardingCompleted: boolean;
            onboardingStep: number;
        };
    }>;
    getCurrentUser(req: ExpressRequest & {
        user: any;
    }): Promise<{
        error: string;
        id?: undefined;
        firebaseUid?: undefined;
        email?: undefined;
        firstName?: undefined;
        lastName?: undefined;
        photoURL?: undefined;
        phone?: undefined;
        onboardingCompleted?: undefined;
        onboardingStep?: undefined;
        linkedinUrl?: undefined;
        portfolioUrl?: undefined;
        githubUrl?: undefined;
        resumePath?: undefined;
        resumeFileName?: undefined;
        linkedinEnabled?: undefined;
        naukriEnabled?: undefined;
        externalEnabled?: undefined;
        dailyApplyLimit?: undefined;
        preferredJobTitles?: undefined;
    } | {
        id: import("mongoose").Types.ObjectId;
        firebaseUid: string;
        email: string;
        firstName: string;
        lastName: string;
        photoURL: string;
        phone: string;
        onboardingCompleted: boolean;
        onboardingStep: number;
        linkedinUrl: string;
        portfolioUrl: string;
        githubUrl: string;
        resumePath: string;
        resumeFileName: string;
        linkedinEnabled: boolean;
        naukriEnabled: boolean;
        externalEnabled: boolean;
        dailyApplyLimit: number;
        preferredJobTitles: string[];
        error?: undefined;
    }>;
    checkAuth(req: ExpressRequest & {
        user: any;
    }): Promise<{
        authenticated: boolean;
        user: {
            firebaseUid: any;
            email: any;
            emailVerified: any;
        };
    }>;
}
