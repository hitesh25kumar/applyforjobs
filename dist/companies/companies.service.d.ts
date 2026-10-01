import { Model } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesService {
    private companyModel;
    constructor(companyModel: Model<CompanyDocument>);
    create(createCompanyDto: CreateCompanyDto): Promise<Company[]>;
    findAll(): Promise<Company[]>;
    findOne(id: string): Promise<Company>;
    findPending(): Promise<Company[]>;
    update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company>;
    remove(id: string): Promise<void>;
    resetToPending(id: string): Promise<Company>;
}
