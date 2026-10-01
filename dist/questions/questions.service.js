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
exports.QuestionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const question_schema_1 = require("./schemas/question.schema");
let QuestionsService = class QuestionsService {
    constructor(questionModel, userAnswerModel) {
        this.questionModel = questionModel;
        this.userAnswerModel = userAnswerModel;
    }
    async create(text, type = 'text', category = 'general') {
        const normalizedText = text.trim();
        return this.questionModel.findOneAndUpdate({ text: normalizedText }, {
            $setOnInsert: { text: normalizedText, type, category }
        }, { upsert: true, new: true }).exec();
    }
    async findAll(firebaseUid) {
        const questions = await this.questionModel.find().sort({ usageCount: -1, createdAt: -1 }).lean().exec();
        const userAnswers = await this.userAnswerModel.find({ firebaseUid }).lean().exec();
        const answerMap = new Map();
        userAnswers.forEach(ans => answerMap.set(ans.questionId.toString(), ans.answer));
        return questions.map(q => ({
            ...q,
            userAnswer: answerMap.get(q._id.toString()) || ''
        }));
    }
    async getAnswerMap(firebaseUid) {
        const userAnswers = await this.userAnswerModel.find({ firebaseUid }).populate('questionId').lean().exec();
        const map = {};
        userAnswers.forEach((ua) => {
            if (ua.questionId && ua.questionId.text) {
                map[ua.questionId.text.toLowerCase()] = ua.answer;
            }
        });
        return map;
    }
    async saveAnswer(firebaseUid, questionId, answer) {
        return this.userAnswerModel.findOneAndUpdate({ firebaseUid, questionId }, { answer }, { upsert: true, new: true }).exec();
    }
};
exports.QuestionsService = QuestionsService;
exports.QuestionsService = QuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(question_schema_1.Question.name)),
    __param(1, (0, mongoose_1.InjectModel)(question_schema_1.UserAnswer.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], QuestionsService);
//# sourceMappingURL=questions.service.js.map