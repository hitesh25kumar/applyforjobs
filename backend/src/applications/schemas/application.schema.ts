import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ApplicationDocument = HydratedDocument<Application>;

@Schema({ timestamps: true })
export class Application {
    @Prop({ required: true })
    firebaseUid: string; // User reference

    @Prop({ required: true })
    platform: string; // 'LinkedIn', 'Naukri', 'External'

    @Prop({ required: true })
    companyName: string;

    @Prop({ required: true })
    jobTitle: string;

    @Prop()
    jobUrl: string;

    @Prop()
    location: string;

    @Prop({ default: 'Applied' })
    status: string; // 'Applied', 'Viewed', 'Rejected', 'Interview', 'Offer'

    @Prop({ default: Date.now })
    appliedAt: Date;

    @Prop({ default: true })
    success: boolean;

    @Prop()
    errorMessage: string;

    @Prop()
    jobDescription: string; // Optional: store job description

    @Prop()
    salary: string; // Salary information if available

    @Prop({ type: [{ question: String, answer: String, fieldType: String, category: String }], default: [] })
    questions: Array<{
        question: string;
        answer: string;
        fieldType?: string;
        category?: string;
    }>;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
