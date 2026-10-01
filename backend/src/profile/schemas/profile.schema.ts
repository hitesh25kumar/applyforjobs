import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema()
export class WorkExperience {
    @Prop() company: string;
    @Prop() title: string;
    @Prop() duration: string;
    @Prop() description: string;
}

@Schema()
export class Education {
    @Prop() institution: string;
    @Prop() degree: string;
    @Prop() year: string;
}

@Schema()
export class SkillExperience {
    @Prop() skill: string;
    @Prop() years: number;
}

@Schema({ timestamps: true })
export class Profile {
    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true })
    email: string;

    @Prop()
    photoURL: string; // Profile image from Google OAuth or uploaded

    @Prop([String])
    jobKeywords: string[];

    @Prop()
    preferredCity: string;

    @Prop()
    preferredCountry: string;

    // Address Information
    @Prop()
    address: string;

    @Prop()
    city: string;

    @Prop()
    state: string;

    @Prop()
    zipCode: string;

    // Application Materials
    @Prop()
    coverLetter: string;

    @Prop({ type: Buffer })
    coverLetterFile: Buffer; // Cover letter file stored in DB

    @Prop()
    coverLetterFileName: string; // Original filename

    @Prop()
    resumeFilePath: string;

    @Prop({ type: Buffer })
    resumeFile: Buffer; // PDF file stored in DB

    @Prop()
    resumeFileName: string; // Original filename

    @Prop({ type: [String] })
    techStack: string[];

    @Prop()
    dateAvailable: string; // Date available to start

    @Prop()
    desiredPay: string; // Desired salary

    @Prop()
    rightToWork: string; // 'Yes' or 'No'

    @Prop()
    comfortableCommuting: string; // 'Yes' or 'No'

    @Prop()
    phone: string;

    @Prop()
    linkedinUrl: string;

    @Prop()
    portfolioUrl: string;

    @Prop()
    githubUrl: string;

    @Prop()
    resumePath: string; // Path to PDF file

    @Prop()
    resumeText: string; // Extracted text for AI context

    @Prop()
    bio: string; // Summary for "Tell me about yourself"

    @Prop()
    currentCTC: string;

    @Prop()
    expectedCTC: string;

    @Prop()
    noticePeriod: string; // Text: "Immediate", "15 Days", "1 Month", etc.

    @Prop()
    noticePeriodDays: number; // Numeric value for forms (0 for Immediate, 15, 30, etc.)

    @Prop()
    yearsOfExperience: string;

    // Technology-Specific Experience (for LinkedIn/Naukri detailed questions)
    @Prop()
    nodeJsExperience: string; // Years of Node.js experience

    @Prop()
    reactJsExperience: string; // Years of React.js experience

    @Prop()
    angularExperience: string; // Years of Angular experience

    @Prop()
    mernStackExperience: string; // Years of MERN stack experience

    @Prop()
    pythonExperience: string; // Years of Python experience

    @Prop()
    javaExperience: string; // Years of Java experience

    @Prop()
    dotNetExperience: string; // Years of .NET experience

    @Prop({ type: Map, of: String })
    technologyExperience: Map<string, string>; // Flexible tech->years mapping for any technology

    @Prop()
    productManagementExperience: string;

    @Prop()
    canJoinIn15Days: string; // 'Yes' or 'No'

    @Prop()
    agileScrumExperience: string; // 'Yes' or 'No'

    @Prop()
    openToHybrid: string; // 'Yes' or 'No'

    @Prop()
    techConceptsKnowledge: string; // 'Yes' or 'No'

    @Prop()
    strategicRoadmapExperience: string;

    @Prop()
    aiExperience: string;

    @Prop()
    ecommerceOTTExperience: string;

    @Prop()
    growthProductExperience: string;

    @Prop([WorkExperience])
    experience: WorkExperience[];

    @Prop([Education])
    education: Education[];

    // Enhanced Q&A Repository
    @Prop({ type: [{ question: String, answer: String, category: String }], default: [] })
    savedAnswers: Array<{
        question: string;  // The question text or keyword
        answer: string;    // User's answer
        category?: string; // Optional: 'salary', 'experience', 'availability', etc.
    }>;

    @Prop({ type: Map, of: String })
    commonQuestions: Map<string, string>; // e.g. "leadership_style": "My style is..."

    @Prop({ type: Map, of: String, default: {} })
    questionMappings: Map<string, string>; // Maps custom question text to profile field names

    @Prop([String])
    unmappedQuestions: string[]; // List of unique questions the bot didn't know how to fill

    @Prop([SkillExperience])
    skillsExperience: SkillExperience[]; // Custom skills and years of experience

    @Prop({ default: true })
    skipContactStepIfFilled: boolean;

    @Prop({ default: true })
    skipResumeStepIfFilled: boolean;

    @Prop([SkillExperience])
    domainsExperience: SkillExperience[]; // Custom domains and years of experience

    // Firebase Authentication & User Management
    @Prop({ required: false, unique: true, sparse: true })
    firebaseUid: string; // Maps to Firebase user ID

    @Prop({ default: false })
    onboardingCompleted: boolean; // Has user completed onboarding wizard

    @Prop({ default: 0 })
    onboardingStep: number; // Last completed onboarding step (0-4)

    @Prop({ type: Date })
    accountCreatedAt: Date; // Account creation timestamp

    @Prop({ type: Date })
    lastLoginAt: Date; // Last login timestamp

    // Apply Settings (Platform Toggles & Automation Rules)
    @Prop({ default: true })
    linkedinEnabled: boolean; // Enable LinkedIn automation

    @Prop({ default: true })
    naukriEnabled: boolean; // Enable Naukri automation

    @Prop({ default: false })
    externalEnabled: boolean; // Enable external company websites (ATS forms)

    @Prop({ default: 50 })
    dailyApplyLimit: number; // Maximum applications per day

    @Prop([String])
    preferredJobTitles: string[]; // Multiple preferred job titles for search

    // Default Automation Settings
    @Prop()
    defaultJobKeyword: string; // Default job search keyword for automation

    @Prop()
    defaultLocation: string; // Default location for job searches

    @Prop({ default: 10 })
    defaultMaxJobs: number; // Default max jobs to apply per session

    @Prop({ type: [String], default: [] })
    reportedQuestions: string[]; // Questions that couldn't be auto-filled

    @Prop({ default: 0 })
    noExperience: number; // Default years for skills with no experience
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
