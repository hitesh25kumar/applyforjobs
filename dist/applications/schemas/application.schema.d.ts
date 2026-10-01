import { HydratedDocument } from 'mongoose';
export type ApplicationDocument = HydratedDocument<Application>;
export declare class Application {
    firebaseUid: string;
    platform: string;
    companyName: string;
    jobTitle: string;
    jobUrl: string;
    location: string;
    status: string;
    appliedAt: Date;
    success: boolean;
    errorMessage: string;
    jobDescription: string;
    salary: string;
    questions: Array<{
        question: string;
        answer: string;
        fieldType?: string;
        category?: string;
    }>;
}
export declare const ApplicationSchema: import("mongoose").Schema<Application, import("mongoose").Model<Application, any, any, any, (import("mongoose").Document<unknown, any, Application, any, import("mongoose").DefaultSchemaOptions> & Application & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (import("mongoose").Document<unknown, any, Application, any, import("mongoose").DefaultSchemaOptions> & Application & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, Application>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Application, import("mongoose").Document<unknown, {}, Application, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Application & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    firebaseUid?: import("mongoose").SchemaDefinitionProperty<string, Application, import("mongoose").Document<unknown, {}, Application, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    platform?: import("mongoose").SchemaDefinitionProperty<string, Application, import("mongoose").Document<unknown, {}, Application, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    companyName?: import("mongoose").SchemaDefinitionProperty<string, Application, import("mongoose").Document<unknown, {}, Application, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    jobTitle?: import("mongoose").SchemaDefinitionProperty<string, Application, import("mongoose").Document<unknown, {}, Application, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    jobUrl?: import("mongoose").SchemaDefinitionProperty<string, Application, import("mongoose").Document<unknown, {}, Application, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    location?: import("mongoose").SchemaDefinitionProperty<string, Application, import("mongoose").Document<unknown, {}, Application, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, Application, import("mongoose").Document<unknown, {}, Application, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    appliedAt?: import("mongoose").SchemaDefinitionProperty<Date, Application, import("mongoose").Document<unknown, {}, Application, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    success?: import("mongoose").SchemaDefinitionProperty<boolean, Application, import("mongoose").Document<unknown, {}, Application, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    errorMessage?: import("mongoose").SchemaDefinitionProperty<string, Application, import("mongoose").Document<unknown, {}, Application, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    jobDescription?: import("mongoose").SchemaDefinitionProperty<string, Application, import("mongoose").Document<unknown, {}, Application, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    salary?: import("mongoose").SchemaDefinitionProperty<string, Application, import("mongoose").Document<unknown, {}, Application, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    questions?: import("mongoose").SchemaDefinitionProperty<{
        question: string;
        answer: string;
        fieldType?: string;
        category?: string;
    }[], Application, import("mongoose").Document<unknown, {}, Application, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Application>;
