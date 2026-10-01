import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Controller('companies')
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) { }

    @Post()
    create(@Body() createCompanyDto: CreateCompanyDto) {
        return this.companiesService.create(createCompanyDto);
    }

    @Get()
    findAll() {
        return this.companiesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.companiesService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.companiesService.remove(id);
    }

    @Patch(':id/reset')
    resetToPending(@Param('id') id: string) {
        return this.companiesService.resetToPending(id);
    }
}
