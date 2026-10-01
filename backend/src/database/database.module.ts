import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri && process.env.NODE_ENV === 'production') {
          throw new Error('MONGODB_URI must be set in production');
        }
        return { uri: uri || 'mongodb://localhost:27017/job-applyer' };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule { }
