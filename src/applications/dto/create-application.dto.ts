export class CreateApplicationDto {
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

export class CreateQuestionAnswerDto {
    question: string;
    answer: string;
    fieldType?: string;
    category?: string;
}

export class CreateApplicationWithQuestionsDto extends CreateApplicationDto {
    questions?: CreateQuestionAnswerDto[];
}
