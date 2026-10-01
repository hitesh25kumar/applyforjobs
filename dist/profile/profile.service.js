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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const profile_schema_1 = require("./schemas/profile.schema");
let ProfileService = class ProfileService {
    constructor(profileModel) {
        this.profileModel = profileModel;
    }
    async getProfile() {
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
    async updateProfile(updateProfileDto) {
        const profile = await this.getProfile();
        await this.profileModel.updateOne({ _id: profile._id }, updateProfileDto).exec();
        const updated = await this.profileModel.findOne().exec();
        if (!updated)
            throw new Error("Profile not found after update");
        return updated;
    }
    async saveResume(fileBuffer, filename) {
        const profile = await this.getProfile();
        await this.profileModel.updateOne({ _id: profile._id }, { resumeFile: fileBuffer, resumeFileName: filename }).exec();
    }
    async saveCoverLetter(fileBuffer, filename) {
        const profile = await this.getProfile();
        await this.profileModel.updateOne({ _id: profile._id }, { coverLetterFile: fileBuffer, coverLetterFileName: filename }).exec();
    }
    async reportQuestion(question) {
        const profile = await this.getProfile();
        const cleaned = question.trim();
        if (!cleaned)
            return;
        const mappings = profile.questionMappings || new Map();
        const unmapped = profile.unmappedQuestions || [];
        if (mappings.has(cleaned) || unmapped.includes(cleaned)) {
            return;
        }
        await this.profileModel.updateOne({ _id: profile._id }, { $addToSet: { unmappedQuestions: cleaned } }).exec();
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(profile_schema_1.Profile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProfileService);
//# sourceMappingURL=profile.service.js.map