import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    getProfile(): Promise<import("./schemas/profile.schema").Profile>;
    updateProfile(updateProfileDto: UpdateProfileDto): Promise<import("./schemas/profile.schema").Profile>;
    patchProfile(updateProfileDto: UpdateProfileDto): Promise<import("./schemas/profile.schema").Profile>;
    uploadResume(file: Express.Multer.File): Promise<{
        message: string;
        filename: string;
    }>;
    uploadCoverLetter(file: Express.Multer.File): Promise<{
        message: string;
        filename: string;
    }>;
    reportQuestion(question: string): Promise<{
        success: boolean;
    }>;
}
