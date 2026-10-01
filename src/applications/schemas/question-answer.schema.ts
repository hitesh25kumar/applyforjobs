import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

export type QuestionAnswerDocument = HydratedDocument<QuestionAnswer>;

@Schema({ timestamps: true })
export class QuestionAnswer {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Application' })
    applicationId: mongoose.Types.ObjectId; // Link to Application

    @Prop({ required: true })
    firebaseUid: string; // User reference for easy querying

    @Prop({ required: true })
    question: string; // The question text

    @Prop({ required: true })
    answer: string; // The answer provided

    @Prop()
    fieldType: string; // 'text', 'select', 'radio', 'checkbox', 'textarea'

    @Prop()
    category: string; // 'experience', 'salary', 'availability', 'skills', 'other'

    @Prop()
    platform: string; // 'LinkedIn', 'Naukri' - for easier filtering
}

export const QuestionAnswerSchema = SchemaFactory.createForClass(QuestionAnswer);

// Index for faster queries
QuestionAnswerSchema.index({ applicationId: 1 });
QuestionAnswerSchema.index({ firebaseUid: 1 });
