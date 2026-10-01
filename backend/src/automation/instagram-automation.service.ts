
import { Injectable, Logger } from '@nestjs/common';
import { InstagramAutomationEngine } from 'automation'; // Assuming 'automation' is linked or path mapped

@Injectable()
export class InstagramAutomationService {
    private readonly logger = new Logger(InstagramAutomationService.name);
    private engine: InstagramAutomationEngine;

    constructor() {
        this.engine = new InstagramAutomationEngine();
    }

    async runAutomation(message: string, maxMessages: number, useRequests?: boolean, clearData?: boolean) {
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
        } catch (error) {
            this.logger.error('Instagram automation failed', error);
            throw error;
        }
    }
}
