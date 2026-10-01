import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class ProfileService {
    private profileModel;
    constructor(profileModel: Model<ProfileDocument>);
    getProfile(): Promise<Profile>;
    updateProfile(updateProfileDto: UpdateProfileDto): Promise<Profile>;
    saveResume(fileBuffer: Buffer, filename: string): Promise<void>;
    saveCoverLetter(fileBuffer: Buffer, filename: string): Promise<void>;
    reportQuestion(question: string): Promise<void>;
}
