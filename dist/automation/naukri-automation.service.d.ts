import { ProfileService } from '../profile/profile.service';
export declare class NaukriAutomationService {
    private readonly profileService;
    private readonly logger;
    private readonly engine;
    constructor(profileService: ProfileService);
    runAutomation(keyword?: string, maxJobs?: number, headless?: boolean): Promise<void>;
}
