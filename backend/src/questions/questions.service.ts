import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument, UserAnswer, UserAnswerDocument } from './schemas/question.schema';

@Injectable()
export class QuestionsService {
    constructor(
        @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
        @InjectModel(UserAnswer.name) private userAnswerModel: Model<UserAnswerDocument>,
    ) { }

    async create(text: string, type: string = 'text', category: string = 'general'): Promise<Question> {
        // Upsert: Try to find existing, if not create.
        // We use findOneAndUpdate with upsert to avoid race conditions and duplicates
        const normalizedText = text.trim();

        return this.questionModel.findOneAndUpdate(
            { text: normalizedText },
            {
                $setOnInsert: { text: normalizedText, type, category }
            },
            { upsert: true, new: true }
        ).exec();
    }

    async findAll(firebaseUid: string): Promise<any[]> {
        const questions = await this.questionModel.find().sort({ usageCount: -1, createdAt: -1 }).lean().exec();
        const userAnswers = await this.userAnswerModel.find({ firebaseUid }).lean().exec();

        // Map answers to questions
        const answerMap = new Map();
        userAnswers.forEach(ans => answerMap.set(ans.questionId.toString(), ans.answer));

        return questions.map(q => ({
            ...q,
            userAnswer: answerMap.get(q._id.toString()) || ''
        }));
    }

    // For automation internal use: get simple map for fast lookups
    async getAnswerMap(firebaseUid: string): Promise<Record<string, string>> {
        const userAnswers = await this.userAnswerModel.find({ firebaseUid }).populate('questionId').lean().exec();
        const map: Record<string, string> = {};

        userAnswers.forEach((ua: any) => {
            if (ua.questionId && ua.questionId.text) {
                map[ua.questionId.text.toLowerCase()] = ua.answer;
            }
        });

        return map;
    }

    async saveAnswer(firebaseUid: string, questionId: string, answer: string): Promise<UserAnswer> {
        return this.userAnswerModel.findOneAndUpdate(
            { firebaseUid, questionId },
            { answer },
            { upsert: true, new: true }
        ).exec();
    }
}
