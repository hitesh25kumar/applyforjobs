import { Controller, Get, Put, Patch, Body, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get()
    async getProfile() {
        return this.profileService.getProfile();
    }

    @Put()
    async updateProfile(@Body() updateProfileDto: UpdateProfileDto) {
        return this.profileService.updateProfile(updateProfileDto);
    }

    @Patch()
    async patchProfile(@Body() updateProfileDto: UpdateProfileDto) {
        return this.profileService.updateProfile(updateProfileDto);
    }

    @Post('upload-resume')
    @UseInterceptors(FileInterceptor('resume'))
    async uploadResume(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        await this.profileService.saveResume(file.buffer, file.originalname);
        return { message: 'Resume uploaded successfully', filename: file.originalname };
    }

    @Post('upload-cover-letter')
    @UseInterceptors(FileInterceptor('coverLetter'))
    async uploadCoverLetter(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        await this.profileService.saveCoverLetter(file.buffer, file.originalname);
        return { message: 'Cover letter uploaded successfully', filename: file.originalname };
    }

    @Post('report-question')
    async reportQuestion(@Body('question') question: string) {
        await this.profileService.reportQuestion(question);
        return { success: true };
    }
}
