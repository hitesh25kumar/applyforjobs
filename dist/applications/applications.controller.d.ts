import { Request as ExpressRequest } from 'express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationWithQuestionsDto } from './dto/create-application.dto';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    create(req: ExpressRequest & {
        user: any;
    }, createDto: CreateApplicationWithQuestionsDto): Promise<{
        application: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/application.schema").Application, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/application.schema").Application & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("./schemas/application.schema").Application, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/application.schema").Application & {
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
    findAll(req: ExpressRequest & {
        user: any;
    }, page?: string, limit?: string, platform?: string, status?: string): Promise<{
        applications: (import("mongoose").Document<unknown, {}, import("./schemas/application.schema").Application, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/application.schema").Application & {
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
    getStats(req: ExpressRequest & {
        user: any;
    }): Promise<{
        total: number;
        today: number;
        successRate: string;
        byPlatform: any;
        byStatus: any;
    }>;
    findOne(req: ExpressRequest & {
        user: any;
    }, id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/application.schema").Application, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/application.schema").Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("./schemas/application.schema").Application, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/application.schema").Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getQuestions(req: ExpressRequest & {
        user: any;
    }, id: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/question-answer.schema").QuestionAnswer, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/question-answer.schema").QuestionAnswer & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("./schemas/question-answer.schema").QuestionAnswer, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/question-answer.schema").QuestionAnswer & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
}
