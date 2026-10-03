import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    city?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
    bio?: string;
    currentCTC?: string;
    expectedCTC?: string;
    noticePeriod?: string;
    yearsOfExperience?: string;
    productManagementExperience?: string;
    canJoinIn15Days?: string;
    agileScrumExperience?: string;
    openToHybrid?: string;
    techConceptsKnowledge?: string;
    strategicRoadmapExperience?: string;
    aiExperience?: string;
    ecommerceOTTExperience?: string;
    growthProductExperience?: string;
    commonQuestions?: Record<string, string>;
    questionMappings?: Record<string, string>;
    unmappedQuestions?: string[];
    skillsExperience?: { skill: string; years: number }[];
    skipContactStepIfFilled?: boolean;
    skipResumeStepIfFilled?: boolean;
    domainsExperience?: { skill: string; years: number }[];

    @IsOptional()
    @IsString()
    defaultJobKeyword?: string;

    @IsOptional()
    @IsString()
    defaultLocation?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    defaultMaxJobs?: number;
    reportedQuestions?: string[];
    noExperience?: number;
}
