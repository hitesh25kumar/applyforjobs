import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { QuestionAnswer, QuestionAnswerDocument } from './schemas/question-answer.schema';
import { CreateApplicationWithQuestionsDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
    constructor(
        @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
        @InjectModel(QuestionAnswer.name) private questionAnswerModel: Model<QuestionAnswerDocument>,
    ) { }

    async create(createDto: CreateApplicationWithQuestionsDto) {
        // Create application
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

        // Create question-answers if provided
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

    async findAll(
        firebaseUid: string,
        page: number = 1,
        limit: number = 20,
        platform?: string,
        status?: string,
    ) {
        const query: any = { firebaseUid };

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

    async findOne(id: string, firebaseUid: string) {
        const application = await this.applicationModel.findOne({
            _id: id,
            firebaseUid,
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        return application;
    }

    async getQuestions(applicationId: string, firebaseUid: string) {
        // Verify application belongs to user
        await this.findOne(applicationId, firebaseUid);

        const questions = await this.questionAnswerModel.find({
            applicationId,
            firebaseUid,
        }).sort({ createdAt: 1 });

        return questions;
    }

    async getStats(firebaseUid: string) {
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
}
