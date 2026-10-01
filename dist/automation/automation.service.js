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
var AutomationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationService = void 0;
const common_1 = require("@nestjs/common");
const companies_service_1 = require("../companies/companies.service");
const automation_1 = require("automation");
const profile_service_1 = require("../profile/profile.service");
const company_schema_1 = require("../companies/schemas/company.schema");
const applications_service_1 = require("../applications/applications.service");
const questions_service_1 = require("../questions/questions.service");
let AutomationService = AutomationService_1 = class AutomationService {
    constructor(companiesService, profileService, applicationsService, questionsService) {
        this.companiesService = companiesService;
        this.profileService = profileService;
        this.applicationsService = applicationsService;
        this.questionsService = questionsService;
        this.logger = new common_1.Logger(AutomationService_1.name);
        this.engine = new automation_1.AutomationEngine();
    }
    async onModuleInit() {
        this.logger.log('Initializing Automation Service...');
    }
    async onModuleDestroy() {
        await this.engine.stop();
    }
    async startAutomation() {
        await this.engine.start();
        this.resolvePendingCompanies();
        return { status: 'Automation Started' };
    }
    async resolvePendingCompanies() {
        this.logger.log('Resolving pending companies and applying...');
        const companies = await this.companiesService.findPending();
        const profile = await this.profileService.getProfile();
        if (!profile || !profile.firstName) {
            this.logger.error("No profile found! Cannot apply.");
            return;
        }
        for (const company of companies) {
            this.logger.log(`Processing ${company.name}...`);
            let url = company.careersPageUrl;
            if (!url) {
                const resolved = await this.engine.resolveCompanyUrl(company.name);
                if (resolved) {
                    url = resolved;
                    await this.companiesService.update(company._id, {
                        websiteUrl: url,
                        careersPageUrl: url,
                        logs: [...company.logs, `Resolved URL to ${url}`]
                    });
                }
            }
            if (url) {
                this.logger.log(`Scanning jobs at ${url}...`);
                const jobs = await this.engine.scanCompany(url, profile.jobKeywords || []);
                this.logger.log(`Found ${jobs.length} potential jobs.`);
                if (jobs.length > 0) {
                    const targetJob = jobs[0];
                    this.logger.log(`Attempting to apply to: ${targetJob.title} (${targetJob.url})`);
                    let resumePath = profile.resumeFilePath || '/tmp/resume.pdf';
                    if (profile.resumeFile && profile.resumeFileName) {
                        const fs = require('fs');
                        const path = require('path');
                        const tmpDir = require('os').tmpdir();
                        resumePath = path.join(tmpDir, profile.resumeFileName);
                        fs.writeFileSync(resumePath, profile.resumeFile);
                        this.logger.log(`Saved resume from DB to: ${resumePath}`);
                    }
                    const userProfile = {
                        ...profile.toObject(),
                        resumeFilePath: resumePath
                    };
                    const success = await this.engine.applyToJob(targetJob.url, userProfile);
                    if (success) {
                        await this.companiesService.update(company._id, {
                            status: company_schema_1.CompanyStatus.RESOLVED,
                            logs: [...company.logs, `Successfully applied to ${targetJob.title}`]
                        });
                    }
                    else {
                        await this.companiesService.update(company._id, {
                            status: company_schema_1.CompanyStatus.FAILED,
                            logs: [...company.logs, `Failed to apply to ${targetJob.title}`]
                        });
                    }
                }
                else {
                    await this.companiesService.update(company._id, {
                        logs: [...company.logs, `No jobs found scanned at ${url}`]
                    });
                }
            }
            else {
                await this.companiesService.update(company._id, {
                    status: company_schema_1.CompanyStatus.FAILED,
                    logs: [...company.logs, 'Failed to resolve URL']
                });
            }
        }
        this.logger.log('Finished automation cycle.');
    }
    async testLaunch() {
        await this.engine.start();
        return { status: 'Launched' };
    }
    async startLinkedInAutomation(keyword, location, maxJobs = 10) {
        const profile = await this.profileService.getProfile();
        if (!profile) {
            this.logger.error('No profile found');
            return { success: false, message: 'Profile not found' };
        }
        this.logger.log(`Starting LinkedIn automation: keyword="${keyword}", location="${location}", maxJobs=${maxJobs}`);
        this.runLinkedInAutomationBackground(keyword, profile, location, maxJobs);
        return {
            status: 'LinkedIn automation started',
            keyword,
            maxJobs
        };
    }
    async runLinkedInAutomationBackground(keyword, profile, location, maxJobs = 10) {
        try {
            const unmappedQuestions = new Set();
            const onUnmappedQuestion = async (text, type, category) => {
                unmappedQuestions.add(text);
                try {
                    await this.questionsService.create(text, type, category);
                    console.log(`[Automation Service] 💾 Saved new question to bank: "${text}" (${type})`);
                }
                catch (e) {
                    console.error(`[Automation Service] ⚠ Failed to save question: ${text}`, e);
                }
            };
            try {
                const allQuestions = await this.questionsService.findAll(profile.firebaseUid);
                const savedAnswers = allQuestions
                    .filter(q => q.userAnswer)
                    .map(q => ({
                    question: q.text,
                    answer: q.userAnswer,
                    category: q.category
                }));
                profile.savedAnswers = savedAnswers;
                console.log(`[Automation Service] Loaded ${savedAnswers.length} saved answers from Question Bank`);
            }
            catch (err) {
                console.warn(`[Automation Service] Failed to load saved answers:`, err);
            }
            const result = await this.engine.runLinkedInAutomation(keyword, profile, location || '', maxJobs, onUnmappedQuestion);
            const results = result.jobs || [];
            console.log(`[Automation Service] === LinkedIn Automation Results ===`);
            console.log(`Total Applications: ${results.length}`);
            console.log(`Successful: ${results.filter((r) => r.success).length}`);
            console.log(`Failed: ${results.filter((r) => !r.success).length}`);
            for (const jobResult of results) {
                if (jobResult.success) {
                    try {
                        console.log(`[Automation Service] 💾 Attempting to save:`, {
                            company: jobResult.company,
                            title: jobResult.title,
                            platform: 'LinkedIn'
                        });
                        await this.applicationsService.create({
                            firebaseUid: profile.firebaseUid,
                            platform: 'LinkedIn',
                            companyName: jobResult.company,
                            jobTitle: jobResult.title,
                            status: 'Applied',
                            success: jobResult.success,
                            questions: jobResult.questions?.map((q) => ({
                                question: q.question,
                                answer: q.answer,
                                fieldType: q.fieldType,
                                category: q.category
                            })) || []
                        });
                        console.log(`[Automation Service] ✅ Saved application: ${jobResult.company} - ${jobResult.title}`);
                    }
                    catch (err) {
                        console.error(`[Automation Service] Failed to save application:`, err.message);
                    }
                }
            }
            if (unmappedQuestions.size > 0) {
                const existingQuestions = profile.reportedQuestions || [];
                const allQuestions = [...new Set([...existingQuestions, ...Array.from(unmappedQuestions)])];
                await this.profileService.updateProfile({
                    reportedQuestions: allQuestions
                });
                console.log(`[Automation Service] 📝 Saved ${unmappedQuestions.size} new unmapped questions to profile`);
                console.log(`[Automation Service] Total reported questions: ${allQuestions.length}`);
            }
            this.logger.log(`LinkedIn automation completed: ${result.jobsApplied} applied, ${result.jobsFailed} failed`);
        }
        catch (e) {
            this.logger.error('LinkedIn automation failed:', e);
        }
    }
};
exports.AutomationService = AutomationService;
exports.AutomationService = AutomationService = AutomationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [companies_service_1.CompaniesService,
        profile_service_1.ProfileService,
        applications_service_1.ApplicationsService,
        questions_service_1.QuestionsService])
], AutomationService);
//# sourceMappingURL=automation.service.js.map