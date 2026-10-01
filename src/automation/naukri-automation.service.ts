import { Injectable, Logger } from '@nestjs/common';
import { ProfileService } from '../profile/profile.service';
import { NaukriAutomationEngine } from 'automation';
import { UserProfile } from 'automation';

@Injectable()
export class NaukriAutomationService {
    private readonly logger = new Logger(NaukriAutomationService.name);
    private readonly engine = new NaukriAutomationEngine();

    constructor(private readonly profileService: ProfileService) { }

    async runAutomation(keyword?: string, maxJobs: number = 20, headless: boolean = true): Promise<void> {
        this.logger.log(`Starting Naukri automation background process...`);

        try {
            const profile = await this.profileService.getProfile();
            const searchKeyword = keyword || (profile.jobKeywords && profile.jobKeywords[0]) || 'Product Manager';

            const userProfile: UserProfile = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                phone: profile.phone,
                yearsOfExperience: String(profile.yearsOfExperience || '0'),
                expectedCTC: profile.expectedCTC || '0',
                noticePeriod: profile.noticePeriod || 'Immediate',
                preferredCity: profile.preferredCity || '',
                linkedinData: profile.linkedinUrl || '',
                resumePath: (profile as any).resumePath || '', // Ensure we have a path
                skillsExperience: profile.skillsExperience,
                domainsExperience: profile.domainsExperience,
            };

            // Run headless in background
            await this.engine.run(userProfile, {
                keyword: searchKeyword,
                headless: headless || process.env.AUTOMATION_HEADLESS === 'true' || process.env.NODE_ENV === 'production',
                maxJobs,
                sessionPath: process.env.NAUKRI_SESSION_PATH || (
                    process.env.AUTOMATION_USER_DATA_DIR
                        ? `${process.env.AUTOMATION_USER_DATA_DIR}/naukri/storage-state.json`
                        : undefined
                ),
            });

            this.logger.log(`Naukri automation process completed.`);
        } catch (e) {
            this.logger.error(`Naukri automation failed: ${e.message}`);
        }
    }
}
