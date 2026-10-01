import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';
import { ProfileService } from '../profile/profile.service';
import { ApplicationsService } from '../applications/applications.service';
import { QuestionsService } from '../questions/questions.service';
export declare class AutomationService implements OnModuleInit, OnModuleDestroy {
    private readonly companiesService;
    private readonly profileService;
    private readonly applicationsService;
    private readonly questionsService;
    private engine;
    private readonly logger;
    constructor(companiesService: CompaniesService, profileService: ProfileService, applicationsService: ApplicationsService, questionsService: QuestionsService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    startAutomation(): Promise<{
        status: string;
    }>;
    resolvePendingCompanies(): Promise<void>;
    testLaunch(): Promise<{
        status: string;
    }>;
    startLinkedInAutomation(keyword: string, location?: string, maxJobs?: number): Promise<{
        success: boolean;
        message: string;
        status?: undefined;
        keyword?: undefined;
        maxJobs?: undefined;
    } | {
        status: string;
        keyword: string;
        maxJobs: number;
        success?: undefined;
        message?: undefined;
    }>;
    private runLinkedInAutomationBackground;
}
