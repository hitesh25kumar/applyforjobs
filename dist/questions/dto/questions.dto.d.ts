export declare class CreateQuestionDto {
    text: string;
    type?: string;
    category?: string;
}
export declare class SaveAnswerDto {
    questionId: string;
    answer: string;
}
