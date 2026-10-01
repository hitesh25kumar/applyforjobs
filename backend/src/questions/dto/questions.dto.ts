import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateQuestionDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsString()
    @IsOptional()
    type?: string;

    @IsString()
    @IsOptional()
    category?: string;
}

export class SaveAnswerDto {
    @IsString()
    @IsNotEmpty()
    questionId: string;

    @IsString()
    @IsNotEmpty()
    answer: string;
}
