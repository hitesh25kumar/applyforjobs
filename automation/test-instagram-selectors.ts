import { chromium } from 'playwright';
import * as path from 'path';
import * as os from 'os';

async function findThreads() {
    const userDataDir = path.join(os.homedir(), '.job-applyer', 'instagram_data');

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        viewport: { width: 1280, height: 800 }
    });

    const page = context.pages()[0] || await context.newPage();

    try {
        console.log('Navigating to Instagram inbox...');
        await page.goto('https://www.instagram.com/direct/inbox/', { waitUntil: 'domcontentloaded' });

        // Wait for page to load
        await page.waitForTimeout(5000);

        console.log('\n=== Testing DIV-based Selectors ===\n');

        const selectors = [
            'div[role="button"]',
            'div[role="button"]:has(img)', // Divs with avatars
            'div:has(> div > img[alt])', // Divs containing avatar images
            'div:has-text("Chinmay")', // Specific thread name from screenshot
            'div:has-text("You:")', // Threads with "You:" prefix
        ];

        for (const selector of selectors) {
            try {
                const count = await page.locator(selector).count();
                console.log(`✓ "${selector}" found ${count} elements`);

                if (selector.includes('Chinmay') && count > 0) {
                    // Found the specific thread, let's inspect it
                    const elem = page.locator(selector).first();
                    const html = await elem.evaluate(el => el.outerHTML).catch(() => 'N/A');
                    console.log(`  HTML: ${html.substring(0, 200)}...`);
                }
            } catch (e) {
                console.log(`✗ "${selector}" failed: ${(e as Error).message}`);
            }
        }

        // Try to click on the first visible thread
        console.log('\n=== Attempting to Click First Thread ===\n');

        // Look for the "Chinmay Gosavi" thread from the screenshot
        const chinmayThread = page.locator('div:has-text("Chinmay Gosavi")').first();
        if (await chinmayThread.count() > 0) {
            console.log('Found Chinmay thread, clicking...');
            await chinmayThread.click();
            await page.waitForTimeout(2000);

            // Check if we navigated to a thread
            console.log('Current URL:', page.url());

            // Try to find the message input
            const inputBox = page.locator('div[contenteditable="true"][role="textbox"]');
            const inputCount = await inputBox.count();
            console.log(`Message input boxes found: ${inputCount}`);
        }

        // Keep browser open for inspection
        console.log('\nBrowser will stay open for 60 seconds for manual inspection...');
        await page.waitForTimeout(60000);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await context.close();
    }
}

findThreads();
