import { Document, Types } from 'mongoose';
export type QuestionDocument = Question & Document;
export type UserAnswerDocument = UserAnswer & Document;
export declare class Question {
    text: string;
    type: string;
    category: string;
    usageCount: number;
}
export declare class UserAnswer {
    firebaseUid: string;
    questionId: Types.ObjectId;
    answer: string;
}
export declare const QuestionSchema: import("mongoose").Schema<Question, import("mongoose").Model<Question, any, any, any, (Document<unknown, any, Question, any, import("mongoose").DefaultSchemaOptions> & Question & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Question, any, import("mongoose").DefaultSchemaOptions> & Question & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Question>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Question, Document<unknown, {}, Question, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Question & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    text?: import("mongoose").SchemaDefinitionProperty<string, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<string, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    category?: import("mongoose").SchemaDefinitionProperty<string, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    usageCount?: import("mongoose").SchemaDefinitionProperty<number, Question, Document<unknown, {}, Question, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Question & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Question>;
export declare const UserAnswerSchema: import("mongoose").Schema<UserAnswer, import("mongoose").Model<UserAnswer, any, any, any, (Document<unknown, any, UserAnswer, any, import("mongoose").DefaultSchemaOptions> & UserAnswer & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, UserAnswer, any, import("mongoose").DefaultSchemaOptions> & UserAnswer & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, UserAnswer>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserAnswer, Document<unknown, {}, UserAnswer, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<UserAnswer & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    firebaseUid?: import("mongoose").SchemaDefinitionProperty<string, UserAnswer, Document<unknown, {}, UserAnswer, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<UserAnswer & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    questionId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, UserAnswer, Document<unknown, {}, UserAnswer, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<UserAnswer & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    answer?: import("mongoose").SchemaDefinitionProperty<string, UserAnswer, Document<unknown, {}, UserAnswer, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<UserAnswer & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, UserAnswer>;
