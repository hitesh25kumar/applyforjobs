"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationModule = void 0;
const common_1 = require("@nestjs/common");
const automation_service_1 = require("./automation.service");
const automation_controller_1 = require("./automation.controller");
const companies_module_1 = require("../companies/companies.module");
const profile_module_1 = require("../profile/profile.module");
const schedule_1 = require("@nestjs/schedule");
const naukri_automation_service_1 = require("./naukri-automation.service");
const instagram_automation_service_1 = require("./instagram-automation.service");
const automation_worker_1 = require("./automation.worker");
const applications_module_1 = require("../applications/applications.module");
const questions_module_1 = require("../questions/questions.module");
let AutomationModule = class AutomationModule {
};
exports.AutomationModule = AutomationModule;
exports.AutomationModule = AutomationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            companies_module_1.CompaniesModule,
            profile_module_1.ProfileModule,
            applications_module_1.ApplicationsModule,
            questions_module_1.QuestionsModule,
            schedule_1.ScheduleModule.forRoot()
        ],
        controllers: [automation_controller_1.AutomationController],
        providers: [automation_service_1.AutomationService, naukri_automation_service_1.NaukriAutomationService, instagram_automation_service_1.InstagramAutomationService, automation_worker_1.AutomationWorker],
        exports: [automation_service_1.AutomationService, naukri_automation_service_1.NaukriAutomationService, instagram_automation_service_1.InstagramAutomationService],
    })
], AutomationModule);
//# sourceMappingURL=automation.module.js.map