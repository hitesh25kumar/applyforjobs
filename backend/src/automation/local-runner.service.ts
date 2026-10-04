import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { ApplicationsService } from '../applications/applications.service';
import { ProfileService } from '../profile/profile.service';
import { QuestionsService } from '../questions/questions.service';

export interface LocalRunnerJob {
    id: string;
    keyword: string;
    location?: string;
    maxJobs: number;
    profile: Record<string, unknown>;
}

interface LocalRunnerSession {
    firebaseUid: string;
    tokenHash: string;
    connectedAt: number;
    lastSeenAt: number;
    queuedJob: LocalRunnerJob | null;
    activeJob: LocalRunnerJob | null;
}

interface PairingCode {
    firebaseUid: string;
    expiresAt: number;
}

@Injectable()
export class LocalRunnerService {
    private readonly pairingCodes = new Map<string, PairingCode>();
    private readonly pairingCodeByUser = new Map<string, string>();
    private readonly runnersByToken = new Map<string, LocalRunnerSession>();
    private readonly runnersByUser = new Map<string, LocalRunnerSession>();
    private readonly pairingLifetimeMs = 10 * 60 * 1000;
    private readonly heartbeatTimeoutMs = 15 * 1000;

    constructor(
        private readonly profileService: ProfileService,
        private readonly questionsService: QuestionsService,
        private readonly applicationsService: ApplicationsService,
    ) { }

    createPairingCode(firebaseUid: string): { code: string; expiresAt: string } {
        const oldCode = this.pairingCodeByUser.get(firebaseUid);
        if (oldCode) this.pairingCodes.delete(oldCode);

        const code = randomBytes(6).toString('hex').toUpperCase();
        const expiresAt = Date.now() + this.pairingLifetimeMs;
        this.pairingCodes.set(code, { firebaseUid, expiresAt });
        this.pairingCodeByUser.set(firebaseUid, code);

        return { code, expiresAt: new Date(expiresAt).toISOString() };
    }

    claimPairingCode(inputCode: string): { runnerToken: string } {
        const code = inputCode?.trim().toUpperCase();
        const pairing = code ? this.pairingCodes.get(code) : undefined;
        if (!pairing || pairing.expiresAt < Date.now()) {
            if (code) this.pairingCodes.delete(code);
            throw new UnauthorizedException('Pairing code is invalid or expired');
        }

        this.pairingCodes.delete(code);
        this.pairingCodeByUser.delete(pairing.firebaseUid);

        const previousRunner = this.runnersByUser.get(pairing.firebaseUid);
        if (previousRunner) this.runnersByToken.delete(previousRunner.tokenHash);

        const runnerToken = randomBytes(32).toString('hex');
        const tokenHash = this.hashToken(runnerToken);
        const now = Date.now();
        const runner: LocalRunnerSession = {
            firebaseUid: pairing.firebaseUid,
            tokenHash,
            connectedAt: now,
            lastSeenAt: now,
            queuedJob: null,
            activeJob: null,
        };
        this.runnersByToken.set(tokenHash, runner);
        this.runnersByUser.set(pairing.firebaseUid, runner);

        return { runnerToken };
    }

    getStatus(firebaseUid: string) {
        const runner = this.runnersByUser.get(firebaseUid);
        const connected = Boolean(runner && Date.now() - runner.lastSeenAt <= this.heartbeatTimeoutMs);
        return {
            connected,
            connectedAt: connected && runner ? new Date(runner.connectedAt).toISOString() : null,
            jobRunning: connected && Boolean(runner?.activeJob),
        };
    }

    async queueJob(
        firebaseUid: string,
        input: { keyword: string; location?: string; maxJobs?: number },
    ): Promise<{ jobId: string; status: string }> {
        const runner = this.runnersByUser.get(firebaseUid);
        if (!runner || Date.now() - runner.lastSeenAt > this.heartbeatTimeoutMs) {
            throw new ConflictException('Connect the local LinkedIn runner first');
        }
        if (runner.queuedJob || runner.activeJob) {
            throw new ConflictException('The local runner is already processing a job');
        }

        const profileDocument = await this.profileService.getProfile();
        const profile = typeof (profileDocument as any).toObject === 'function'
            ? (profileDocument as any).toObject()
            : profileDocument as any;
        if (profile.firebaseUid && profile.firebaseUid !== firebaseUid) {
            throw new ForbiddenException('The configured profile belongs to another account');
        }

        let savedAnswers: Array<{ question: string; answer: string; category?: string }> = [];
        try {
            const questions = await this.questionsService.findAll(firebaseUid);
            savedAnswers = questions
                .filter((question: any) => question.userAnswer)
                .map((question: any) => ({
                    question: question.text,
                    answer: question.userAnswer,
                    category: question.category,
                }));
        } catch (error) {
            console.warn('[LocalRunner] Could not load saved answers:', (error as Error).message);
        }

        const questionMappings = profile.questionMappings instanceof Map
            ? Object.fromEntries(profile.questionMappings.entries())
            : profile.questionMappings || {};
        const runnerProfile: Record<string, unknown> = {
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            linkedinData: profile.linkedinUrl || '',
            github: profile.githubUrl || '',
            portfolio: profile.portfolioUrl || '',
            preferredCity: profile.preferredCity || profile.city || '',
            preferredCountry: profile.preferredCountry || '',
            address: profile.address || '',
            state: profile.state || '',
            zipCode: profile.zipCode || '',
            coverLetter: profile.coverLetter || '',
            techStack: profile.techStack || [],
            dateAvailable: profile.dateAvailable || '',
            desiredPay: profile.desiredPay || '',
            rightToWork: profile.rightToWork || '',
            currentCTC: profile.currentCTC || '',
            expectedCTC: profile.expectedCTC || '',
            noticePeriod: profile.noticePeriod || '',
            noticePeriodDays: profile.noticePeriodDays,
            yearsOfExperience: profile.yearsOfExperience || '',
            productManagementExperience: profile.productManagementExperience || '',
            canJoinIn15Days: profile.canJoinIn15Days || '',
            agileScrumExperience: profile.agileScrumExperience || '',
            openToHybrid: profile.openToHybrid || '',
            techConceptsKnowledge: profile.techConceptsKnowledge || '',
            strategicRoadmapExperience: profile.strategicRoadmapExperience || '',
            aiExperience: profile.aiExperience || '',
            ecommerceOTTExperience: profile.ecommerceOTTExperience || '',
            growthProductExperience: profile.growthProductExperience || '',
            questionMappings,
            skillsExperience: profile.skillsExperience || [],
            domainsExperience: profile.domainsExperience || [],
            savedAnswers,
        };

        const job: LocalRunnerJob = {
            id: randomUUID(),
            keyword: input.keyword,
            location: input.location,
            maxJobs: input.maxJobs || 10,
            profile: runnerProfile,
        };
        runner.queuedJob = job;
        return { jobId: job.id, status: 'queued' };
    }

    getNextJob(token: string): { job: LocalRunnerJob | null } {
        const runner = this.getRunner(token);
        runner.lastSeenAt = Date.now();
        if (!runner.activeJob && runner.queuedJob) {
            runner.activeJob = runner.queuedJob;
            runner.queuedJob = null;
        }
        return { job: runner.activeJob };
    }

    async completeJob(
        token: string,
        jobId: string,
        result: {
            jobsApplied: number;
            jobsFailed: number;
            jobs: Array<{ title: string; company: string; success: boolean; questions?: any[] }>;
            unmappedQuestions?: Array<{ question: string; type: string; category: string }>;
        },
    ) {
        const runner = this.getRunner(token);
        if (!runner.activeJob || runner.activeJob.id !== jobId) {
            throw new NotFoundException('No matching local job is active');
        }

        for (const jobResult of result.jobs || []) {
            if (!jobResult.success) continue;
            await this.applicationsService.create({
                firebaseUid: runner.firebaseUid,
                platform: 'LinkedIn',
                companyName: jobResult.company,
                jobTitle: jobResult.title,
                status: 'Applied',
                success: true,
                questions: jobResult.questions?.map((question: any) => ({
                    question: question.question,
                    answer: question.answer,
                    fieldType: question.fieldType,
                    category: question.category,
                })) || [],
            } as any);
        }

        for (const question of result.unmappedQuestions || []) {
            try {
                await this.questionsService.create(question.question, question.type, question.category);
            } catch (error) {
                console.warn('[LocalRunner] Could not save an unmapped question:', (error as Error).message);
            }
        }

        runner.activeJob = null;
        runner.lastSeenAt = Date.now();
        return {
            jobsApplied: result.jobsApplied,
            jobsFailed: result.jobsFailed,
            total: result.jobs?.length || 0,
        };
    }

    private getRunner(token: string): LocalRunnerSession {
        if (!token) throw new UnauthorizedException('Local runner token is required');
        const runner = this.runnersByToken.get(this.hashToken(token));
        if (!runner) throw new UnauthorizedException('Local runner is not paired; pair it again');
        return runner;
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }
}