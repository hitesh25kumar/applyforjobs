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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const profile_schema_1 = require("../profile/schemas/profile.schema");
const firebase_auth_guard_1 = require("./firebase-auth.guard");
const firebase_service_1 = require("./firebase.service");
let AuthController = class AuthController {
    constructor(profileModel, firebaseService) {
        this.profileModel = profileModel;
        this.firebaseService = firebaseService;
    }
    async register(body) {
        const { firebaseUid, email, firstName, lastName, photoURL } = body;
        let profile = await this.profileModel.findOne({ firebaseUid });
        if (!profile) {
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
                linkedinEnabled: true,
                naukriEnabled: true,
                externalEnabled: false,
                dailyApplyLimit: 50,
                preferredJobTitles: [],
            });
        }
        else {
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
    async getCurrentUser(req) {
        const profile = await this.profileModel.findOne({
            firebaseUid: req.user.firebaseUid
        });
        if (!profile) {
            return {
                error: 'Profile not found. Please complete registration.',
            };
        }
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
            linkedinEnabled: profile.linkedinEnabled,
            naukriEnabled: profile.naukriEnabled,
            externalEnabled: profile.externalEnabled,
            dailyApplyLimit: profile.dailyApplyLimit,
            preferredJobTitles: profile.preferredJobTitles,
        };
    }
    async checkAuth(req) {
        return {
            authenticated: true,
            user: {
                firebaseUid: req.user.firebaseUid,
                email: req.user.email,
                emailVerified: req.user.emailVerified,
            },
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkAuth", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __param(0, (0, mongoose_1.InjectModel)(profile_schema_1.Profile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        firebase_service_1.FirebaseService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map