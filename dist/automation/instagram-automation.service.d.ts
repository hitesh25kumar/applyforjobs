export declare class InstagramAutomationService {
    private readonly logger;
    private engine;
    constructor();
    runAutomation(message: string, maxMessages: number, useRequests?: boolean, clearData?: boolean): Promise<{
        success: boolean;
        count: number;
        message: string;
    }>;
}
