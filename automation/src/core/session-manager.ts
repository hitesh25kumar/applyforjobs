import { BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

export class SessionManager {
    static async saveSession(context: BrowserContext, sessionPath: string): Promise<void> {
        const state = await context.storageState();
        const dir = path.dirname(sessionPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(sessionPath, JSON.stringify(state, null, 2));
        console.log(`[Session] Saved state to ${sessionPath}`);
    }

    static async loadSession(sessionPath: string, envKey?: string): Promise<any | null> {
        if (fs.existsSync(sessionPath)) {
            try {
                const state = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
                console.log(`[Session] Loaded existing state from ${sessionPath}`);
                return state;
            } catch (e) {
                console.error(`[Session] Failed to parse session file: ${sessionPath}`);
            }
        }

        const serializedState = envKey ? process.env[envKey] : undefined;
        if (serializedState) {
            try {
                const state = JSON.parse(serializedState);
                if (!state || !Array.isArray(state.cookies)) {
                    throw new Error('Storage state must contain a cookies array');
                }
                return state;
            } catch (error) {
                console.error(`[Session] Invalid JSON in ${envKey}:`, (error as Error).message);
            }
        }

        return null;
    }
}
