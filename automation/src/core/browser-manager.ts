import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { SessionManager } from './session-manager';

export class BrowserManager {
    private static instance: BrowserManager;
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private page: Page | null = null;
    private userDataDir: string;
    private sessionPath: string;

    private constructor() {
        this.userDataDir = process.env.AUTOMATION_USER_DATA_DIR
            ? path.join(process.env.AUTOMATION_USER_DATA_DIR, 'linkedin')
            : path.join(process.cwd(), 'user_data');
        this.sessionPath = path.join(this.userDataDir, 'storage-state.json');
    }

    public static getInstance(): BrowserManager {
        if (!BrowserManager.instance) {
            BrowserManager.instance = new BrowserManager();
        }
        return BrowserManager.instance;
    }

    public async launch(): Promise<void> {
        if (this.context) return;

        console.log('Launching browser with user data dir:', this.userDataDir);
        fs.mkdirSync(this.userDataDir, { recursive: true });
        const storageState = await SessionManager.loadSession(this.sessionPath, 'LINKEDIN_STORAGE_STATE');
        this.browser = await chromium.launch({
            headless: process.env.AUTOMATION_HEADLESS === 'true',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-features=AutofillAddressEnabled,AutofillCreditCardEnabled',
                '--disable-save-password-bubble',
                '--disable-infobars',
                '--window-position=0,0'
            ],
        });
        this.context = await this.browser.newContext({
            storageState: storageState ?? undefined,
            viewport: { width: 1280, height: 800 },
        });
        this.page = await this.context.newPage();
    }

    public async getPage(): Promise<Page> {
        if (!this.context || !this.page || this.page.isClosed()) {
            console.log("Browser or page appeared closed. Relaunching...");
            await this.close(); // Clean up partial state
            await this.launch();
        }
        return this.page!;
    }

    public async close(): Promise<void> {
        if (this.context) {
            try {
                await SessionManager.saveSession(this.context, this.sessionPath);
            } catch (error) {
                console.error('[BrowserManager] Failed to save LinkedIn session:', (error as Error).message);
            }
            await this.context.close().catch(() => undefined);
            this.context = null;
            this.page = null;
        }
        if (this.browser) {
            await this.browser.close().catch(() => undefined);
            this.browser = null;
        }
    }

    public isConnected(): boolean {
        return !!this.context;
    }
}
