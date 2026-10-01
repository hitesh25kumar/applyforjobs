import { Model } from 'mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { QuestionAnswer, QuestionAnswerDocument } from './schemas/question-answer.schema';
import { CreateApplicationWithQuestionsDto } from './dto/create-application.dto';
export declare class ApplicationsService {
    private applicationModel;
    private questionAnswerModel;
    constructor(applicationModel: Model<ApplicationDocument>, questionAnswerModel: Model<QuestionAnswerDocument>);
    create(createDto: CreateApplicationWithQuestionsDto): Promise<{
        application: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Application, {}, import("mongoose").DefaultSchemaOptions> & Application & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Application, {}, import("mongoose").DefaultSchemaOptions> & Application & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
        message: string;
    }>;
    findAll(firebaseUid: string, page?: number, limit?: number, platform?: string, status?: string): Promise<{
        applications: (import("mongoose").Document<unknown, {}, Application, {}, import("mongoose").DefaultSchemaOptions> & Application & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, firebaseUid: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Application, {}, import("mongoose").DefaultSchemaOptions> & Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Application, {}, import("mongoose").DefaultSchemaOptions> & Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getQuestions(applicationId: string, firebaseUid: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, QuestionAnswer, {}, import("mongoose").DefaultSchemaOptions> & QuestionAnswer & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, QuestionAnswer, {}, import("mongoose").DefaultSchemaOptions> & QuestionAnswer & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    getStats(firebaseUid: string): Promise<{
        total: number;
        today: number;
        successRate: string;
        byPlatform: any;
        byStatus: any;
    }>;
}
