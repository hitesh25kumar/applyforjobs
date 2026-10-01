import { CompanyStatus } from '../schemas/company.schema';

export class UpdateCompanyDto {
    websiteUrl?: string;
    careersPageUrl?: string;
    status?: CompanyStatus;
    logs?: string[];
}
