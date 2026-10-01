
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { SessionManager } from './session-manager';

export interface InstagramAutomationOptions {
    message: string;
    maxMessages?: number;
    headless?: boolean;
    sessionPath?: string;
    useRequests?: boolean; // If true, send messages to Requests instead of regular Messages
    clearData?: boolean; // If true, clear cached Instagram data and force fresh login
}

export class InstagramAutomationEngine {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private page: Page | null = null;

    async run(options: InstagramAutomationOptions): Promise<{ success: boolean; count: number; message: string }> {
        const { message, maxMessages = 10 } = options;
        const headless = options.headless ?? process.env.AUTOMATION_HEADLESS === 'true';

        const userDataDir = process.env.AUTOMATION_USER_DATA_DIR
            ? path.join(process.env.AUTOMATION_USER_DATA_DIR, 'instagram')
            : path.join(os.homedir(), '.job-applyer', 'instagram_data');

        console.log(`[Instagram Engine] Starting automation. Target: ${maxMessages} messages.`);
        console.log(`[Instagram Engine] User Data Directory: ${userDataDir}`);

        // If clearData is enabled, delete the user data directory to force fresh login
        if (options.clearData) {
            console.log('[Instagram Engine] clearData enabled, deleting cached Instagram data...');
            try {
                if (fs.existsSync(userDataDir)) {
                    fs.rmSync(userDataDir, { recursive: true, force: true });
                    console.log('[Instagram Engine] Instagram data cleared successfully');
                } else {
                    console.log('[Instagram Engine] No cached data found to clear');
                }
            } catch (error) {
                console.log('[Instagram Engine] Error clearing data:', error);
            }
        }

        // Ensure directory exists
        if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir, { recursive: true });
        }
        const profileHasState = fs.readdirSync(userDataDir).length > 0;
        const storageState = profileHasState || options.clearData
            ? null
            : await SessionManager.loadSession(path.join(userDataDir, 'storage-state.json'), 'INSTAGRAM_STORAGE_STATE');

        let processedCount = 0;

        try {
            this.browser = await chromium.launch({
                headless,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled' // Helps avoid detection
                ],
            });
            this.context = await this.browser.newContext({
                storageState: storageState ?? undefined,
                viewport: { width: 1280, height: 800 }
            });

            this.page = await this.context.newPage();

            // 1. Go to Inbox
            console.log('[Instagram Engine] Navigating to Inbox...');
            await this.page.goto('https://www.instagram.com/direct/inbox/', { waitUntil: 'domcontentloaded' });

            // 2. Check Login / Page Load
            try {
                // Wait for either login elements or inbox specific elements. 
                await this.page.waitForLoadState('networkidle', { timeout: 30000 });
            } catch (e) {
                console.log('[Instagram Engine] Timeout waiting for network idle (continuing)...');
            }

            // More robust login page detection
            const loginSelectors = ['input[name="username"]', 'button:has-text("Log in")', 'a:has-text("Log in")'];
            let isLoginPage = false;
            for (const selector of loginSelectors) {
                if (await this.page.locator(selector).count() > 0) {
                    isLoginPage = true;
                    break;
                }
            }

            if (isLoginPage || this.page.url().includes('accounts/login')) {
                if (headless) {
                    console.error('[Instagram Engine] Not logged in and running headless. Cannot proceed.');
                    return { success: false, count: 0, message: 'Not logged in' };
                }
                console.log('[Instagram Engine] Not logged in. Please log in manually. Waiting 20 minutes...');
                // Wait for user to login
                try {
                    // Wait for inbox container OR "Not Now" button which appears after login
                    // Increased timeout to 20 minutes (1200000ms)
                    await Promise.race([
                        this.page.waitForSelector('div[role="listbox"]', { timeout: 1200000 }),
                        this.page.waitForSelector('button:has-text("Not Now")', { timeout: 1200000 })
                    ]);

                    console.log('[Instagram Engine] Login/Inbox detected!');
                    // Give a moment for cookies to settle
                    await this.page.waitForTimeout(5000);
                } catch (e) {
                    console.error('[Instagram Engine] Login timeout (20m exceeded).');
                    // Don't close immediately so user can see what happened? 
                    // No, invalid state.
                    return { success: false, count: 0, message: 'Login timeout' };
                }
            }

            // Handle "Turn on Notifications" or "Save Login Info" popups
            // We'll try this multiple times as they might appear sequentially
            for (let attempt = 0; attempt < 3; attempt++) {
                try {
                    const notNowButtons = this.page.locator('button:has-text("Not Now")');
                    if (await notNowButtons.count() > 0) {
                        console.log('[Instagram Engine] Dismissing "Not Now" popup...');
                        await notNowButtons.first().click();
                        await this.page.waitForTimeout(2000);
                    } else {
                        break;
                    }
                } catch (e) {
                    // ignore
                }
            }

            console.log('[Instagram Engine] Accessing messages...');

            // Ensure we are effectively on inbox
            if (!this.page.url().includes('/direct/inbox/') && !this.page.url().includes('/direct/requests/')) {
                await this.page.goto('https://www.instagram.com/direct/inbox/', { waitUntil: 'domcontentloaded' });
            }

            // If useRequests is enabled, click on the Requests link instead of navigating directly
            // Direct navigation to /direct/requests/ causes Instagram to redirect
            if (options.useRequests) {
                console.log('[Instagram Engine] Looking for Requests link...');
                try {
                    // Wait for the page to load first
                    await this.page.waitForTimeout(1000);

                    // Look for "Requests" link - it shows as "Requests (2)" or similar
                    const requestsLink = this.page.locator('a:has-text("Requests"), span:has-text("Requests")').first();
                    await requestsLink.waitFor({ timeout: 5000 });
                    await requestsLink.click();
                    await this.page.waitForTimeout(3000); // Wait for requests to load

                    // Verify we're still on the direct messages page
                    const currentUrl = this.page.url();
                    console.log('[Instagram Engine] Current URL after clicking Requests:', currentUrl);

                    if (!currentUrl.includes('/direct/')) {
                        throw new Error('Instagram redirected away from messages page. This may indicate a session issue or Instagram detecting automation.');
                    }

                    console.log('[Instagram Engine] Clicked on Requests link');
                } catch (e) {
                    const errorMsg = `Could not find or click Requests link: ${e instanceof Error ? e.message : String(e)}`;
                    console.error('[Instagram Engine]', errorMsg);
                    throw new Error(errorMsg);
                }
            }

            // Wait for page to stabilize
            console.log('[Instagram Engine] Waiting for conversations... (VERSION DEBUG 7)');
            await this.page.waitForTimeout(2000);

            let messagesProcessed = 0;

            for (let i = 0; i < maxMessages; i++) {
                console.log(`[Instagram Engine] Processing message ${i + 1}/${maxMessages}`);

                // Find all conversation links on the page (in the sidebar)
                // On requests page, conversations are links with role="link"
                const conversationLinks = this.page.locator('a[role="link"]');
                const linkCount = await conversationLinks.count();
                console.log(`[Instagram Engine] Found ${linkCount} conversation links`);

                if (i >= linkCount) {
                    console.log('[Instagram Engine] No more conversations available');
                    break;
                }

                // Click on the i-th conversation
                const conversation = conversationLinks.nth(i);
                try {
                    await conversation.scrollIntoViewIfNeeded();
                    await this.page.waitForTimeout(500);
                    await conversation.click();
                    await this.page.waitForTimeout(2000); // Wait for conversation to open
                    console.log(`[Instagram Engine] Opened conversation ${i + 1}`);
                } catch (e) {
                    console.log(`[Instagram Engine] Could not click conversation ${i + 1}:`, e);
                    continue;
                }

                // If we're in Requests mode, we need to click "Accept" button first
                if (options.useRequests) {
                    console.log('[Instagram Engine] Looking for Accept button...');
                    try {
                        // Look for "Accept" button - it appears at the bottom of the request thread
                        const acceptButton = this.page.locator('button:has-text("Accept"), div[role="button"]:has-text("Accept")');
                        const acceptCount = await acceptButton.count();

                        if (acceptCount > 0) {
                            console.log(`[Instagram Engine] Found ${acceptCount} Accept button(s), scrolling into view...`);
                            // Scroll the Accept button into view
                            await acceptButton.first().scrollIntoViewIfNeeded();
                            await this.page.waitForTimeout(500);

                            console.log('[Instagram Engine] Clicking Accept button...');
                            await acceptButton.first().click();
                            await this.page.waitForTimeout(1500); // Wait for accept action to complete
                            console.log('[Instagram Engine] Request accepted');

                            // After accepting, Instagram may show a popup asking to move to Primary or General
                            // Click "General" if the popup appears
                            try {
                                console.log('[Instagram Engine] Looking for General button...');
                                const generalButton = this.page.locator('button:has-text("General"), div[role="button"]:has-text("General")');
                                const generalCount = await generalButton.count();

                                if (generalCount > 0) {
                                    console.log('[Instagram Engine] Clicking General button...');
                                    await generalButton.first().click();
                                    await this.page.waitForTimeout(1000);
                                    console.log('[Instagram Engine] Moved to General folder');
                                }
                            } catch (e) {
                                console.log('[Instagram Engine] No General button found, continuing...');
                            }
                        } else {
                            console.log('[Instagram Engine] No Accept button found, thread may already be accepted');
                        }
                    } catch (e) {
                        console.log('[Instagram Engine] Could not click Accept button:', e);
                    }
                }

                // Wait for chat box
                // Selector: div[role="textbox"][contenteditable="true"] or aria-label="Message..."
                const inputBox = this.page.locator('div[contenteditable="true"][role="textbox"]');
                try {
                    await inputBox.waitFor({ timeout: 10000 });
                } catch (e) {
                    console.log(`[Instagram Engine] Could not find input box for thread ${i}. Skipping.`);
                    continue;
                }

                // Type message
                await inputBox.fill(message);
                await this.page.waitForTimeout(1000);

                // Send
                await this.page.keyboard.press('Enter');

                console.log(`[Instagram Engine] Sent message to thread ${i}.`);
                processedCount++;

                await this.page.waitForTimeout(3000 + Math.random() * 2000); // Random delay
            }

            console.log(`[Instagram Engine] Completed. Processed ${processedCount} messages.`);
            return { success: true, count: processedCount, message: 'Completed successfully' };

        } catch (error) {
            console.error('[Instagram Engine] Error:', error);
            // Keep browser open for a bit if error occurred in visible mode
            if (!headless) {
                console.log('[Instagram Engine] Error occurred. Keeping browser open for 30s for inspection...');
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
            return { success: false, count: processedCount, message: (error as Error).message };
        } finally {
            if (this.context) {
                console.log('[Instagram Engine] Closing browser...');
                try {
                    await SessionManager.saveSession(this.context, path.join(userDataDir, 'storage-state.json'));
                } catch (error) {
                    console.error('[Instagram Engine] Failed to save session:', (error as Error).message);
                }
                await this.context.close();
            }
            await this.browser?.close();
        }
    }
}
