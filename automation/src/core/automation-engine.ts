import { BrowserManager } from './browser-manager';
import { JobCrawler, JobListing } from './job-crawler';
import { FormFiller, UserProfile } from './form-filler';
import { isLinkedInJobAlreadyApplied, LinkedInCrawler, LinkedInJob } from './linkedin-crawler';
import { LinkedInFormFiller } from './linkedin-form-filler';
import * as fs from 'fs';
import * as path from 'path';

export interface LinkedInAutomationProgress {
    type: 'run.started' | 'run.paused' | 'run.resumed' | 'run.stopping' | 'run.stopped' | 'job.started' | 'job.skipped' | 'application.succeeded' | 'application.failed' | 'application.persistence_failed' | 'run.completed' | 'run.failed';
    message: string;
    title?: string;
    company?: string;
    jobUrl?: string;
    questions?: Array<{ question: string; answer: string; fieldType?: string; category?: string }>;
    jobsApplied?: number;
    jobsFailed?: number;
}

export interface LinkedInRunControl {
    waitUntilRunning: () => Promise<boolean>;
}

export class AutomationEngine {
    private browserManager: BrowserManager;

    constructor() {
        this.browserManager = BrowserManager.getInstance();
        console.log('[AutomationEngine] Initialized');
    }

    async start() {
        await this.browserManager.launch();
    }

    async stop() {
        await this.browserManager.close();
    }

    async resolveCompanyUrl(companyName: string): Promise<string | null> {
        const page = await this.browserManager.getPage();
        console.log(`Resolving URL for ${companyName}...`);

        await page.goto('https://duckduckgo.com/?q=' + encodeURIComponent(companyName + ' careers') + '&kl=us-en', { waitUntil: 'domcontentloaded' });

        try {
            await page.waitForSelector('.react-results--main, #links', { timeout: 10000 });
            const firstResult = page.locator('article h2 a, .result__a').first();
            await firstResult.waitFor({ timeout: 5000 });

            const url = await firstResult.getAttribute('href');
            console.log(`Resolved ${companyName} to ${url}`);
            return url;
        } catch (e) {
            console.error("Failed to resolve company URL", e);
            return null;
        }
    }

    async scanCompany(companyUrl: string, jobKeywords: string[] = []): Promise<JobListing[]> {
        const page = await this.browserManager.getPage();
        const crawler = new JobCrawler(page);

        const careersUrl = await crawler.findCareersPage(companyUrl);
        if (!careersUrl) {
            console.error(`Could not find careers page for ${companyUrl}`);
            return [];
        }

        return await crawler.scanForJobs(careersUrl, jobKeywords.length > 0 ? jobKeywords : undefined);
    }

    async applyToJob(jobUrl: string, profile: UserProfile): Promise<{ success: boolean; message: string }> {
        const page = await this.browserManager.getPage();
        await page.goto(jobUrl, { waitUntil: 'domcontentloaded' });

        const filler = new FormFiller(page);
        const success = await filler.detectAndFill(profile);

        if (success) {
            await filler.waitForSubmission();
        }

        return {
            success,
            message: success ? 'Form filled and submission cycle completed' : 'Could not autofill form',
        };
    }

    async runLinkedInAutomation(
        keyword: string,
        profile: UserProfile,
        location?: string,
        maxJobs: number = 10,
        onUnmappedQuestion?: (question: string, type: string, category: string) => void,
        onProgress?: (event: LinkedInAutomationProgress) => void | Promise<void>,
        control?: LinkedInRunControl
    ): Promise<{ jobsApplied: number; jobsFailed: number; jobs: Array<{ title: string; company: string; jobUrl?: string; success: boolean; questions?: any[] }> }> {
        console.log(`\n[LinkedIn Automation] === Starting New Session (Apply one-by-one) ===`);
        console.log(`[LinkedIn Automation] Keyword: "${keyword}", Max Jobs: ${maxJobs}`);
        await onProgress?.({ type: 'run.started', message: `Searching LinkedIn for "${keyword}"${location ? ` in ${location}` : ''}.` });

        const page = await this.browserManager.getPage();
        const formFiller = new LinkedInFormFiller(page, onUnmappedQuestion);

        const results: Array<{ title: string; company: string; jobUrl?: string; success: boolean; questions?: any[] }> = [];
        let jobsApplied = 0;
        let jobsFailed = 0;
        let previousCompany = ''; // Track previous company to detect when panel updates
        let stopped = false;

        try {
            const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&f_AL=true${location ? '&location=' + encodeURIComponent(location) : ''}`;
            console.log(`[LinkedIn Automation] Navigating to search: ${searchUrl}`);
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await page.waitForTimeout(5000);

            let loggedIn = await this.isLinkedInLoggedIn(page);
            if (!loggedIn) {
                console.log('[LinkedIn Automation] ⚠ Not logged in! Please log in within 5 minutes; checking every 5 seconds.');
                loggedIn = await this.waitForLinkedInLogin(page, 5 * 60 * 1000);
                if (!loggedIn) {
                    console.warn('[LinkedIn Automation] Login was not detected within 5 minutes. Ending this run without applying to jobs.');
                    await onProgress?.({ type: 'run.failed', message: 'LinkedIn login was not detected; no jobs were processed.' });
                    return { jobsApplied, jobsFailed, jobs: results };
                }

                await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
                await page.waitForTimeout(5000);
            }

            console.log('[LinkedIn Automation] ✓ Logged in');
            try {
                const profileDumpPath = await this.createLinkedInProfileDump(page);
                console.log(`[LinkedIn Automation] Updated profile dump from the signed-in LinkedIn profile: ${profileDumpPath}`);
            } catch (error) {
                console.warn('[LinkedIn Automation] Could not update profile dump from the signed-in account:', error);
            }
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await page.waitForTimeout(5000);

            const jobCardSelectors = [
                'div.job-card-container',
                'li.jobs-search-results__list-item',
                'div.jobs-search-results__list-item',
                'li[data-occludable-job-id]',
                'div[data-job-id]'
            ];

            let jobCards = null;
            let count = 0;

            for (const selector of jobCardSelectors) {
                jobCards = page.locator(selector);
                count = await jobCards.count();
                if (count > 0) {
                    console.log(`[LinkedIn Automation] Found ${count} job cards on current page`);
                    break;
                }
            }

            if (!jobCards || count === 0) {
                console.log('[LinkedIn Automation] No job cards found');
                await onProgress?.({ type: 'run.completed', message: 'LinkedIn search finished; no job listings were found.' });
                return { jobsApplied: 0, jobsFailed: 0, jobs: [] };
            }

            for (let i = 0; i < Math.min(count, maxJobs * 2) && jobsApplied < maxJobs; i++) {
                if (page.isClosed()) break;
                if (control && !(await control.waitUntilRunning())) {
                    stopped = true;
                    break;
                }

                let title = "Unknown Job Title";
                let company = "Unknown Company";
                let jobResultRecorded = false;

                try {
                    const card = jobCards.nth(i);
                    await card.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(1500);

                    const cardText = await card.innerText().catch(() => '');
                    if (isLinkedInJobAlreadyApplied(cardText)) {
                        console.log(`[LinkedIn Automation] Skipping already-applied job in result ${i + 1}`);
                        await onProgress?.({ type: 'job.skipped', message: 'Skipped a job LinkedIn marks as already applied.' });
                        continue;
                    }

                    console.log(`\n[LinkedIn Automation] --- Progress: ${jobsApplied}/${maxJobs} ---`);
                    console.log(`[LinkedIn Automation] Attempting to extract data from job card ${i + 1}...`);

                    // NEW APPROACH: Extract company/title from the job CARD itself before clicking
                    // This ensures we get unique data for each job, not relying on detail panel refresh
                    let extractionSource = "None"; // Initialize extractionSource

                    try {
                        // Title Selectors (Card)
                        // Looking for .job-card-list__title or strong tags inside the card
                        const titleEl = card.locator('.job-card-list__title, .artdeco-entity-lockup__title, strong, a.job-card-container__link').first();
                        const rawTitle = await titleEl.innerText().catch(() => "");
                        if (rawTitle) {
                            title = rawTitle.split('\n')[0].trim();
                        }

                        // Company Selectors (Card)
                        // Note: Often the company is in a separate line or subtitle
                        // We use .first() carefully.
                        const companyEl = card.locator('.job-card-container__primary-description, .artdeco-entity-lockup__subtitle, .job-card-container__company-name').first();
                        const rawCompany = await companyEl.innerText().catch(() => "");

                        // If primary description failed, try to parse lines (heuristic)
                        if (rawTitle && !rawCompany) {
                            const allText = await card.innerText();
                            const lines = allText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                            // Heuristic: If line 0 is Title, line 1 is often Company
                            if (lines.length > 1 && lines[0].includes(title)) {
                                company = lines[1];
                            }
                        } else if (rawCompany) {
                            company = rawCompany.split('\n')[0].split('·')[0].trim();
                        }

                        if (title !== "Unknown Job Title" && company !== "Unknown Company") {
                            extractionSource = "Card";
                            console.log(`[LinkedIn Automation] Extracted from Card: "${title}" at "${company}"`);
                        }
                    } catch (e) {
                        console.log(`[LinkedIn Automation] Card extraction error: ${(e as Error).message}`);
                    }

                    console.log(`[LinkedIn Automation] Clicking job card...`);
                    await card.click();

                    // Wait for the job detail panel
                    console.log(`[LinkedIn Automation] Waiting for job detail panel to load...`);
                    const detailPanelLoaded = await page.locator('.jobs-search__job-details, .jobs-unified-top-card, .job-details-jobs-unified-top-card').first().isVisible({ timeout: 10000 }).catch(() => false);

                    if (!detailPanelLoaded) {
                        console.log(`[LinkedIn Automation] ⚠ Detail panel didn't appear in 10s - skipping`);
                        continue;
                    }

                    await page.waitForTimeout(2000); // Wait for panel to stabilize

                    const detailPanel = page.locator('.jobs-search__job-details, .jobs-unified-top-card, .job-details-jobs-unified-top-card').first();
                    const detailPanelText = await detailPanel.innerText().catch(() => '');
                    if (isLinkedInJobAlreadyApplied(detailPanelText)) {
                        console.log(`[LinkedIn Automation] Skipping already-applied job: "${title}" at "${company}"`);
                        await onProgress?.({ type: 'job.skipped', message: `Skipped "${title}" at ${company}; LinkedIn shows it was already applied.`, title, company });
                        continue;
                    }

                    // FALLBACK EXTRACTION
                    // If we couldn't get data from card, OR if company is "HCLSoftware" (detected stuck value), try detail panel
                    if (title === "Unknown Job Title" || company === "Unknown Company" || company === "HCLSoftware") {
                        console.log(`[LinkedIn Automation] Fallback: Trying to extract from detail panel...`);
                        const titleElem = page.locator('.jobs-unified-top-card__job-title, .job-details-jobs-unified-top-card__job-title, h1').first();
                        const companyElem = page.locator('.jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__company-name, .artdeco-entity-lockup__subtitle').first();

                        if (title === "Unknown Job Title") {
                            title = await titleElem.innerText().catch(() => "Unknown Job Title");
                            title = title.split('\n')[0].trim();
                        }
                        if (company === "Unknown Company") {
                            company = await companyElem.innerText().catch(() => "Unknown Company");
                            company = company.split('\n')[0].trim();
                        }
                    }

                    // Final cleanup
                    title = title.replace(' with verification', '').trim();

                    console.log(`[LinkedIn Automation] Final extracted data: "${title}" at "${company}"`);
                    const jobUrl = await page.url();

                    if (control && !(await control.waitUntilRunning())) {
                        stopped = true;
                        break;
                    }

                    const easyApplySelectors = [
                        '.jobs-unified-top-card button.jobs-apply-button',
                        '.job-details-jobs-unified-top-card button.jobs-apply-button',
                        '.jobs-search__job-details button.jobs-apply-button',
                        'button.jobs-apply-button',
                        'button:has-text("Easy Apply")',
                        'button[aria-label*="Easy Apply"]'
                    ];

                    let hasEasyApply = false;
                    // Extended retry loop for Easy Apply button visibility
                    for (let attempt = 1; attempt <= 4; attempt++) {
                        console.log(`[LinkedIn Automation] Checking for Easy Apply button (Attempt ${attempt}/4)...`);
                        for (const selector of easyApplySelectors) {
                            const btn = page.locator(selector).first();
                            if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
                                console.log(`[LinkedIn Automation] ✓ Found Easy Apply button with selector: ${selector}`);
                                // Ensure it's not the "Save" or "Follow" button by accident
                                const text = await btn.innerText().catch(() => "");
                                if (text.toLowerCase().includes('apply')) {
                                    hasEasyApply = true;
                                    break;
                                }
                            }
                        }
                        if (hasEasyApply) break;
                        console.log(`[LinkedIn Automation] Easy Apply button not found yet, scrolling and waiting...`);
                        await page.mouse.wheel(0, 100); // Suble scroll to trigger lazy loading
                        await page.waitForTimeout(2000);
                    }

                    if (!hasEasyApply) {
                        console.log(`[LinkedIn Automation] ⚠ Skipping: No "Easy Apply" button found for this job after 4 attempts.`);
                        continue;
                    }

                    console.log(`\n[LinkedIn Automation] --- Job ${i + 1}/${count} ---`); // Changed jobListings.length to count
                    console.log(`[LinkedIn Automation] Title: "${title}"`);
                    console.log(`[LinkedIn Automation] Company: "${company}"`);
                    await onProgress?.({ type: 'job.started', message: `Opening Easy Apply for "${title}" at ${company}.`, title, company, jobUrl });

                    const result = await formFiller.applyToJob(profile);
                    const { success, questions } = result;

                    if (success) {
                        jobsApplied++;
                        console.log(`[LinkedIn Automation] ✅ SUCCESS!`);
                    } else {
                        jobsFailed++;
                        console.log(`[LinkedIn Automation] ❌ FAILED`);
                    }

                    results.push({ title, company, jobUrl, success, questions });
                    await onProgress?.({
                        type: success ? 'application.succeeded' : 'application.failed',
                        message: success ? `Application submitted for "${title}" at ${company}.` : `Could not confirm an application for "${title}" at ${company}.`,
                        title,
                        company,
                        jobUrl,
                        questions,
                        jobsApplied,
                        jobsFailed,
                    });
                    jobResultRecorded = true;

                    // Update previous company for next iteration
                    previousCompany = company;

                    if (jobsApplied < maxJobs) {
                        const delay = 15000 + Math.random() * 10000;
                        console.log(`[LinkedIn Automation] Cooling down ${Math.round(delay / 1000)}s...`);
                        const cooldownEndsAt = Date.now() + delay;
                        while (Date.now() < cooldownEndsAt) {
                            if (control && !(await control.waitUntilRunning())) {
                                stopped = true;
                                break;
                            }
                            await new Promise(resolve => setTimeout(resolve, Math.min(250, cooldownEndsAt - Date.now())));
                        }
                        if (stopped) break;
                    }

                } catch (e) {
                    console.error(`[LinkedIn Automation] Error at job ${i + 1}:`, (e as Error).message);
                    if (!jobResultRecorded) {
                        jobsFailed++;
                        results.push({ title, company, success: false });
                        await onProgress?.({ type: 'application.failed', message: `Failed while processing "${title}" at ${company}: ${(e as Error).message}`, title, company });
                    }
                    if (page.isClosed()) {
                        console.error('[LinkedIn Automation] Browser page closed; stopping this run.');
                        break;
                    }
                }
            }

            if (!stopped && control && !(await control.waitUntilRunning())) {
                stopped = true;
            }

            console.log(`\n[LinkedIn Automation] Final Results: Applied ${jobsApplied}, Failed ${jobsFailed}`);
            await onProgress?.(stopped
                ? { type: 'run.stopped', message: `LinkedIn run stopped: ${jobsApplied} applied, ${jobsFailed} failed.`, jobsApplied, jobsFailed }
                : { type: 'run.completed', message: `LinkedIn run finished: ${jobsApplied} applied, ${jobsFailed} failed.`, jobsApplied, jobsFailed });

        } catch (e) {
            console.error('[LinkedIn Automation] Fatal failure:', e);
            await onProgress?.({ type: 'run.failed', message: `LinkedIn run failed: ${(e as Error).message}` });
        }

        return { jobsApplied, jobsFailed, jobs: results };
    }

    private async isLinkedInLoggedIn(page: import('playwright').Page): Promise<boolean> {
        const pagePath = new URL(page.url()).pathname;
        if (/\/(login|checkpoint|authwall)(\/|$)/i.test(pagePath)) return false;

        const profileIcon = await page.locator('img.global-nav__me-photo, button.global-nav__primary-link--me')
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        const hasAuthCookie = await page.context()
            .cookies('https://www.linkedin.com')
            .then(cookies => cookies.some(cookie => cookie.name === 'li_at'))
            .catch(() => false);

        return profileIcon || hasAuthCookie;
    }

    private async waitForLinkedInLogin(page: import('playwright').Page, timeoutMs: number): Promise<boolean> {
        const deadline = Date.now() + timeoutMs;

        while (!page.isClosed() && Date.now() < deadline) {
            await page.waitForTimeout(Math.min(5000, deadline - Date.now()));
            if (await this.isLinkedInLoggedIn(page)) return true;
        }

        return false;
    }

    private async createLinkedInProfileDump(page: import('playwright').Page): Promise<string> {
        let profileUrl = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(
                'header a[href*="/in/"], nav a[href*="/in/"], a.global-nav__me-link[href*="/in/"]',
            ));
            return links.map((link) => link.href).find((href) => /linkedin\.com\/in\/[^/?#]+/i.test(href)) || '';
        });

        if (!profileUrl) {
            const profileMenuButton = page.locator('button.global-nav__primary-link--me').first();
            if (await profileMenuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await profileMenuButton.click();
                await page.waitForTimeout(500);
            }

            profileUrl = await page.getByRole('link', { name: /view profile/i })
                .getAttribute('href')
                .catch(() => null) || '';
        }

        if (!profileUrl) {
            throw new Error('Could not find the signed-in LinkedIn profile link in the navigation');
        }
        const normalizedProfileUrl = new URL(profileUrl, page.url());
        if (normalizedProfileUrl.hostname !== 'www.linkedin.com'
            || !/^\/in\/[^/?#]+/i.test(normalizedProfileUrl.pathname)) {
            throw new Error('The signed-in LinkedIn profile link was invalid');
        }

        await page.goto(normalizedProfileUrl.href, { waitUntil: 'domcontentloaded', timeout: 60000 });
        const nameHeading = page.locator('main h1, h1.text-heading-xlarge, h1').first();
        await nameHeading.waitFor({ state: 'visible', timeout: 15000 });

        const profile = await page.locator('main').evaluate((main) => {
            const clean = (value: string | null | undefined) => value?.replace(/\s+/g, ' ').trim() || '';
            const sections = Array.from(main.querySelectorAll('section')).map((section) => ({
                heading: clean(section.querySelector('h2')?.innerText).toLowerCase(),
                text: clean(section.innerText),
                items: Array.from(section.querySelectorAll('li'))
                    .map((item) => clean(item.innerText))
                    .filter(Boolean),
            }));
            const findSection = (heading: string) =>
                sections.find((section) => section.heading.includes(heading));

            return {
                name: clean(main.querySelector('h1')?.textContent),
                headline: clean(main.querySelector('.text-body-medium.break-words')?.textContent),
                location: clean(main.querySelector('.text-body-small.inline.t-black--light.break-words')?.textContent),
                about: findSection('about')?.text || '',
                experience: findSection('experience')?.items || [],
                education: findSection('education')?.items || [],
                skills: findSection('skills')?.items || [],
            };
        });

        if (!profile.name) {
            throw new Error('Could not read the profile name from the signed-in LinkedIn account');
        }

        const [firstName, ...lastNameParts] = profile.name.split(' ');
        const profileDump = {
            source: 'signed-in LinkedIn profile',
            capturedAt: new Date().toISOString(),
            linkedinUrl: page.url(),
            firstName,
            lastName: lastNameParts.join(' '),
            headline: profile.headline,
            location: profile.location,
            bio: profile.about,
            experience: profile.experience,
            education: profile.education,
            techStack: profile.skills,
        };
        const dumpPath = process.env.LINKEDIN_PROFILE_DUMP_PATH
            || path.resolve(__dirname, '../../../profile_dump.json');

        fs.mkdirSync(path.dirname(dumpPath), { recursive: true });
        fs.writeFileSync(dumpPath, JSON.stringify(profileDump, null, 2), { mode: 0o600 });
        fs.chmodSync(dumpPath, 0o600);

        return dumpPath;
    }
}
