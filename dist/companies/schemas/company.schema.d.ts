import { HydratedDocument } from 'mongoose';
export type CompanyDocument = HydratedDocument<Company>;
export declare enum CompanyStatus {
    PENDING = "PENDING",
    RESOLVED = "RESOLVED",
    FAILED = "FAILED"
}
export declare class Company {
    name: string;
    websiteUrl: string;
    careersPageUrl: string;
    status: CompanyStatus;
    logs: string[];
}
export declare const CompanySchema: import("mongoose").Schema<Company, import("mongoose").Model<Company, any, any, any, (import("mongoose").Document<unknown, any, Company, any, import("mongoose").DefaultSchemaOptions> & Company & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (import("mongoose").Document<unknown, any, Company, any, import("mongoose").DefaultSchemaOptions> & Company & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, Company>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Company, import("mongoose").Document<unknown, {}, Company, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Company & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Company, import("mongoose").Document<unknown, {}, Company, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Company & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    websiteUrl?: import("mongoose").SchemaDefinitionProperty<string, Company, import("mongoose").Document<unknown, {}, Company, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Company & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    careersPageUrl?: import("mongoose").SchemaDefinitionProperty<string, Company, import("mongoose").Document<unknown, {}, Company, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Company & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<CompanyStatus, Company, import("mongoose").Document<unknown, {}, Company, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Company & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    logs?: import("mongoose").SchemaDefinitionProperty<string[], Company, import("mongoose").Document<unknown, {}, Company, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Company & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Company>;
