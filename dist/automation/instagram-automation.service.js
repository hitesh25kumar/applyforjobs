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
var InstagramAutomationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramAutomationService = void 0;
const common_1 = require("@nestjs/common");
const automation_1 = require("automation");
let InstagramAutomationService = InstagramAutomationService_1 = class InstagramAutomationService {
    constructor() {
        this.logger = new common_1.Logger(InstagramAutomationService_1.name);
        this.engine = new automation_1.InstagramAutomationEngine();
    }
    async runAutomation(message, maxMessages, useRequests, clearData) {
        this.logger.log(`Starting Instagram automation. Max messages: ${maxMessages}, Use Requests: ${useRequests}, Clear Data: ${clearData}`);
        try {
            const result = await this.engine.run({
                message,
                maxMessages,
                headless: process.env.AUTOMATION_HEADLESS === 'true' || process.env.NODE_ENV === 'production',
                useRequests,
                clearData,
            });
            return result;
        }
        catch (error) {
            this.logger.error('Instagram automation failed', error);
            throw error;
        }
    }
};
exports.InstagramAutomationService = InstagramAutomationService;
exports.InstagramAutomationService = InstagramAutomationService = InstagramAutomationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], InstagramAutomationService);
//# sourceMappingURL=instagram-automation.service.js.map