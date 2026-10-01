import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, SaveAnswerDto } from './dto/questions.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('questions')
export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) { }

    @Post()
    async create(@Body() createDto: CreateQuestionDto) {
        // This endpoint might be called by the automation script which might not have a user token
        // For now, let's allow it to be public or use a simplified guard if needed
        // But the requirements say "Scrap Linkedin and add all questions", likely from the user's running session
        return this.questionsService.create(createDto.text, createDto.type, createDto.category);
    }

    @UseGuards(FirebaseAuthGuard)
    @Get()
    async findAll(@Request() req: ExpressRequest & { user: any }) {
        return this.questionsService.findAll(req.user.firebaseUid);
    }

    @UseGuards(FirebaseAuthGuard)
    @Get('map')
    async getAnswerMap(@Request() req: ExpressRequest & { user: any }) {
        return this.questionsService.getAnswerMap(req.user.firebaseUid);
    }

    @UseGuards(FirebaseAuthGuard)
    @Post('answer')
    async saveAnswer(
        @Request() req: ExpressRequest & { user: any },
        @Body() saveDto: SaveAnswerDto
    ) {
        return this.questionsService.saveAnswer(req.user.firebaseUid, saveDto.questionId, saveDto.answer);
    }
}
