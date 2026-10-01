"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const application_schema_1 = require("./schemas/application.schema");
const question_answer_schema_1 = require("./schemas/question-answer.schema");
let ApplicationsService = class ApplicationsService {
    constructor(applicationModel, questionAnswerModel) {
        this.applicationModel = applicationModel;
        this.questionAnswerModel = questionAnswerModel;
    }
    async create(createDto) {
        const application = await this.applicationModel.create({
            firebaseUid: createDto.firebaseUid,
            platform: createDto.platform,
            companyName: createDto.companyName,
            jobTitle: createDto.jobTitle,
            jobUrl: createDto.jobUrl,
            location: createDto.location,
            status: createDto.status || 'Applied',
            success: createDto.success !== false,
            errorMessage: createDto.errorMessage,
            jobDescription: createDto.jobDescription,
            salary: createDto.salary,
            questions: createDto.questions || [],
        });
        if (createDto.questions && createDto.questions.length > 0) {
            const questionAnswers = createDto.questions.map(q => ({
                applicationId: application._id,
                firebaseUid: createDto.firebaseUid,
                platform: createDto.platform,
                question: q.question,
                answer: q.answer,
                fieldType: q.fieldType,
                category: q.category,
            }));
            await this.questionAnswerModel.insertMany(questionAnswers);
        }
        return {
            application,
            message: 'Application saved successfully',
        };
    }
    async findAll(firebaseUid, page = 1, limit = 20, platform, status) {
        const query = { firebaseUid };
        if (platform) {
            query.platform = platform;
        }
        if (status) {
            query.status = status;
        }
        const skip = (page - 1) * limit;
        const [applications, total] = await Promise.all([
            this.applicationModel
                .find(query)
                .sort({ appliedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.applicationModel.countDocuments(query),
        ]);
        return {
            applications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, firebaseUid) {
        const application = await this.applicationModel.findOne({
            _id: id,
            firebaseUid,
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        return application;
    }
    async getQuestions(applicationId, firebaseUid) {
        await this.findOne(applicationId, firebaseUid);
        const questions = await this.questionAnswerModel.find({
            applicationId,
            firebaseUid,
        }).sort({ createdAt: 1 });
        return questions;
    }
    async getStats(firebaseUid) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const [total, todayCount, byPlatform, byStatus] = await Promise.all([
            this.applicationModel.countDocuments({ firebaseUid }),
            this.applicationModel.countDocuments({
                firebaseUid,
                appliedAt: { $gte: today },
            }),
            this.applicationModel.aggregate([
                { $match: { firebaseUid } },
                { $group: { _id: '$platform', count: { $sum: 1 } } },
            ]),
            this.applicationModel.aggregate([
                { $match: { firebaseUid } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
        ]);
        const successCount = await this.applicationModel.countDocuments({
            firebaseUid,
            success: true,
        });
        const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;
        return {
            total,
            today: todayCount,
            successRate: `${successRate}%`,
            byPlatform: byPlatform.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            byStatus: byStatus.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
        };
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(application_schema_1.Application.name)),
    __param(1, (0, mongoose_1.InjectModel)(question_answer_schema_1.QuestionAnswer.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map