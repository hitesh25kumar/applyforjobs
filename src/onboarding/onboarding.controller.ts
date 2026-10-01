import { Controller, Patch, Get, Body, Param, Request, UseGuards, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from '../profile/schemas/profile.schema';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { BasicInfoDto, ProfessionalInfoDto, ResumeLinksDto, MetadataDto } from './dto/onboarding-steps.dto';

@Controller('onboarding')
@UseGuards(FirebaseAuthGuard)
export class OnboardingController {
    constructor(
        @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    ) { }

    /**
     * Save Step 1: Basic Info
     */
    @Patch('step/1')
    async saveBasicInfo(@Body() dto: BasicInfoDto, @Request() req: ExpressRequest & { user: any }) {
        const profile = await this.profileModel.findOneAndUpdate(
            { firebaseUid: req.user.firebaseUid },
            {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                preferredCity: dto.preferredCity,
                preferredCountry: dto.preferredCountry,
                yearsOfExperience: dto.yearsOfExperience?.toString(),
                onboardingStep: 1,
            },
            { new: true },
        );

        return {
            success: true,
            currentStep: 1,
            message: 'Basic info saved successfully',
        };
    }

    /**
     * Save Step 2: Professional Info
     */
    @Patch('step/2')
    async saveProfessionalInfo(@Body() dto: ProfessionalInfoDto, @Request() req: ExpressRequest & { user: any }) {
        const profile = await this.profileModel.findOneAndUpdate(
            { firebaseUid: req.user.firebaseUid },
            {
                preferredJobTitles: dto.preferredJobTitles,
                noticePeriod: dto.noticePeriod,
                currentCTC: dto.currentCTC,
                expectedCTC: dto.expectedCTC,
                onboardingStep: 2,
            },
            { new: true },
        );

        return {
            success: true,
            currentStep: 2,
            message: 'Professional info saved successfully',
        };
    }

    /**
     * Save Step 3: Resume & Links
     */
    @Patch('step/3')
    async saveResumeLinks(@Body() dto: ResumeLinksDto, @Request() req: ExpressRequest & { user: any }) {
        const profile = await this.profileModel.findOneAndUpdate(
            { firebaseUid: req.user.firebaseUid },
            {
                resumePath: dto.resumePath,
                linkedinUrl: dto.linkedinUrl,
                portfolioUrl: dto.portfolioUrl,
                githubUrl: dto.githubUrl,
                onboardingStep: 3,
            },
            { new: true },
        );

        return {
            success: true,
            currentStep: 3,
            message: 'Resume and links saved successfully',
        };
    }

    /**
     * Save Step 4: Auto-Fill Metadata
     */
    @Patch('step/4')
    async saveMetadata(@Body() dto: MetadataDto, @Request() req: ExpressRequest & { user: any }) {
        const profile = await this.profileModel.findOneAndUpdate(
            { firebaseUid: req.user.firebaseUid },
            {
                education: dto.education,
                experience: dto.experience,
                techStack: dto.techStack,
                skillsExperience: dto.skillsExperience,
                onboardingStep: 4,
                onboardingCompleted: true, // Mark onboarding as complete
            },
            { new: true },
        );

        return {
            success: true,
            currentStep: 4,
            onboardingCompleted: true,
            message: 'Onboarding completed successfully',
        };
    }

    /**
     * Get onboarding progress
     */
    @Get('progress')
    async getProgress(@Request() req: ExpressRequest & { user: any }) {
        const profile = await this.profileModel.findOne({
            firebaseUid: req.user.firebaseUid
        });

        if (!profile) {
            return {
                currentStep: 0,
                completed: false,
            };
        }

        return {
            currentStep: profile.onboardingStep || 0,
            completed: profile.onboardingCompleted || false,
            profile: {
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                phone: profile.phone,
                preferredCity: profile.preferredCity,
                preferredCountry: profile.preferredCountry,
                yearsOfExperience: profile.yearsOfExperience,
                preferredJobTitles: profile.preferredJobTitles,
                noticePeriod: profile.noticePeriod,
                currentCTC: profile.currentCTC,
                expectedCTC: profile.expectedCTC,
                resumePath: profile.resumePath,
                linkedinUrl: profile.linkedinUrl,
                portfolioUrl: profile.portfolioUrl,
                githubUrl: profile.githubUrl,
            },
        };
    }

    /**
     * Skip to dashboard (mark onboarding as skipped but not completed)
     */
    @Patch('skip')
    async skipOnboarding(@Request() req: ExpressRequest & { user: any }) {
        await this.profileModel.findOneAndUpdate(
            { firebaseUid: req.user.firebaseUid },
            {
                onboardingCompleted: false, // Still not completed, but user chose to skip
            },
        );

        return {
            success: true,
            message: 'Onboarding skipped. You can complete it later from settings.',
        };
    }
}
