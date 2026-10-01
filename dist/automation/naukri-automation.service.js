"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NaukriAutomationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaukriAutomationService = void 0;
const common_1 = require("@nestjs/common");
const profile_service_1 = require("../profile/profile.service");
const automation_1 = require("automation");
let NaukriAutomationService = NaukriAutomationService_1 = class NaukriAutomationService {
    constructor(profileService) {
        this.profileService = profileService;
        this.logger = new common_1.Logger(NaukriAutomationService_1.name);
        this.engine = new automation_1.NaukriAutomationEngine();
    }
    async runAutomation(keyword, maxJobs = 20, headless = true) {
        this.logger.log(`Starting Naukri automation background process...`);
        try {
            const profile = await this.profileService.getProfile();
            const searchKeyword = keyword || (profile.jobKeywords && profile.jobKeywords[0]) || 'Product Manager';
            const userProfile = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                phone: profile.phone,
                yearsOfExperience: String(profile.yearsOfExperience || '0'),
                expectedCTC: profile.expectedCTC || '0',
                noticePeriod: profile.noticePeriod || 'Immediate',
                preferredCity: profile.preferredCity || '',
                linkedinData: profile.linkedinUrl || '',
                resumePath: profile.resumePath || '',
                skillsExperience: profile.skillsExperience,
                domainsExperience: profile.domainsExperience,
            };
            await this.engine.run(userProfile, {
                keyword: searchKeyword,
                headless: headless || process.env.AUTOMATION_HEADLESS === 'true' || process.env.NODE_ENV === 'production',
                maxJobs,
                sessionPath: process.env.NAUKRI_SESSION_PATH || (process.env.AUTOMATION_USER_DATA_DIR
                    ? `${process.env.AUTOMATION_USER_DATA_DIR}/naukri/storage-state.json`
                    : undefined),
            });
            this.logger.log(`Naukri automation process completed.`);
        }
        catch (e) {
            this.logger.error(`Naukri automation failed: ${e.message}`);
        }
    }
};
exports.NaukriAutomationService = NaukriAutomationService;
exports.NaukriAutomationService = NaukriAutomationService = NaukriAutomationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [profile_service_1.ProfileService])
], NaukriAutomationService);
//# sourceMappingURL=naukri-automation.service.js.map