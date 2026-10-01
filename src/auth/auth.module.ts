import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile, ProfileSchema } from '../profile/schemas/profile.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
    ],
    providers: [FirebaseService, FirebaseAuthGuard],
    controllers: [AuthController],
    exports: [FirebaseService, FirebaseAuthGuard],
})
export class AuthModule { }
