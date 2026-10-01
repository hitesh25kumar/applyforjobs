import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApplicationsService } from './applications.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CreateApplicationWithQuestionsDto } from './dto/create-application.dto';

@Controller('applications')
@UseGuards(FirebaseAuthGuard)
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) { }

    @Post()
    async create(
        @Request() req: ExpressRequest & { user: any },
        @Body() createDto: CreateApplicationWithQuestionsDto
    ) {
        // Ensure firebaseUid matches authenticated user
        createDto.firebaseUid = req.user.firebaseUid;
        return this.applicationsService.create(createDto);
    }

    @Get()
    async findAll(
        @Request() req: ExpressRequest & { user: any },
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('platform') platform?: string,
        @Query('status') status?: string,
    ) {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        return this.applicationsService.findAll(
            req.user.firebaseUid,
            pageNum,
            limitNum,
            platform,
            status
        );
    }

    @Get('stats')
    async getStats(@Request() req: ExpressRequest & { user: any }) {
        return this.applicationsService.getStats(req.user.firebaseUid);
    }

    @Get(':id')
    async findOne(
        @Request() req: ExpressRequest & { user: any },
        @Param('id') id: string
    ) {
        return this.applicationsService.findOne(id, req.user.firebaseUid);
    }

    @Get(':id/questions')
    async getQuestions(
        @Request() req: ExpressRequest & { user: any },
        @Param('id') id: string
    ) {
        return this.applicationsService.getQuestions(id, req.user.firebaseUid);
    }
}
