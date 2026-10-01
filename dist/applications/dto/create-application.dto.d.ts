export declare class CreateApplicationDto {
    firebaseUid: string;
    platform: string;
    companyName: string;
    jobTitle: string;
    jobUrl?: string;
    location?: string;
    status?: string;
    success?: boolean;
    errorMessage?: string;
    jobDescription?: string;
    salary?: string;
}
export declare class CreateQuestionAnswerDto {
    question: string;
    answer: string;
    fieldType?: string;
    category?: string;
}
export declare class CreateApplicationWithQuestionsDto extends CreateApplicationDto {
    questions?: CreateQuestionAnswerDto[];
}
