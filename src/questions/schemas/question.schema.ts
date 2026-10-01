import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionDocument = Question & Document;
export type UserAnswerDocument = UserAnswer & Document;

@Schema({ timestamps: true })
export class Question {
    @Prop({ required: true, unique: true })
    text: string;

    @Prop({ default: 'text' })
    type: string;

    @Prop({ default: 'general' })
    category: string;

    @Prop({ default: 0 })
    usageCount: number;
}

@Schema({ timestamps: true })
export class UserAnswer {
    @Prop({ required: true })
    firebaseUid: string;

    @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
    questionId: Types.ObjectId;

    @Prop({ required: true })
    answer: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
export const UserAnswerSchema = SchemaFactory.createForClass(UserAnswer);
