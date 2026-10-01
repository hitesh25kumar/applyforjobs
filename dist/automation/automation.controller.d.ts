import { AutomationService } from './automation.service';
import { NaukriAutomationService } from './naukri-automation.service';
import { InstagramAutomationService } from './instagram-automation.service';
import { StartLinkedInAutomationDto, StartNaukriAutomationDto, StartInstagramAutomationDto } from './dto/automation.dto';
export declare class AutomationController {
    private readonly automationService;
    private readonly naukriService;
    private readonly instagramService;
    private readonly logger;
    constructor(automationService: AutomationService, naukriService: NaukriAutomationService, instagramService: InstagramAutomationService);
    startAutomation(): Promise<{
        message: string;
        status: string;
        success: boolean;
    }>;
    startLinkedInAutomation(body: StartLinkedInAutomationDto): Promise<{
        message: string;
        success: boolean;
        status?: undefined;
        keyword?: undefined;
        maxJobs?: undefined;
    } | {
        message: string;
        status: string;
        keyword: string;
        maxJobs: number;
        success: boolean;
    }>;
    startNaukriAutomation(body: StartNaukriAutomationDto): Promise<{
        success: boolean;
        data: void;
        message: string;
    }>;
    getStatus(): Promise<{
        success: boolean;
        status: string;
        timestamp: string;
        services: {
            linkedin: string;
            naukri: string;
            external: string;
        };
    }>;
    startInstagramAutomation(body: StartInstagramAutomationDto): Promise<{
        success: boolean;
        data: {
            success: boolean;
            count: number;
            message: string;
        };
        message: string;
    }>;
}
