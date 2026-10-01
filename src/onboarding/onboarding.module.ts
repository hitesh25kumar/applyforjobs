import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingController } from './onboarding.controller';
import { Profile, ProfileSchema } from '../profile/schemas/profile.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
        AuthModule,
    ],
    controllers: [OnboardingController],
})
export class OnboardingModule { }
