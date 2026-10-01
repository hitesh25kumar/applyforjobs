import { NaukriAutomationService } from './naukri-automation.service';
export declare class AutomationWorker {
    private readonly naukriService;
    private readonly logger;
    constructor(naukriService: NaukriAutomationService);
    handleNaukriDailyRun(): Promise<void>;
}
