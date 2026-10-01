import { Page } from 'playwright';

export interface LinkedInJob {
    url: string;
    title: string;
    company: string;
}

export class LinkedInCrawler {
    constructor(private page: Page) { }

    async searchJobs(keyword: string, location?: string, maxJobs: number = 10): Promise<LinkedInJob[]> {
        console.log(`[LinkedIn] Searching for "${keyword}" jobs...`);

        try {
            // Navigate to LinkedIn Jobs search
            const searchUrl = this.buildSearchUrl(keyword, location);
            console.log(`[LinkedIn] Navigating to: ${searchUrl}`);
            await this.page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await this.page.waitForTimeout(5000); // Wait for dynamic content to load

            // Check if logged in
            const isLoggedIn = await this.checkLogin();
            if (!isLoggedIn) {
                console.log('[LinkedIn] ⚠ Not logged in! Please log in to LinkedIn first.');
                throw new Error('LinkedIn login required');
            }

            console.log('[LinkedIn] ✓ Logged in successfully');

            // Extract job listings
            const jobs = await this.extractJobListings(maxJobs);
            console.log(`[LinkedIn] Found ${jobs.length} Easy Apply jobs`);

            return jobs;
        } catch (e) {
            console.error('[LinkedIn] Error searching jobs:', e);
            throw e;
        }
    }

    private buildSearchUrl(keyword: string, location?: string): string {
        const baseUrl = 'https://www.linkedin.com/jobs/search/';
        const params = new URLSearchParams({
            keywords: keyword,
            f_AL: 'true', // Easy Apply filter
        });

        if (location) {
            params.set('location', location);
        }

        return `${baseUrl}?${params.toString()}`;
    }

    private async checkLogin(): Promise<boolean> {
        try {
            // Check for profile icon or feed which indicates logged in state
            const profileIcon = await this.page.locator('img.global-nav__me-photo, button.global-nav__primary-link--me').isVisible({ timeout: 2000 }).catch(() => false);
            return profileIcon;
        } catch {
            return false;
        }
    }

    private async extractJobListings(maxJobs: number): Promise<LinkedInJob[]> {
        const jobs: LinkedInJob[] = [];

        console.log('[LinkedIn] Waiting for job listings to load...');
        await this.page.waitForTimeout(5000);

        try {
            // Try multiple selectors for job cards
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
                jobCards = this.page.locator(selector);
                count = await jobCards.count();
                if (count > 0) {
                    console.log(`[LinkedIn] Found ${count} job cards using selector: ${selector}`);
                    break;
                }
            }

            if (!jobCards || count === 0) {
                console.log('[LinkedIn] ⚠ No job cards found');
                return jobs;
            }

            for (let i = 0; i < Math.min(count, maxJobs * 2); i++) {
                try {
                    const card = jobCards.nth(i);

                    await card.scrollIntoViewIfNeeded();
                    await this.page.waitForTimeout(2000);

                    console.log(`[LinkedIn] Clicking job card ${i + 1}...`);
                    await card.click();
                    // Wait for the job detail panel to be stable/loaded
                    const detailPanelLoaded = await this.page.locator('.jobs-search__job-details, .jobs-unified-top-card, .job-details-jobs-unified-top-card').first().isVisible({ timeout: 10000 }).catch(() => false);

                    if (!detailPanelLoaded) {
                        console.log(`[LinkedIn] Job ${i + 1}: Detail panel didn't appear - skipping`);
                        continue;
                    }

                    // Check for Easy Apply button with retry and specific selectors
                    const easyApplySelectors = [
                        '.jobs-unified-top-card button.jobs-apply-button',
                        '.job-details-jobs-unified-top-card button.jobs-apply-button',
                        'button.jobs-apply-button',
                        'button:has-text("Easy Apply")',
                        'button[aria-label*="Easy Apply"]'
                    ];

                    let hasEasyApply = false;
                    for (let attempt = 1; attempt <= 3; attempt++) {
                        for (const selector of easyApplySelectors) {
                            const btn = this.page.locator(selector).first();
                            if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
                                const text = await btn.innerText().catch(() => "");
                                if (text.toLowerCase().includes('apply')) {
                                    hasEasyApply = true;
                                    break;
                                }
                            }
                        }
                        if (hasEasyApply) break;
                        await this.page.waitForTimeout(1500);
                    }

                    if (!hasEasyApply) {
                        console.log(`[LinkedIn] Job ${i + 1}: No Easy Apply button found after retries - skipping`);
                        continue;
                    }

                    // Extract job details
                    const titleSelectors = [
                        'h2.job-details-jobs-unified-top-card__job-title',
                        'h1.jobs-unified-top-card__job-title',
                        'a.job-card-container__link'
                    ];

                    const companySelectors = [
                        'a.job-details-jobs-unified-top-card__company-name',
                        'span.jobs-unified-top-card__company-name',
                        'span.job-card-container__company-name'
                    ];

                    let title = 'Unknown Title';
                    for (const selector of titleSelectors) {
                        try {
                            const elem = this.page.locator(selector).first();
                            if (await elem.isVisible({ timeout: 2000 })) {
                                title = await elem.innerText();
                                break;
                            }
                        } catch { }
                    }

                    let company = 'Unknown Company';
                    for (const selector of companySelectors) {
                        try {
                            const elem = this.page.locator(selector).first();
                            if (await elem.isVisible({ timeout: 2000 })) {
                                company = await elem.innerText();
                                break;
                            }
                        } catch { }
                    }

                    const url = await this.page.url();

                    jobs.push({
                        url,
                        title: title.trim(),
                        company: company.trim(),
                    });

                    console.log(`[LinkedIn] ✓ Job ${jobs.length}: ${title.trim()} at ${company.trim()}`);

                    if (jobs.length >= maxJobs) {
                        break;
                    }
                } catch (e) {
                    console.log(`[LinkedIn] Error extracting job ${i + 1}:`, (e as Error).message);
                    continue;
                }
            }

        } catch (e) {
            console.error('[LinkedIn] Error extracting job listings:', e);
        }

        return jobs;
    }
}
