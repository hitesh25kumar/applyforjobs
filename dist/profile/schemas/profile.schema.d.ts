import { HydratedDocument } from 'mongoose';
export type ProfileDocument = HydratedDocument<Profile>;
export declare class WorkExperience {
    company: string;
    title: string;
    duration: string;
    description: string;
}
export declare class Education {
    institution: string;
    degree: string;
    year: string;
}
export declare class SkillExperience {
    skill: string;
    years: number;
}
export declare class Profile {
    firstName: string;
    lastName: string;
    email: string;
    photoURL: string;
    jobKeywords: string[];
    preferredCity: string;
    preferredCountry: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coverLetter: string;
    coverLetterFile: Buffer;
    coverLetterFileName: string;
    resumeFilePath: string;
    resumeFile: Buffer;
    resumeFileName: string;
    techStack: string[];
    dateAvailable: string;
    desiredPay: string;
    rightToWork: string;
    comfortableCommuting: string;
    phone: string;
    linkedinUrl: string;
    portfolioUrl: string;
    githubUrl: string;
    resumePath: string;
    resumeText: string;
    bio: string;
    currentCTC: string;
    expectedCTC: string;
    noticePeriod: string;
    noticePeriodDays: number;
    yearsOfExperience: string;
    nodeJsExperience: string;
    reactJsExperience: string;
    angularExperience: string;
    mernStackExperience: string;
    pythonExperience: string;
    javaExperience: string;
    dotNetExperience: string;
    technologyExperience: Map<string, string>;
    productManagementExperience: string;
    canJoinIn15Days: string;
    agileScrumExperience: string;
    openToHybrid: string;
    techConceptsKnowledge: string;
    strategicRoadmapExperience: string;
    aiExperience: string;
    ecommerceOTTExperience: string;
    growthProductExperience: string;
    experience: WorkExperience[];
    education: Education[];
    savedAnswers: Array<{
        question: string;
        answer: string;
        category?: string;
    }>;
    commonQuestions: Map<string, string>;
    questionMappings: Map<string, string>;
    unmappedQuestions: string[];
    skillsExperience: SkillExperience[];
    skipContactStepIfFilled: boolean;
    skipResumeStepIfFilled: boolean;
    domainsExperience: SkillExperience[];
    firebaseUid: string;
    onboardingCompleted: boolean;
    onboardingStep: number;
    accountCreatedAt: Date;
    lastLoginAt: Date;
    linkedinEnabled: boolean;
    naukriEnabled: boolean;
    externalEnabled: boolean;
    dailyApplyLimit: number;
    preferredJobTitles: string[];
    defaultJobKeyword: string;
    defaultLocation: string;
    defaultMaxJobs: number;
    reportedQuestions: string[];
    noExperience: number;
}
export declare const ProfileSchema: import("mongoose").Schema<Profile, import("mongoose").Model<Profile, any, any, any, (import("mongoose").Document<unknown, any, Profile, any, import("mongoose").DefaultSchemaOptions> & Profile & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (import("mongoose").Document<unknown, any, Profile, any, import("mongoose").DefaultSchemaOptions> & Profile & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, Profile>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Profile, import("mongoose").Document<unknown, {}, Profile, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    firstName?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lastName?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    email?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    photoURL?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    jobKeywords?: import("mongoose").SchemaDefinitionProperty<string[], Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    preferredCity?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    preferredCountry?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    address?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    city?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    state?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    zipCode?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    coverLetter?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    coverLetterFile?: import("mongoose").SchemaDefinitionProperty<Buffer<ArrayBufferLike>, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    coverLetterFileName?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    resumeFilePath?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    resumeFile?: import("mongoose").SchemaDefinitionProperty<Buffer<ArrayBufferLike>, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    resumeFileName?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    techStack?: import("mongoose").SchemaDefinitionProperty<string[], Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    dateAvailable?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    desiredPay?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    rightToWork?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    comfortableCommuting?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    phone?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    linkedinUrl?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    portfolioUrl?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    githubUrl?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    resumePath?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    resumeText?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    bio?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    currentCTC?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    expectedCTC?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    noticePeriod?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    noticePeriodDays?: import("mongoose").SchemaDefinitionProperty<number, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    yearsOfExperience?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    nodeJsExperience?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    reactJsExperience?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    angularExperience?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mernStackExperience?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    pythonExperience?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    javaExperience?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    dotNetExperience?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    technologyExperience?: import("mongoose").SchemaDefinitionProperty<Map<string, string>, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    productManagementExperience?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    canJoinIn15Days?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    agileScrumExperience?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    openToHybrid?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    techConceptsKnowledge?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    strategicRoadmapExperience?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    aiExperience?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    ecommerceOTTExperience?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    growthProductExperience?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    experience?: import("mongoose").SchemaDefinitionProperty<WorkExperience[], Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    education?: import("mongoose").SchemaDefinitionProperty<Education[], Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    savedAnswers?: import("mongoose").SchemaDefinitionProperty<{
        question: string;
        answer: string;
        category?: string;
    }[], Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    commonQuestions?: import("mongoose").SchemaDefinitionProperty<Map<string, string>, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    questionMappings?: import("mongoose").SchemaDefinitionProperty<Map<string, string>, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    unmappedQuestions?: import("mongoose").SchemaDefinitionProperty<string[], Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    skillsExperience?: import("mongoose").SchemaDefinitionProperty<SkillExperience[], Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    skipContactStepIfFilled?: import("mongoose").SchemaDefinitionProperty<boolean, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    skipResumeStepIfFilled?: import("mongoose").SchemaDefinitionProperty<boolean, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    domainsExperience?: import("mongoose").SchemaDefinitionProperty<SkillExperience[], Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    firebaseUid?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    onboardingCompleted?: import("mongoose").SchemaDefinitionProperty<boolean, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    onboardingStep?: import("mongoose").SchemaDefinitionProperty<number, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    accountCreatedAt?: import("mongoose").SchemaDefinitionProperty<Date, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    lastLoginAt?: import("mongoose").SchemaDefinitionProperty<Date, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    linkedinEnabled?: import("mongoose").SchemaDefinitionProperty<boolean, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    naukriEnabled?: import("mongoose").SchemaDefinitionProperty<boolean, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    externalEnabled?: import("mongoose").SchemaDefinitionProperty<boolean, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    dailyApplyLimit?: import("mongoose").SchemaDefinitionProperty<number, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    preferredJobTitles?: import("mongoose").SchemaDefinitionProperty<string[], Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    defaultJobKeyword?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    defaultLocation?: import("mongoose").SchemaDefinitionProperty<string, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    defaultMaxJobs?: import("mongoose").SchemaDefinitionProperty<number, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    reportedQuestions?: import("mongoose").SchemaDefinitionProperty<string[], Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    noExperience?: import("mongoose").SchemaDefinitionProperty<number, Profile, import("mongoose").Document<unknown, {}, Profile, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Profile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Profile>;
