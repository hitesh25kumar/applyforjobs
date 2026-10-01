import { CompanyStatus } from '../schemas/company.schema';
export declare class UpdateCompanyDto {
    websiteUrl?: string;
    careersPageUrl?: string;
    status?: CompanyStatus;
    logs?: string[];
}
