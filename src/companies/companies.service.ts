import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument, CompanyStatus } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
    constructor(
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    ) { }

    async create(createCompanyDto: CreateCompanyDto): Promise<Company[]> {
        const createdCompanies = [];
        for (const name of createCompanyDto.names) {
            // Check if exists
            const exists = await this.companyModel.findOne({ name });
            if (!exists) {
                const company = new this.companyModel({ name });
                createdCompanies.push(await company.save());
            }
        }
        return createdCompanies;
    }

    async findAll(): Promise<Company[]> {
        return this.companyModel.find().exec();
    }

    async findOne(id: string): Promise<Company> {
        const company = await this.companyModel.findById(id).exec();
        if (!company) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }
        return company;
    }

    async findPending(): Promise<Company[]> {
        return this.companyModel.find({ status: CompanyStatus.PENDING }).exec();
    }

    async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
        const company = await this.companyModel.findByIdAndUpdate(id, updateCompanyDto, { new: true }).exec();
        if (!company) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }
        return company;
    }

    async remove(id: string): Promise<void> {
        const result = await this.companyModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }
    }

    async resetToPending(id: string): Promise<Company> {
        return this.update(id, { status: CompanyStatus.PENDING, logs: [] });
    }
}
