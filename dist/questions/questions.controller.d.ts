import { QuestionsService } from './questions.service';
import { CreateQuestionDto, SaveAnswerDto } from './dto/questions.dto';
import { Request as ExpressRequest } from 'express';
export declare class QuestionsController {
    private readonly questionsService;
    constructor(questionsService: QuestionsService);
    create(createDto: CreateQuestionDto): Promise<import("./schemas/question.schema").Question>;
    findAll(req: ExpressRequest & {
        user: any;
    }): Promise<any[]>;
    getAnswerMap(req: ExpressRequest & {
        user: any;
    }): Promise<Record<string, string>>;
    saveAnswer(req: ExpressRequest & {
        user: any;
    }, saveDto: SaveAnswerDto): Promise<import("./schemas/question.schema").UserAnswer>;
}
