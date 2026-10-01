import { Module } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { AutomationController } from './automation.controller';

import { CompaniesModule } from '../companies/companies.module';
import { ProfileModule } from '../profile/profile.module';

import { ScheduleModule } from '@nestjs/schedule';
import { NaukriAutomationService } from './naukri-automation.service';
import { InstagramAutomationService } from './instagram-automation.service';
import { AutomationWorker } from './automation.worker';
import { ApplicationsModule } from '../applications/applications.module';
import { QuestionsModule } from '../questions/questions.module';

@Module({
    imports: [
        CompaniesModule,
        ProfileModule,
        ApplicationsModule,
        QuestionsModule,
        ScheduleModule.forRoot()
    ],
    controllers: [AutomationController],
    providers: [AutomationService, NaukriAutomationService, InstagramAutomationService, AutomationWorker],
    exports: [AutomationService, NaukriAutomationService, InstagramAutomationService],
})
export class AutomationModule { }
