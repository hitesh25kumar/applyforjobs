export declare class StartLinkedInAutomationDto {
    keyword: string;
    location?: string;
    maxJobs?: number;
}
export declare class StartNaukriAutomationDto {
    keyword?: string;
    maxJobs?: number;
    headless?: boolean;
}
export declare class StartInstagramAutomationDto {
    message: string;
    maxMessages?: number;
    useRequests?: boolean;
    clearData?: boolean;
}
