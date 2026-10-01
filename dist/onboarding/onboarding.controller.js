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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const profile_schema_1 = require("../profile/schemas/profile.schema");
const firebase_auth_guard_1 = require("../auth/firebase-auth.guard");
const onboarding_steps_dto_1 = require("./dto/onboarding-steps.dto");
let OnboardingController = class OnboardingController {
    constructor(profileModel) {
        this.profileModel = profileModel;
    }
    async saveBasicInfo(dto, req) {
        const profile = await this.profileModel.findOneAndUpdate({ firebaseUid: req.user.firebaseUid }, {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone: dto.phone,
            preferredCity: dto.preferredCity,
            preferredCountry: dto.preferredCountry,
            yearsOfExperience: dto.yearsOfExperience?.toString(),
            onboardingStep: 1,
        }, { new: true });
        return {
            success: true,
            currentStep: 1,
            message: 'Basic info saved successfully',
        };
    }
    async saveProfessionalInfo(dto, req) {
        const profile = await this.profileModel.findOneAndUpdate({ firebaseUid: req.user.firebaseUid }, {
            preferredJobTitles: dto.preferredJobTitles,
            noticePeriod: dto.noticePeriod,
            currentCTC: dto.currentCTC,
            expectedCTC: dto.expectedCTC,
            onboardingStep: 2,
        }, { new: true });
        return {
            success: true,
            currentStep: 2,
            message: 'Professional info saved successfully',
        };
    }
    async saveResumeLinks(dto, req) {
        const profile = await this.profileModel.findOneAndUpdate({ firebaseUid: req.user.firebaseUid }, {
            resumePath: dto.resumePath,
            linkedinUrl: dto.linkedinUrl,
            portfolioUrl: dto.portfolioUrl,
            githubUrl: dto.githubUrl,
            onboardingStep: 3,
        }, { new: true });
        return {
            success: true,
            currentStep: 3,
            message: 'Resume and links saved successfully',
        };
    }
    async saveMetadata(dto, req) {
        const profile = await this.profileModel.findOneAndUpdate({ firebaseUid: req.user.firebaseUid }, {
            education: dto.education,
            experience: dto.experience,
            techStack: dto.techStack,
            skillsExperience: dto.skillsExperience,
            onboardingStep: 4,
            onboardingCompleted: true,
        }, { new: true });
        return {
            success: true,
            currentStep: 4,
            onboardingCompleted: true,
            message: 'Onboarding completed successfully',
        };
    }
    async getProgress(req) {
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
    async skipOnboarding(req) {
        await this.profileModel.findOneAndUpdate({ firebaseUid: req.user.firebaseUid }, {
            onboardingCompleted: false,
        });
        return {
            success: true,
            message: 'Onboarding skipped. You can complete it later from settings.',
        };
    }
};
exports.OnboardingController = OnboardingController;
__decorate([
    (0, common_1.Patch)('step/1'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [onboarding_steps_dto_1.BasicInfoDto, Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "saveBasicInfo", null);
__decorate([
    (0, common_1.Patch)('step/2'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [onboarding_steps_dto_1.ProfessionalInfoDto, Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "saveProfessionalInfo", null);
__decorate([
    (0, common_1.Patch)('step/3'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [onboarding_steps_dto_1.ResumeLinksDto, Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "saveResumeLinks", null);
__decorate([
    (0, common_1.Patch)('step/4'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [onboarding_steps_dto_1.MetadataDto, Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "saveMetadata", null);
__decorate([
    (0, common_1.Get)('progress'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Patch)('skip'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "skipOnboarding", null);
exports.OnboardingController = OnboardingController = __decorate([
    (0, common_1.Controller)('onboarding'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, mongoose_1.InjectModel)(profile_schema_1.Profile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], OnboardingController);
//# sourceMappingURL=onboarding.controller.js.map