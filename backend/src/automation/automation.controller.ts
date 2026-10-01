import { Controller, Post, Get, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { NaukriAutomationService } from './naukri-automation.service';
import { InstagramAutomationService } from './instagram-automation.service';
import { StartLinkedInAutomationDto, StartNaukriAutomationDto, StartInstagramAutomationDto } from './dto/automation.dto';

@Controller('automation')
export class AutomationController {
    private readonly logger = new Logger(AutomationController.name);

    constructor(
        private readonly automationService: AutomationService,
        private readonly naukriService: NaukriAutomationService,
        private readonly instagramService: InstagramAutomationService
    ) { }

    @Post('start')
    async startAutomation() {
        try {
            this.logger.log('Starting general automation');
            const result = await this.automationService.startAutomation();
            return {
                success: true,
                ...result,
                message: 'Automation started successfully',
            };
        } catch (error) {
            this.logger.error('Failed to start automation', error);
            throw new HttpException(
                {
                    success: false,
                    message: 'Failed to start automation',
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('linkedin/start')
    async startLinkedInAutomation(@Body() body: StartLinkedInAutomationDto) {
        try {
            this.logger.log(`Starting LinkedIn automation with keyword: ${body.keyword}`);

            const result = await this.automationService.startLinkedInAutomation(
                body.keyword,
                body.location,
                body.maxJobs || 10
            );

            return {
                success: true,
                ...result,
                message: `LinkedIn automation started for keyword "${body.keyword}"`,
            };
        } catch (error) {
            this.logger.error('LinkedIn automation failed', error);
            throw new HttpException(
                {
                    success: false,
                    message: 'Failed to start LinkedIn automation',
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('naukri/start')
    async startNaukriAutomation(@Body() body: StartNaukriAutomationDto) {
        try {
            this.logger.log(`Starting Naukri automation with keyword: ${body.keyword || 'default'}`);

            const result = await this.naukriService.runAutomation(
                body.keyword,
                body.maxJobs || 10,
                body.headless !== undefined ? body.headless : true
            );

            return {
                success: true,
                data: result,
                message: 'Naukri automation started successfully',
            };
        } catch (error) {
            this.logger.error('Naukri automation failed', error);
            throw new HttpException(
                {
                    success: false,
                    message: 'Failed to start Naukri automation',
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('status')
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
        } catch (error) {
            this.logger.error('Status check failed', error);
            throw new HttpException(
                {
                    success: false,
                    message: 'Status check failed',
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('instagram/start')
    async startInstagramAutomation(@Body() body: StartInstagramAutomationDto) {
        try {
            this.logger.log(`Starting Instagram automation. Message len: ${body.message.length}, Count: ${body.maxMessages}, Use Requests: ${body.useRequests}, Clear Data: ${body.clearData}`);
            const result = await this.instagramService.runAutomation(
                body.message,
                body.maxMessages || 10,
                body.useRequests,
                body.clearData
            );
            return {
                success: true,
                data: result,
                message: 'Instagram automation started',
            };
        } catch (error) {
            this.logger.error('Instagram automation failed', error);
            throw new HttpException(
                {
                    success: false,
                    message: 'Failed to start Instagram automation',
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
