import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
export type QuestionAnswerDocument = HydratedDocument<QuestionAnswer>;
export declare class QuestionAnswer {
    applicationId: mongoose.Types.ObjectId;
    firebaseUid: string;
    question: string;
    answer: string;
    fieldType: string;
    category: string;
    platform: string;
}
export declare const QuestionAnswerSchema: mongoose.Schema<QuestionAnswer, mongoose.Model<QuestionAnswer, any, any, any, (mongoose.Document<unknown, any, QuestionAnswer, any, mongoose.DefaultSchemaOptions> & QuestionAnswer & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (mongoose.Document<unknown, any, QuestionAnswer, any, mongoose.DefaultSchemaOptions> & QuestionAnswer & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}), any, QuestionAnswer>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, QuestionAnswer, mongoose.Document<unknown, {}, QuestionAnswer, {
    id: string;
}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<QuestionAnswer & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    applicationId?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, QuestionAnswer, mongoose.Document<unknown, {}, QuestionAnswer, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<QuestionAnswer & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    firebaseUid?: mongoose.SchemaDefinitionProperty<string, QuestionAnswer, mongoose.Document<unknown, {}, QuestionAnswer, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<QuestionAnswer & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    question?: mongoose.SchemaDefinitionProperty<string, QuestionAnswer, mongoose.Document<unknown, {}, QuestionAnswer, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<QuestionAnswer & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    answer?: mongoose.SchemaDefinitionProperty<string, QuestionAnswer, mongoose.Document<unknown, {}, QuestionAnswer, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<QuestionAnswer & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    fieldType?: mongoose.SchemaDefinitionProperty<string, QuestionAnswer, mongoose.Document<unknown, {}, QuestionAnswer, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<QuestionAnswer & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    category?: mongoose.SchemaDefinitionProperty<string, QuestionAnswer, mongoose.Document<unknown, {}, QuestionAnswer, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<QuestionAnswer & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    platform?: mongoose.SchemaDefinitionProperty<string, QuestionAnswer, mongoose.Document<unknown, {}, QuestionAnswer, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<QuestionAnswer & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, QuestionAnswer>;
