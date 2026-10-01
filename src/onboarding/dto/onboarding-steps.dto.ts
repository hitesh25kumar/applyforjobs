import { IsEmail, IsOptional, IsString, IsArray, IsNumber, Min, Max } from 'class-validator';

export class BasicInfoDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    preferredCity?: string;

    @IsOptional()
    @IsString()
    preferredCountry?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(50)
    yearsOfExperience?: number;
}

export class ProfessionalInfoDto {
    @IsOptional()
    @IsString()
    currentJobTitle?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    preferredJobTitles?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    preferredLocations?: string[];

    @IsOptional()
    @IsString()
    noticePeriod?: string;

    @IsOptional()
    @IsString()
    currentCTC?: string;

    @IsOptional()
    @IsString()
    expectedCTC?: string;
}

export class ResumeLinksDto {
    @IsOptional()
    @IsString()
    resumePath?: string;

    @IsOptional()
    @IsString()
    linkedinUrl?: string;

    @IsOptional()
    @IsString()
    portfolioUrl?: string;

    @IsOptional()
    @IsString()
    githubUrl?: string;
}

export class MetadataDto {
    @IsOptional()
    @IsArray()
    education?: Array<{
        institution: string;
        degree: string;
        year: string;
    }>;

    @IsOptional()
    @IsArray()
    experience?: Array<{
        company: string;
        title: string;
        duration: string;
        description: string;
    }>;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    techStack?: string[];

    @IsOptional()
    @IsArray()
    skillsExperience?: Array<{
        skill: string;
        years: number;
    }>;
}
