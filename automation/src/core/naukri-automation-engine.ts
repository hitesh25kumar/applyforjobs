import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { UserProfile } from './form-filler';
import { SessionManager } from './session-manager';
import { NaukriCrawler } from './naukri-crawler';
import { NaukriFormFiller } from './naukri-form-filler';
import * as path from 'path';

export interface NaukriAutomationOptions {
    keyword: string;
    headless?: boolean;
    maxJobs?: number;
    sessionPath?: string;
}

export class NaukriAutomationEngine {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private page: Page | null = null;

    async run(profile: UserProfile, options: NaukriAutomationOptions): Promise<void> {
        const { keyword, headless = true, maxJobs = 10, sessionPath = process.env.NAUKRI_SESSION_PATH || path.resolve(__dirname, '../../sessions/naukri.json') } = options;

        console.log(`[Naukri Engine] Starting automation for keyword: "${keyword}"`);

        try {
            this.browser = await chromium.launch({
                headless,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const storageState = await SessionManager.loadSession(sessionPath, 'NAUKRI_STORAGE_STATE');
            this.context = await this.browser.newContext({ storageState });
            this.page = await this.context.newPage();

            // 1. Initial Check / Login check
            await this.page.goto('https://www.naukri.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });

            let isLoggedIn = await this.page.locator('.nI-g_login, .nI-g-login').count().then(c => c === 0);

            if (!isLoggedIn && !headless) {
                console.log('[Naukri Engine] Testing Mode: Not logged in. Waiting 5 minutes for manual login/setup...');
                await this.page.waitForTimeout(300000);
                // Save session immediately after potential manual login
                try {
                    await SessionManager.saveSession(this.context!, sessionPath);
                } catch (e) { }
                // Re-check login status
                isLoggedIn = await this.page.locator('.nI-g_login, .nI-g-login').count().then(c => c === 0);
            }

            if (!isLoggedIn) {
                console.log('[Naukri Engine] Not logged in. Please login manually during the wait or check your session.');
                return;
            }

            // 2. Search Jobs
            const crawler = new NaukriCrawler(this.page);
            const jobs = await crawler.searchJobs(keyword);

            if (jobs.length === 0) {
                console.log('[Naukri Engine] No jobs found to apply.');
                return;
            }

            // 3. Apply Loop
            const filler = new NaukriFormFiller(this.page);
            let successCount = 0;
            let processedCount = 0;
            let skippedCount = 0;

            for (const job of jobs) {
                // Stop if we reached the target number of SUCCESSFUL applications
                if (successCount >= maxJobs) break;

                console.log(`[Naukri Engine] Processing job (${processedCount + 1}/${jobs.length}): ${job.title} at ${job.company}`);
                const result = await filler.applyToJob(job.link, profile);
                processedCount++;

                if (result) {
                    successCount++;
                    console.log(`[Naukri Engine] 🟢 Success detected! Total Applied: ${successCount}/${maxJobs}`);
                    // Save session after success to keep it fresh
                    await SessionManager.saveSession(this.context, sessionPath);
                } else {
                    skippedCount++;
                    console.log(`[Naukri Engine] ⚪ Job skipped or failed. Continuing...`);
                }

                // Random delay between jobs
                await this.page.waitForTimeout(Math.random() * 3000 + 2000);
            }

            console.log(`[Naukri Engine] Cycle Finished. Processed: ${processedCount}, Applied: ${successCount}, Skipped/Failed: ${skippedCount}`);
            if (successCount < maxJobs && processedCount === jobs.length) {
                console.log('[Naukri Engine] ⚠️ List exhausted before reaching target. Pagination not yet implemented.');
            }


            console.log(`[Naukri Engine] Finished. Applied to ${successCount} jobs.`);
        } catch (e) {
            console.error('[Naukri Engine] Critical failure:', (e as Error).message);
        } finally {
            if (this.browser) {
                if (!headless) {
                    console.log('[Naukri Engine] Keeping browser open for 600s (10 min) for inspection/login...');
                    await this.page?.waitForTimeout(600000);
                    // Try to save session in case user logged in manually
                    try {
                        await SessionManager.saveSession(this.context!, sessionPath);
                    } catch (e) { }
                }
                await this.browser.close();
            }
        }
    }
}
