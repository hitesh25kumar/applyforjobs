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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
let FirebaseService = class FirebaseService {
    constructor() {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : null;
        const projectId = process.env.FIREBASE_PROJECT_ID || 'hiteshkumarportfolio';
        if (serviceAccount) {
            this.app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
        else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            this.app = admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        }
        else {
            this.app = admin.initializeApp({
                projectId: projectId,
            });
        }
    }
    async verifyIdToken(idToken) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            return decodedToken;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
    async getUserByUid(uid) {
        try {
            return await admin.auth().getUser(uid);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('User not found');
        }
    }
    async createCustomToken(uid) {
        return await admin.auth().createCustomToken(uid);
    }
    async deleteUser(uid) {
        await admin.auth().deleteUser(uid);
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map