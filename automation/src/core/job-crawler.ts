import { Page } from 'playwright';

export interface JobListing {
    title: string;
    url: string;
    isEasyApply?: boolean;
}

export class JobCrawler {
    constructor(private page: Page) { }

    async findCareersPage(companyUrl: string): Promise<string | null> {
        console.log(`Navigating to ${companyUrl}...`);
        await this.page.goto(companyUrl, { waitUntil: 'domcontentloaded' });

        // Heuristics to find "Careers" link
        const keywords = ['Careers', 'Jobs', 'Work with us', 'Join us', 'Openings'];

        for (const keyword of keywords) {
            const element = await this.page.getByText(keyword, { exact: false }).first();
            if (await element.isVisible()) {
                console.log(`Found careers link: ${keyword}`);
                const href = await element.getAttribute('href');
                if (href) {
                    // Handle relative URLs
                    return new URL(href, this.page.url()).toString();
                }
            }
        }

        // Heuristic: If we are already on a likely careers page and found nothing specific, rely on current URL
        if (this.page.url().match(/career|job|opening|work-with-us/i)) {
            console.log("Current URL looks like a careers page. Using it.");
            return this.page.url();
        }

        return null;
    }

    async scanForJobs(careersPageUrl: string, roleKeywords: string[] = ['Product Manager', 'Engineer']): Promise<JobListing[]> {
        console.log(`Scanning jobs at ${careersPageUrl}...`);
        await this.page.goto(careersPageUrl, { waitUntil: 'domcontentloaded' });

        // Wait for potential job lists to load
        await this.page.waitForTimeout(3001);

        const jobListings: JobListing[] = [];
        const frames = [this.page.mainFrame(), ...this.page.frames()];

        for (const frame of frames) {
            try {
                const links = await frame.getByRole('link').all();
                for (const link of links) {
                    const text = (await link.innerText()).trim();
                    const href = await link.getAttribute('href');

                    if (!text || !href) continue;

                    const matchesKeyword = roleKeywords.some(kw => text.toLowerCase().includes(kw.toLowerCase()));
                    if (matchesKeyword) {
                        // Ensure absolute URL
                        let absoluteUrl = href;
                        try {
                            absoluteUrl = new URL(href, this.page.url()).toString();
                        } catch { }

                        jobListings.push({
                            title: text,
                            url: absoluteUrl,
                        });
                    }
                }
            } catch (e) {
                // Ignore frame access errors (cross-origin etc)
            }
        }

        return jobListings;
    }
}
