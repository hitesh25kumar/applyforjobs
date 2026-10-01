import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NaukriAutomationService } from './naukri-automation.service';

@Injectable()
export class AutomationWorker {
    private readonly logger = new Logger(AutomationWorker.name);

    constructor(private readonly naukriService: NaukriAutomationService) { }

    // Run every day at 10 AM
    @Cron('0 10 * * *')
    async handleNaukriDailyRun() {
        this.logger.log('Starting scheduled daily Naukri automation run...');
        await this.naukriService.runAutomation();
        this.logger.log('Scheduled daily Naukri automation run finished.');
    }
}
