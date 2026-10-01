import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { QuestionAnswer, QuestionAnswerSchema } from './schemas/question-answer.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Application.name, schema: ApplicationSchema },
            { name: QuestionAnswer.name, schema: QuestionAnswerSchema },
        ]),
        AuthModule, // Import AuthModule for FirebaseAuthGuard
    ],
    controllers: [ApplicationsController],
    providers: [ApplicationsService],
    exports: [ApplicationsService],
})
export class ApplicationsModule { }
