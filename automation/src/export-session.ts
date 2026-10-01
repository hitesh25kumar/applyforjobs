import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const urls: Record<string, string> = {
    linkedin: 'https://www.linkedin.com/',
    instagram: 'https://www.instagram.com/direct/inbox/',
    naukri: 'https://www.naukri.com/',
};

async function main(): Promise<void> {
    const platform = process.argv[2]?.toLowerCase();
    const url = platform ? urls[platform] : undefined;
    if (!platform || !url) {
        throw new Error('Usage: npm run session:export -- <linkedin|instagram|naukri> [output-file]');
    }

    const outputPath = path.resolve(process.argv[3] || path.join(process.cwd(), 'sessions', `${platform}.json`));
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const browser = await chromium.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log(`Log in to ${platform} in the opened browser, then return here and press Enter.`);
        await new Promise<void>((resolve) => {
            process.stdin.resume();
            process.stdin.once('data', () => {
                process.stdin.pause();
                resolve();
            });
        });

        await context.storageState({ path: outputPath, indexedDB: true });
        await context.close();
        console.log(`Session state saved to ${outputPath}. Treat this file as a password.`);
    } finally {
        await browser.close();
    }
}

main().catch((error: unknown) => {
    console.error((error as Error).message);
    process.exitCode = 1;
});