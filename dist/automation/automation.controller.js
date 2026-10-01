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
var AutomationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationController = void 0;
const common_1 = require("@nestjs/common");
const automation_service_1 = require("./automation.service");
const naukri_automation_service_1 = require("./naukri-automation.service");
const instagram_automation_service_1 = require("./instagram-automation.service");
const automation_dto_1 = require("./dto/automation.dto");
let AutomationController = AutomationController_1 = class AutomationController {
    constructor(automationService, naukriService, instagramService) {
        this.automationService = automationService;
        this.naukriService = naukriService;
        this.instagramService = instagramService;
        this.logger = new common_1.Logger(AutomationController_1.name);
    }
    async startAutomation() {
        try {
            this.logger.log('Starting general automation');
            const result = await this.automationService.startAutomation();
            return {
                success: true,
                ...result,
                message: 'Automation started successfully',
            };
        }
        catch (error) {
            this.logger.error('Failed to start automation', error);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to start automation',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async startLinkedInAutomation(body) {
        try {
            this.logger.log(`Starting LinkedIn automation with keyword: ${body.keyword}`);
            const result = await this.automationService.startLinkedInAutomation(body.keyword, body.location, body.maxJobs || 10);
            return {
                success: true,
                ...result,
                message: `LinkedIn automation started for keyword "${body.keyword}"`,
            };
        }
        catch (error) {
            this.logger.error('LinkedIn automation failed', error);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to start LinkedIn automation',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async startNaukriAutomation(body) {
        try {
            this.logger.log(`Starting Naukri automation with keyword: ${body.keyword || 'default'}`);
            const result = await this.naukriService.runAutomation(body.keyword, body.maxJobs || 10, body.headless !== undefined ? body.headless : true);
            return {
                success: true,
                data: result,
                message: 'Naukri automation started successfully',
            };
        }
        catch (error) {
            this.logger.error('Naukri automation failed', error);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to start Naukri automation',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStatus() {
        try {
            return {
                success: true,
                status: 'Automation Engine Ready',
                timestamp: new Date().toISOString(),
                services: {
                    linkedin: 'available',
                    naukri: 'available',
                    external: 'available',
                }
            };
        }
        catch (error) {
            this.logger.error('Status check failed', error);
            throw new common_1.HttpException({
                success: false,
                message: 'Status check failed',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async startInstagramAutomation(body) {
        try {
            this.logger.log(`Starting Instagram automation. Message len: ${body.message.length}, Count: ${body.maxMessages}, Use Requests: ${body.useRequests}, Clear Data: ${body.clearData}`);
            const result = await this.instagramService.runAutomation(body.message, body.maxMessages || 10, body.useRequests, body.clearData);
            return {
                success: true,
                data: result,
                message: 'Instagram automation started',
            };
        }
        catch (error) {
            this.logger.error('Instagram automation failed', error);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to start Instagram automation',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AutomationController = AutomationController;
__decorate([
    (0, common_1.Post)('start'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutomationController.prototype, "startAutomation", null);
__decorate([
    (0, common_1.Post)('linkedin/start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [automation_dto_1.StartLinkedInAutomationDto]),
    __metadata("design:returntype", Promise)
], AutomationController.prototype, "startLinkedInAutomation", null);
__decorate([
    (0, common_1.Post)('naukri/start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [automation_dto_1.StartNaukriAutomationDto]),
    __metadata("design:returntype", Promise)
], AutomationController.prototype, "startNaukriAutomation", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutomationController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('instagram/start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [automation_dto_1.StartInstagramAutomationDto]),
    __metadata("design:returntype", Promise)
], AutomationController.prototype, "startInstagramAutomation", null);
exports.AutomationController = AutomationController = AutomationController_1 = __decorate([
    (0, common_1.Controller)('automation'),
    __metadata("design:paramtypes", [automation_service_1.AutomationService,
        naukri_automation_service_1.NaukriAutomationService,
        instagram_automation_service_1.InstagramAutomationService])
], AutomationController);
//# sourceMappingURL=automation.controller.js.map