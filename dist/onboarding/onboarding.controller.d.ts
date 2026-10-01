import { Request as ExpressRequest } from 'express';
import { Model } from 'mongoose';
import { ProfileDocument } from '../profile/schemas/profile.schema';
import { BasicInfoDto, ProfessionalInfoDto, ResumeLinksDto, MetadataDto } from './dto/onboarding-steps.dto';
export declare class OnboardingController {
    private profileModel;
    constructor(profileModel: Model<ProfileDocument>);
    saveBasicInfo(dto: BasicInfoDto, req: ExpressRequest & {
        user: any;
    }): Promise<{
        success: boolean;
        currentStep: number;
        message: string;
    }>;
    saveProfessionalInfo(dto: ProfessionalInfoDto, req: ExpressRequest & {
        user: any;
    }): Promise<{
        success: boolean;
        currentStep: number;
        message: string;
    }>;
    saveResumeLinks(dto: ResumeLinksDto, req: ExpressRequest & {
        user: any;
    }): Promise<{
        success: boolean;
        currentStep: number;
        message: string;
    }>;
    saveMetadata(dto: MetadataDto, req: ExpressRequest & {
        user: any;
    }): Promise<{
        success: boolean;
        currentStep: number;
        onboardingCompleted: boolean;
        message: string;
    }>;
    getProgress(req: ExpressRequest & {
        user: any;
    }): Promise<{
        currentStep: number;
        completed: boolean;
        profile?: undefined;
    } | {
        currentStep: number;
        completed: boolean;
        profile: {
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            preferredCity: string;
            preferredCountry: string;
            yearsOfExperience: string;
            preferredJobTitles: string[];
            noticePeriod: string;
            currentCTC: string;
            expectedCTC: string;
            resumePath: string;
            linkedinUrl: string;
            portfolioUrl: string;
            githubUrl: string;
        };
    }>;
    skipOnboarding(req: ExpressRequest & {
        user: any;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
