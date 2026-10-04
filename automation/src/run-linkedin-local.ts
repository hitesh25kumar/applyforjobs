import * as os from 'os';
import * as path from 'path';
import * as readline from 'readline';
import { AutomationEngine } from './core/automation-engine';
import { BrowserManager } from './core/browser-manager';

interface LocalJob {
    id: string;
    keyword: string;
    location?: string;
    maxJobs: number;
    profile: any;
}

class ApiError extends Error {
    constructor(message: string, readonly status: number) {
        super(message);
    }
}

const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));
let activePrompt: readline.Interface | null = null;
let shutdownRequested = false;

function ask(prompt: string): Promise<string> {
    const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
    activePrompt = terminal;
    return new Promise(resolve => {
        let answered = false;
        terminal.question(prompt, answer => {
            answered = true;
            if (activePrompt === terminal) activePrompt = null;
            terminal.close();
            resolve(answer.trim());
        });
        terminal.on('close', () => {
            if (!answered) resolve('');
            if (activePrompt === terminal) activePrompt = null;
        });
    });
}

function getApiUrl(): string | undefined {
    const args = process.argv.slice(2);
    const apiFlagIndex = args.indexOf('--api');
    const apiFlag = apiFlagIndex >= 0 ? args[apiFlagIndex + 1] : undefined;
    const apiArg = args.find(argument => argument.startsWith('--api='))?.slice('--api='.length);
    return (apiFlag || apiArg || process.env.API_URL || process.env.VITE_API_URL)?.replace(/\/$/, '');
}

async function request<T>(apiUrl: string, endpoint: string, token?: string, body?: unknown): Promise<T> {
    const response = await fetch(`${apiUrl}${endpoint}`, {
        method: body === undefined ? 'GET' : 'POST',
        headers: {
            ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new ApiError((data as any).message || `Request failed (${response.status})`, response.status);
    }
    return data as T;
}

async function main(): Promise<void> {
    const requestShutdown = () => {
        shutdownRequested = true;
        activePrompt?.close();
    };
    process.on('SIGINT', requestShutdown);
    process.on('SIGTERM', requestShutdown);

    const apiUrl = getApiUrl();
    if (!apiUrl || !/^https?:\/\//i.test(apiUrl)) {
        throw new Error('Pass the deployed API URL with --api, for example --api https://your-api.onrender.com');
    }

    const pairingCode = await ask('Enter the pairing code shown in the web app: ');
    const { runnerToken } = await request<{ runnerToken: string }>(
        apiUrl,
        '/automation/local-runner/claim',
        undefined,
        { code: pairingCode },
    );

    process.env.AUTOMATION_USER_DATA_DIR = path.join(os.homedir(), '.job-applyer', 'browser-profile');
    process.env.AUTOMATION_HEADLESS = 'false';
    delete process.env.LINKEDIN_STORAGE_STATE;

    const browserManager = BrowserManager.getInstance();
    const engine = new AutomationEngine();

    try {
        await engine.start();
        const page = await browserManager.getPage();
        await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });
        console.log('A LinkedIn browser opened. Sign in and complete any verification there.');
        await ask('When you are logged in, press Enter here to start the local runner. ');
        const loginCookies = await page.context().cookies('https://www.linkedin.com');
        if (!loginCookies.some(cookie => cookie.name === 'li_at')) {
            throw new Error('LinkedIn login was not detected. Sign in in the opened browser, then run the local runner again.');
        }
        console.log('Local runner is connected. Keep this terminal and browser open while jobs run.');

        while (!shutdownRequested) {
            try {
                const { job } = await request<{ job: LocalJob | null }>(
                    apiUrl,
                    '/automation/local-runner/next',
                    runnerToken,
                );
                if (!job) {
                    await sleep(4000);
                    continue;
                }

                console.log(`[LocalRunner] Running "${job.keyword}" (${job.maxJobs} jobs)`);
                const unmappedQuestions = new Map<string, { question: string; type: string; category: string }>();
                try {
                    const result = await engine.runLinkedInAutomation(
                        job.keyword,
                        job.profile,
                        job.location || '',
                        job.maxJobs,
                        (question, type, category) => {
                            unmappedQuestions.set(question, { question, type, category });
                        },
                    );
                    await request(
                        apiUrl,
                        `/automation/local-runner/jobs/${encodeURIComponent(job.id)}/result`,
                        runnerToken,
                        { ...result, unmappedQuestions: Array.from(unmappedQuestions.values()) },
                    );
                    console.log(`[LocalRunner] Finished: ${result.jobsApplied} applied, ${result.jobsFailed} failed`);
                } catch (error) {
                    await request(
                        apiUrl,
                        `/automation/local-runner/jobs/${encodeURIComponent(job.id)}/result`,
                        runnerToken,
                        {
                            jobsApplied: 0,
                            jobsFailed: 1,
                            jobs: [],
                            error: (error as Error).message,
                        },
                    ).catch(reportError => console.error('[LocalRunner] Could not report failure:', reportError));
                    console.error('[LocalRunner] Job failed:', (error as Error).message);
                }
            } catch (error) {
                if (error instanceof ApiError && error.status === 401) {
                    throw new Error('The deployed runner session expired. Generate a new pairing code and start the local runner again.');
                }
                console.error('[LocalRunner] Connection error:', (error as Error).message);
                await sleep(5000);
            }
        }
    } finally {
        await engine.stop();
    }
}

main().catch(error => {
    console.error('[LocalRunner]', (error as Error).message);
    process.exitCode = 1;
});