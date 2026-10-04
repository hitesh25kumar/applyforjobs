import { LocalRunnerService } from './local-runner.service';

describe('LocalRunnerService', () => {
    const profileService = { getProfile: jest.fn() };
    const questionsService = { findAll: jest.fn(), create: jest.fn() };
    const applicationsService = { create: jest.fn() };
    let service: LocalRunnerService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new LocalRunnerService(
            profileService as any,
            questionsService as any,
            applicationsService as any,
        );
    });

    it('allows a pairing code to be claimed only once', () => {
        const { code } = service.createPairingCode('user-1');
        const { runnerToken } = service.claimPairingCode(code);

        expect(runnerToken).toHaveLength(64);
        expect(service.getStatus('user-1').connected).toBe(true);
        expect(() => service.claimPairingCode(code)).toThrow('Pairing code is invalid or expired');
    });

    it('delivers jobs to the paired runner and persists successful applications', async () => {
        const { code } = service.createPairingCode('user-1');
        const { runnerToken } = service.claimPairingCode(code);
        profileService.getProfile.mockResolvedValue({
            firebaseUid: 'user-1',
            firstName: 'Ada',
            questionMappings: new Map([['Remote work', 'openToHybrid']]),
        });
        questionsService.findAll.mockResolvedValue([
            { text: 'How many years of TypeScript?', userAnswer: '5', category: 'experience' },
        ]);

        const queued = await service.queueJob('user-1', {
            keyword: 'FullStack Developer',
            location: 'Bangalore',
            maxJobs: 5,
        });
        const { job } = service.getNextJob(runnerToken);

        expect(job?.keyword).toBe('FullStack Developer');
        expect(job?.profile.questionMappings).toEqual({ 'Remote work': 'openToHybrid' });
        expect(job?.profile.savedAnswers).toEqual([
            { question: 'How many years of TypeScript?', answer: '5', category: 'experience' },
        ]);

        await service.completeJob(runnerToken, queued.jobId, {
            jobsApplied: 1,
            jobsFailed: 0,
            jobs: [{ title: 'Developer', company: 'Example Co', success: true }],
        });

        expect(applicationsService.create).toHaveBeenCalledWith(expect.objectContaining({
            firebaseUid: 'user-1',
            platform: 'LinkedIn',
            companyName: 'Example Co',
            jobTitle: 'Developer',
            success: true,
        }));
        expect(service.getNextJob(runnerToken).job).toBeNull();
    });

    it('refuses to queue when no local runner is connected', async () => {
        await expect(service.queueJob('user-1', { keyword: 'Developer' }))
            .rejects.toThrow('Connect the local LinkedIn runner first');
    });
});