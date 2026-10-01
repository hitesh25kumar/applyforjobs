import { IsString, IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';

export class StartLinkedInAutomationDto {
    @IsString()
    keyword: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    maxJobs?: number;
}

export class StartNaukriAutomationDto {
    @IsOptional()
    @IsString()
    keyword?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    maxJobs?: number;

    @IsOptional()
    @IsBoolean()
    headless?: boolean;
}

export class StartInstagramAutomationDto {
    @IsString()
    message: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    maxMessages?: number;

    @IsOptional()
    @IsBoolean()
    useRequests?: boolean;

    @IsOptional()
    @IsBoolean()
    clearData?: boolean;
}

