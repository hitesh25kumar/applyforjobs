import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    create(createCompanyDto: CreateCompanyDto): Promise<import("./schemas/company.schema").Company[]>;
    findAll(): Promise<import("./schemas/company.schema").Company[]>;
    findOne(id: string): Promise<import("./schemas/company.schema").Company>;
    remove(id: string): Promise<void>;
    resetToPending(id: string): Promise<import("./schemas/company.schema").Company>;
}
