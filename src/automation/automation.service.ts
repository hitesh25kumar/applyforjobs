import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';
import { BrowserManager, AutomationEngine } from 'automation';
import { ProfileService } from '../profile/profile.service';
import { CompanyStatus } from '../companies/schemas/company.schema';
import { ApplicationsService } from '../applications/applications.service';
import { QuestionsService } from '../questions/questions.service';

@Injectable()
export class AutomationService implements OnModuleInit, OnModuleDestroy {
    private engine: AutomationEngine;
    private readonly logger = new Logger(AutomationService.name);

    constructor(
        private readonly companiesService: CompaniesService,
        private readonly profileService: ProfileService,
        private readonly applicationsService: ApplicationsService,
        private readonly questionsService: QuestionsService,
    ) {
        this.engine = new AutomationEngine();
    }

    async onModuleInit() {
        this.logger.log('Initializing Automation Service...');
    }

    async onModuleDestroy() {
        await this.engine.stop();
    }

    async startAutomation() {
        await this.engine.start();
        this.resolvePendingCompanies(); // Fire and forget
        return { status: 'Automation Started' };
    }

    async resolvePendingCompanies() {
        this.logger.log('Resolving pending companies and applying...');
        const companies = await this.companiesService.findPending();
        const profile = await this.profileService.getProfile(); // Get "The Brain"

        if (!profile || !profile.firstName) {
            this.logger.error("No profile found! Cannot apply.");
            return;
        }

        for (const company of companies) {
            this.logger.log(`Processing ${company.name}...`);
            let url = company.careersPageUrl;

            // 1. Resolve URL if missing
            if (!url) {
                const resolved = await this.engine.resolveCompanyUrl(company.name);
                if (resolved) {
                    url = resolved;
                    await this.companiesService.update((company as any)._id, {
                        websiteUrl: url,
                        careersPageUrl: url,
                        logs: [...company.logs, `Resolved URL to ${url}`]
                    });
                }
            }

            if (url) {
                // 2. Scan for Jobs
                this.logger.log(`Scanning jobs at ${url}...`);
                const jobs = await this.engine.scanCompany(url, profile.jobKeywords || []);
                this.logger.log(`Found ${jobs.length} potential jobs.`);

                // 3. Apply to first matching job (Simple Heuristic for now)
                // In real world, we'd filter strictly or let user choose.
                if (jobs.length > 0) {
                    const targetJob = jobs[0]; // Apply to the first one for demo
                    this.logger.log(`Attempting to apply to: ${targetJob.title} (${targetJob.url})`);

                    // Handle resume file - save from DB to temp file if exists
                    let resumePath = profile.resumeFilePath || '/tmp/resume.pdf';
                    if (profile.resumeFile && profile.resumeFileName) {
                        const fs = require('fs');
                        const path = require('path');
                        const tmpDir = require('os').tmpdir();
                        resumePath = path.join(tmpDir, profile.resumeFileName);
                        fs.writeFileSync(resumePath, profile.resumeFile);
                        this.logger.log(`Saved resume from DB to: ${resumePath}`);
                    }

                    // Convert profileDoc to compatible JSON
                    const userProfile = {
                        ...(profile as any).toObject(),
                        resumeFilePath: resumePath
                    };

                    const success = await this.engine.applyToJob(targetJob.url, userProfile);

                    if (success) {
                        await this.companiesService.update((company as any)._id, {
                            status: CompanyStatus.RESOLVED,
                            logs: [...company.logs, `Successfully applied to ${targetJob.title}`]
                        });
                    } else {
                        await this.companiesService.update((company as any)._id, {
                            status: CompanyStatus.FAILED,
                            logs: [...company.logs, `Failed to apply to ${targetJob.title}`]
                        });
                    }
                } else {
                    await this.companiesService.update((company as any)._id, {
                        logs: [...company.logs, `No jobs found scanned at ${url}`]
                    });
                }

            } else {
                await this.companiesService.update((company as any)._id, {
                    status: CompanyStatus.FAILED,
                    logs: [...company.logs, 'Failed to resolve URL']
                });
            }
        }
        this.logger.log('Finished automation cycle.');
    }

    async testLaunch() {
        // Compatibility with previous test
        await this.engine.start();
        return { status: 'Launched' };
    }

    async startLinkedInAutomation(
        keyword: string,
        location?: string,
        maxJobs: number = 10
    ) {
        const profile = await this.profileService.getProfile();

        if (!profile) {
            this.logger.error('No profile found');
            return { success: false, message: 'Profile not found' };
        }

        this.logger.log(`Starting LinkedIn automation: keyword="${keyword}", location="${location}", maxJobs=${maxJobs}`);

        // Run LinkedIn automation in background
        this.runLinkedInAutomationBackground(keyword, profile, location, maxJobs);

        return {
            status: 'LinkedIn automation started',
            keyword,
            maxJobs
        };
    }

    private async runLinkedInAutomationBackground(
        keyword: string,
        profile: any,
        location?: string,
        maxJobs: number = 10
    ) {
        try {
            // Collect unmapped questions
            const unmappedQuestions = new Set<string>();
            const onUnmappedQuestion = async (text: string, type: string, category: string) => {
                unmappedQuestions.add(text);
                try {
                    await this.questionsService.create(text, type, category);
                    console.log(`[Automation Service] 💾 Saved new question to bank: "${text}" (${type})`);
                } catch (e) {
                    console.error(`[Automation Service] ⚠ Failed to save question: ${text}`, e);
                }
            };

            // Fetch saved answers from Question Bank
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
            } catch (err) {
                console.warn(`[Automation Service] Failed to load saved answers:`, err);
            }

            const result = await this.engine.runLinkedInAutomation(
                keyword,
                profile,
                location || '',
                maxJobs,
                onUnmappedQuestion
            );
            const results = result.jobs || [];

            console.log(`[Automation Service] === LinkedIn Automation Results ===`);
            console.log(`Total Applications: ${results.length}`);
            console.log(`Successful: ${results.filter((r: any) => r.success).length}`);
            console.log(`Failed: ${results.filter((r: any) => !r.success).length}`);

            // Save successful applications to database
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
                            questions: jobResult.questions?.map((q: any) => ({
                                question: q.question,
                                answer: q.answer,
                                fieldType: q.fieldType,
                                category: q.category
                            })) || []
                        });
                        console.log(`[Automation Service] ✅ Saved application: ${jobResult.company} - ${jobResult.title}`);
                    } catch (err: any) {
                        console.error(`[Automation Service] Failed to save application:`, err.message);
                    }
                }
            }

            // Save unmapped questions to profile
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
        } catch (e) {
            this.logger.error('LinkedIn automation failed:', e);
        }
    }
}
