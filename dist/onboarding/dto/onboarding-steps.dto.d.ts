export declare class BasicInfoDto {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    preferredCity?: string;
    preferredCountry?: string;
    yearsOfExperience?: number;
}
export declare class ProfessionalInfoDto {
    currentJobTitle?: string;
    preferredJobTitles?: string[];
    preferredLocations?: string[];
    noticePeriod?: string;
    currentCTC?: string;
    expectedCTC?: string;
}
export declare class ResumeLinksDto {
    resumePath?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
}
export declare class MetadataDto {
    education?: Array<{
        institution: string;
        degree: string;
        year: string;
    }>;
    experience?: Array<{
        company: string;
        title: string;
        duration: string;
        description: string;
    }>;
    techStack?: string[];
    skillsExperience?: Array<{
        skill: string;
        years: number;
    }>;
}
