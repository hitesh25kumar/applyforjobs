import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { Question, QuestionSchema, UserAnswer, UserAnswerSchema } from './schemas/question.schema';

import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Question.name, schema: QuestionSchema },
            { name: UserAnswer.name, schema: UserAnswerSchema },
        ]),
        AuthModule,
    ],
    controllers: [QuestionsController],
    providers: [QuestionsService],
    exports: [QuestionsService],
})
export class QuestionsModule { }
