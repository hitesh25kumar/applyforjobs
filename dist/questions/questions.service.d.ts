import { Model } from 'mongoose';
import { Question, QuestionDocument, UserAnswer, UserAnswerDocument } from './schemas/question.schema';
export declare class QuestionsService {
    private questionModel;
    private userAnswerModel;
    constructor(questionModel: Model<QuestionDocument>, userAnswerModel: Model<UserAnswerDocument>);
    create(text: string, type?: string, category?: string): Promise<Question>;
    findAll(firebaseUid: string): Promise<any[]>;
    getAnswerMap(firebaseUid: string): Promise<Record<string, string>>;
    saveAnswer(firebaseUid: string, questionId: string, answer: string): Promise<UserAnswer>;
}
