import { Controller, Post, Get, Body, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from '../profile/schemas/profile.schema';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseService } from './firebase.service';

@Controller('auth')
export class AuthController {
    constructor(
        @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
        private firebaseService: FirebaseService,
    ) { }

    /**
     * Register a new user or get existing user
     * Called after Firebase client-side authentication
     */
    @Post('register')
    @HttpCode(HttpStatus.OK)
    async register(
        @Body() body: { firebaseUid: string; email: string; firstName?: string; lastName?: string; photoURL?: string },
    ) {
        const { firebaseUid, email, firstName, lastName, photoURL } = body;

        // Check if profile already exists
        let profile = await this.profileModel.findOne({ firebaseUid });

        if (!profile) {
            // Create new profile
            profile = await this.profileModel.create({
                firebaseUid,
                email,
                firstName: firstName || '',
                lastName: lastName || '',
                photoURL: photoURL || '',
                onboardingCompleted: false,
                onboardingStep: 0,
                accountCreatedAt: new Date(),
                lastLoginAt: new Date(),
                // Apply Settings defaults
                linkedinEnabled: true,
                naukriEnabled: true,
                externalEnabled: false,
                dailyApplyLimit: 50,
                preferredJobTitles: [],
            });
        } else {
            // Update last login
            profile.lastLoginAt = new Date();
            await profile.save();
        }

        return {
            profile: {
                id: profile._id,
                firebaseUid: profile.firebaseUid,
                email: profile.email,
                firstName: profile.firstName,
                lastName: profile.lastName,
                onboardingCompleted: profile.onboardingCompleted,
                onboardingStep: profile.onboardingStep,
            },
        };
    }

    /**
     * Get current authenticated user
     */
    @Get('me')
    @UseGuards(FirebaseAuthGuard)
    async getCurrentUser(@Request() req: ExpressRequest & { user: any }) {
        const profile = await this.profileModel.findOne({
            firebaseUid: req.user.firebaseUid
        });

        if (!profile) {
            return {
                error: 'Profile not found. Please complete registration.',
            };
        }

        // Return essential profile data (exclude sensitive fields)
        return {
            id: profile._id,
            firebaseUid: profile.firebaseUid,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            photoURL: profile.photoURL,
            phone: profile.phone,
            onboardingCompleted: profile.onboardingCompleted,
            onboardingStep: profile.onboardingStep,
            linkedinUrl: profile.linkedinUrl,
            portfolioUrl: profile.portfolioUrl,
            githubUrl: profile.githubUrl,
            resumePath: profile.resumePath,
            resumeFileName: profile.resumeFileName,
            // Apply settings
            linkedinEnabled: profile.linkedinEnabled,
            naukriEnabled: profile.naukriEnabled,
            externalEnabled: profile.externalEnabled,
            dailyApplyLimit: profile.dailyApplyLimit,
            preferredJobTitles: profile.preferredJobTitles,
        };
    }

    /**
     * Check authentication status
     */
    @Get('status')
    @UseGuards(FirebaseAuthGuard)
    async checkAuth(@Request() req: ExpressRequest & { user: any }) {
        return {
            authenticated: true,
            user: {
                firebaseUid: req.user.firebaseUid,
                email: req.user.email,
                emailVerified: req.user.emailVerified,
            },
        };
    }
}
