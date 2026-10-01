import { Page } from 'playwright';
import * as path from 'path';

export interface NaukriJob {
    title: string;
    company: string;
    link: string;
    location: string;
    experience: string;
    rawText?: string;
}

export class NaukriCrawler {
    constructor(private page: Page) { }

    async searchJobs(keyword: string): Promise<NaukriJob[]> {
        const url = `https://www.naukri.com/${keyword.replace(/\s+/g, '-')}-jobs`;
        console.log(`[Naukri] Searching for ${keyword} at ${url}`);

        // 1. Wait for load
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await this.page.waitForTimeout(5000); // 5s wait for dynamic content

        // 2. Take Debug Snapshot
        const debugPath = path.resolve(__dirname, '../../debug_naukri_search.png');
        const debugHtmlPath = path.resolve(__dirname, '../../debug_naukri_page.html');
        await this.page.screenshot({ path: debugPath, fullPage: true });
        const html = await this.page.content();
        require('fs').writeFileSync(debugHtmlPath, html);
        console.log(`[Naukri Debug] Saved screenshot to ${debugPath}`);
        console.log(`[Naukri Debug] Saved HTML to ${debugHtmlPath}`);

        // 3. Robust Search
        const selectors = ['.srp-jobtuple', '.list', 'article.jobTuple', '.jobTuple', '[class*="srp-jobtuple"]', 'div.jobTuple'];
        let matchedSelector = '';

        console.log('[Naukri Debug] Scanning for selectors...');
        for (const sel of selectors) {
            const count = await this.page.locator(sel).count();
            console.log(`[Naukri Debug] Selector "${sel}" count: ${count}`);
            if (count > 0) {
                matchedSelector = sel;
                break;
            }
        }

        if (!matchedSelector) {
            console.log('[Naukri] CRITICAL: No jobs found. Check the debug screenshot!');
            return [];
        }

        const jobs: NaukriJob[] = await this.page.evaluate((sel) => {
            const cards = Array.from(document.querySelectorAll(sel));
            console.log(`[Browser] Extracting from ${cards.length} cards...`);

            return cards.map(card => {
                const titleElem = card.querySelector('.title') || card.querySelector('a[title]') || card.querySelector('a');
                const compElem = card.querySelector('.comp-name') || card.querySelector('.subTitle') || card.querySelector('a.subTitle');
                const linkElem = card.querySelector('a.title') || card.querySelector('a');

                // Extract all text to check for "Apply on Naukri" etc.
                const cardText = card.textContent?.toLowerCase() || '';

                return {
                    title: titleElem?.textContent?.trim() || 'Unknown Title',
                    company: compElem?.textContent?.trim() || 'Unknown Company',
                    link: (linkElem as HTMLAnchorElement)?.href || '',
                    location: '',
                    experience: '',
                    rawText: cardText // Pass full text for filtering
                };
            });
        }, matchedSelector);

        console.log(`[Naukri] Raw jobs found: ${jobs.length}`);

        // Filter for Easy Apply types
        const validJobs = jobs.filter(j => {
            const text = j.rawText || '';

            // 1. Mandatory Exclusion: Reject if it mentions "company site"
            // This overrides any positive signal to be absolutely strict as per user request.
            if (text.includes('company site') ||
                text.includes('company website') ||
                text.includes('external')) {
                return false;
            }

            // 2. Inclusion Criteria (Optional but recommended)
            // We accept if it has positive indicators OR if it simply doesn't have the negative ones (fallback)
            const isEasyApply = text.includes('apply on naukri') ||
                text.includes('quick apply') ||
                text.includes('easy apply');

            // For now, since we already excluded the "Company Site" ones above, we can be more permissive 
            // with the remaining ones to ensure we don't miss valid jobs that just say "Save" etc.
            // But if the user wants STRICT "Apply on Naukri", we can return isEasyApply.
            // Given "skip if button is apply on company website", the exclusion above is the key fix.
            return true;
        });

        console.log(`[Naukri] Filtered jobs (Removed Company Site): ${validJobs.length}/${jobs.length}`);

        if (validJobs.length === 0 && jobs.length > 0) {
            console.log('[Naukri] WARNING: Jobs were found but none matched "Easy Apply" criteria. Check debug logs if this is unexpected.');
            console.log('[Naukri Debug] Sample Job Text:', (jobs[0].rawText || '').substring(0, 100));
        }

        return validJobs.map(({ rawText, ...job }) => job); // Remove rawText before returning
    }
}
