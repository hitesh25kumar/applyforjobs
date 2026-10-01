import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CompanyDocument = HydratedDocument<Company>;

export enum CompanyStatus {
    PENDING = 'PENDING',
    RESOLVED = 'RESOLVED',
    FAILED = 'FAILED',
}

@Schema({ timestamps: true })
export class Company {
    @Prop({ required: true })
    name: string;

    @Prop()
    websiteUrl: string;

    @Prop()
    careersPageUrl: string;

    @Prop({ type: String, enum: CompanyStatus, default: CompanyStatus.PENDING })
    status: CompanyStatus;

    @Prop([String])
    logs: string[];
}

export const CompanySchema = SchemaFactory.createForClass(Company);
