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
var AutomationWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationWorker = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const naukri_automation_service_1 = require("./naukri-automation.service");
let AutomationWorker = AutomationWorker_1 = class AutomationWorker {
    constructor(naukriService) {
        this.naukriService = naukriService;
        this.logger = new common_1.Logger(AutomationWorker_1.name);
    }
    async handleNaukriDailyRun() {
        this.logger.log('Starting scheduled daily Naukri automation run...');
        await this.naukriService.runAutomation();
        this.logger.log('Scheduled daily Naukri automation run finished.');
    }
};
exports.AutomationWorker = AutomationWorker;
__decorate([
    (0, schedule_1.Cron)('0 10 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutomationWorker.prototype, "handleNaukriDailyRun", null);
exports.AutomationWorker = AutomationWorker = AutomationWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [naukri_automation_service_1.NaukriAutomationService])
], AutomationWorker);
//# sourceMappingURL=automation.worker.js.map