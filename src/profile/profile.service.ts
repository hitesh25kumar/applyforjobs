import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
    constructor(
        @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    ) { }

    async getProfile(): Promise<Profile> {
        // Singleton profile: get the first one or create default
        let profile = await this.profileModel.findOne().exec();
        if (!profile) {
            profile = await this.profileModel.create({
                firstName: 'User',
                lastName: 'Pending',
                email: 'setup@example.com',
                jobKeywords: ['Product Manager'],
                preferredCity: 'San Francisco',
                preferredCountry: 'USA',
                address: '',
                state: '',
                zipCode: '',
                coverLetter: '',
                resumeFilePath: '',
                techStack: [],
                dateAvailable: '',
                desiredPay: '',
                rightToWork: 'Yes',
                currentCTC: '',
                expectedCTC: '',
                noticePeriod: '',
                yearsOfExperience: '',
                productManagementExperience: '',
                canJoinIn15Days: 'Yes',
                agileScrumExperience: 'Yes',
                openToHybrid: 'Yes',
                techConceptsKnowledge: 'Yes',
            });
        }
        return profile;
    }

    async updateProfile(updateProfileDto: UpdateProfileDto): Promise<Profile> {
        const profile = await this.getProfile(); // Ensure it exists
        await this.profileModel.updateOne({ _id: (profile as any)._id }, updateProfileDto).exec();
        const updated = await this.profileModel.findOne().exec();
        if (!updated) throw new Error("Profile not found after update");
        return updated;
    }

    async saveResume(fileBuffer: Buffer, filename: string): Promise<void> {
        const profile = await this.getProfile();
        await this.profileModel.updateOne(
            { _id: (profile as any)._id },
            { resumeFile: fileBuffer, resumeFileName: filename }
        ).exec();
    }

    async saveCoverLetter(fileBuffer: Buffer, filename: string): Promise<void> {
        const profile = await this.getProfile();
        await this.profileModel.updateOne(
            { _id: (profile as any)._id },
            { coverLetterFile: fileBuffer, coverLetterFileName: filename }
        ).exec();
    }

    async reportQuestion(question: string): Promise<void> {
        const profile = await this.getProfile();
        const cleaned = question.trim();
        if (!cleaned) return;

        // Check if question is already mapped or in the unmapped list
        const mappings = profile.questionMappings || new Map();
        const unmapped = profile.unmappedQuestions || [];

        if (mappings.has(cleaned) || unmapped.includes(cleaned)) {
            return;
        }

        await this.profileModel.updateOne(
            { _id: (profile as any)._id },
            { $addToSet: { unmappedQuestions: cleaned } }
        ).exec();
    }
}
