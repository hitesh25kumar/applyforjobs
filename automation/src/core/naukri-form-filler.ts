import { Page } from 'playwright';
import { UserProfile } from './form-filler';
import * as path from 'path';

export interface QuestionAnswer {
    question: string;
    answer: string;
    fieldType?: string;
    category?: string;
}

export class NaukriFormFiller {
    private questionAnswers: QuestionAnswer[] = [];

    constructor(private page: Page) { }

    async applyToJob(jobUrl: string, profile: UserProfile): Promise<{ success: boolean; questions: QuestionAnswer[] }> {
        this.questionAnswers = []; // Reset for each application
        console.log(`[Naukri] Attempting to apply: ${jobUrl}`);

        try {
            // OPTIMIZATION: Use domcontentloaded for faster interaction & 60s timeout
            await this.page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await this.page.waitForTimeout(3000); // 3s settle time

            // 1. Find Apply Button (Robust Strategy)
            // Naukri Apply buttons can be <button>, <a>, or <div> with ID 'apply-button' or class 'apply-button'
            const applySelectors = [
                '#apply-button',
                '.apply-button',
                'button.apply-button',
                'div.apply-button',
                'button.styles_apply-button', // Common React pattern
                'button:has-text("Apply")',
                'a:has-text("Apply")',
                'button:has-text("Apply on company site")', // Needed to catch it and reject it
                'a:has-text("Apply on company site")'
            ];

            // Try explicit selectors first, prioritized by visibility
            let applyBtn = this.page.locator(applySelectors.join(', ')).first();

            // Fallback: strict accessibility check if specific selectors fail
            if (!await applyBtn.isVisible()) {
                console.log('[Naukri] Standard selectors failed. Trying generic "Apply" generic search...');
                applyBtn = this.page.locator('button, a').filter({ hasText: /^Apply$/i }).first();
            }

            if (!await applyBtn.isVisible()) {
                console.log('[Naukri] Rejecting: External company site redirect detected.');
                return { success: false, questions: this.questionAnswers };
            }

            const btnText = (await applyBtn.innerText()).toLowerCase();

            // STRICT FAIL FAST: Reject if button implies external redirect
            if (btnText.includes('company site') ||
                btnText.includes('company website') ||
                btnText.includes('external') ||
                btnText.includes('website')) {
                console.log(`[Naukri] 🛑 SKIP: Apply button indicates external redirect: "${btnText}"`);
                return { success: false, questions: this.questionAnswers };
            }

            // ATTEMPT CLICK
            console.log(`[Naukri] Clicking Apply button: "${await applyBtn.innerText()}"`);
            try {
                await applyBtn.click({ timeout: 5000 });
            } catch (e) {
                console.log('[Naukri] Standard click failed. Attempting JS Force Click...');
                await applyBtn.evaluate((el: HTMLElement) => el.click());
            }

            await this.page.waitForTimeout(2000);

            // 2. Handle Form / Popup
            // Naukri often shows a form or just a "Success" if profile is complete.
            // Let's handle common fields if they appear.

            await this.fillHeuristicFields(profile);

            // 3. Resume Check
            const resumeInput = this.page.locator('input[type="file"]').first();
            if (await resumeInput.isVisible()) {
                console.log('[Naukri] Resume upload requested.');
                // In a real scenario, we'd use profile.resumePath
                // For now, let's assume a default path or skip if not providing a real file
                // await resumeInput.setInputFiles(path.resolve(__dirname, '../../uploads/resume.pdf'));
            }

            // 4. Final Submit
            const submitBtn = this.page.locator('button:has-text("Submit"), button:has-text("Send Application")').first();
            if (await submitBtn.isVisible()) {
                await submitBtn.click();
                await this.page.waitForTimeout(3000);
            }

            // 5. Success Check (Robust)
            const successSelectors = [
                'text=/successfully applied|application sent/i',
                '.success-message', // Generic class often used
                'text="Applied to"', // From user screenshot
                'text="Power up your applies"', // From user screenshot
                'h2:has-text("Applied to")',
                '.apply-message'
            ];

            const success = await this.page.locator(successSelectors.join(', ')).first().isVisible({ timeout: 5000 }).catch(() => false);

            if (success) {
                console.log('[Naukri] ✅ Application successful!');
                return { success: true, questions: this.questionAnswers };
            }

            // Fallback: Check if Apply button changed to "Applied"
            if (await applyBtn.isVisible() && (await applyBtn.innerText()).toLowerCase().includes('applied')) {
                console.log('[Naukri] ✅ Application successful (Button state changed)!');
                return { success: true, questions: this.questionAnswers };
            }

            return { success: false, questions: this.questionAnswers };
        } catch (e) {
            console.error('[Naukri] Application failed:', (e as Error).message);
            return { success: false, questions: this.questionAnswers };
        }
    }

    private async fillHeuristicFields(profile: UserProfile): Promise<void> {
        // 1. Handle Selection/Radio Questions (Modal Style)
        await this.handleModalQuestions(profile);

        // 2. Handle Standard Text Inputs
        const inputs = await this.page.locator('input, select, textarea').all();
        for (const input of inputs) {
            if (!await input.isVisible()) continue;

            // Skip radio/checkbox here as they are handled by handleModalQuestions or need specific logic
            const type = await input.getAttribute('type');
            if (type === 'radio' || type === 'checkbox' || type === 'file') continue;

            const placeholder = await input.getAttribute('placeholder') || '';
            const name = await input.getAttribute('name') || '';
            const label = await this.page.evaluate(el => {
                const id = el?.id;
                if (id) {
                    const l = document.querySelector(`label[for="${id}"]`);
                    return l ? l.textContent : '';
                }
                return '';
            }, await input.elementHandle());

            const text = (placeholder + ' ' + name + ' ' + (label || '')).toLowerCase();

            if (text.includes('experience')) {
                await input.fill(String(profile.yearsOfExperience || '0'));
            } else if (text.includes('ctc') || text.includes('salary')) {
                await input.fill(profile.expectedCTC || '0');
            } else if (text.includes('notice')) {
                await input.fill(profile.noticePeriod || '15 Days'); // Text fallback
            } else if (text.includes('location') || text.includes('city')) {
                await input.fill(profile.preferredCity || '');
            }
        }
    }

    private async handleModalQuestions(profile: UserProfile): Promise<void> {
        console.log('[Naukri] Scanning for modal questions (Waiting 4s for render)...');
        await this.page.waitForTimeout(4000); // Wait for modal animation/skeleton loading

        // 0. Remove Chatbot Overlay specific background (dimmer) early
        const overlay = this.page.locator('.chatbot_Overlay');
        if (await overlay.count() > 0 && await overlay.first().isVisible()) {
            console.log('[Naukri] Removing blocking overlay background...');
            await this.page.evaluate(() => {
                document.querySelectorAll('.chatbot_Overlay').forEach(el => el.remove());
            });
        }

        // Common questions mapping to Profile fields
        const questions = [
            {
                keywords: ['notice period', 'notice'],
                value: profile.noticePeriod || '15 Days',
                fallbacks: ['15 Days', '1 Month', 'Immediate']
            },
            {
                keywords: ['experience', 'years'],
                value: profile.yearsOfExperience || '5',
                fallbacks: ['5', '4', '3']
            },
            {
                keywords: ['ctc', 'salary', 'lacs', 'annum'],
                value: profile.currentCTC || profile.expectedCTC || '12',
                fallbacks: ['12', 'Not Disclosed'],
                isTextInput: true // Flag for text input questions
            }
        ];

        // Locate all question headers or labels in the modal
        // Naukri modals often put the question in a <span> or <div> above the options
        const potentialHeaders = this.page.locator('.chatbot_DrawerContent span, .chatbot_DrawerContent div, label, p');

        for (const q of questions) {
            try {
                // Find if this question is present
                // We verify by checking if any visible text contains the keyword
                const headerCount = await potentialHeaders.count();
                let foundHeader = null;

                for (let i = 0; i < headerCount; i++) {
                    const el = potentialHeaders.nth(i);
                    if (!await el.isVisible()) continue;

                    const text = (await el.innerText()).toLowerCase();
                    if (q.keywords.some(k => text.includes(k))) {
                        foundHeader = el;
                        break;
                    }
                }

                if (foundHeader) {
                    console.log(`[Naukri] Found question matching: ${q.keywords[0]} -> Target: ${q.value}`);
                    await this.page.waitForTimeout(1000); // Wait for options to render

                    // Check if this is a text input question
                    if ((q as any).isTextInput) {
                        console.log('[Naukri] This is a text input question, looking for input field...');

                        // Try multiple selectors for input fields
                        const inputSelectors = [
                            '.chatbot_DrawerContent input[type="text"]',
                            '.chatbot_DrawerContent input[placeholder*="example"]',
                            '.chatbot_DrawerContent input[placeholder*="lakh"]',
                            '.chatbot_DrawerContent input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"])',
                        ];

                        let inputField = null;
                        for (const selector of inputSelectors) {
                            const field = this.page.locator(selector).first();
                            if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
                                inputField = field;
                                console.log(`[Naukri] Found input field with selector: ${selector}`);
                                break;
                            }
                        }

                        if (inputField) {
                            const numericValue = q.value.replace(/[^\d.]/g, ''); // Extract just numbers
                            console.log(`[Naukri] Filling text input with: "${numericValue}"`);

                            try {
                                await inputField.clear();
                                await inputField.fill(numericValue);
                                await this.page.waitForTimeout(800);
                                console.log('[Naukri] Successfully filled text input');
                                continue; // Move to next question
                            } catch (err) {
                                console.log('[Naukri] Failed to fill text input:', (err as Error).message);
                            }
                        } else {
                            console.log('[Naukri] No text input field found, trying radio button approach...');
                        }
                    }

                    // Look for options (radio buttons or clickable divs) nearby
                    // We'll search the whole page for text matching the value, as modals are usually focused
                    // Strategy: Find text match -> Click parent container or previous/next radio

                    const strategies = [
                        q.value,
                        ...q.fallbacks
                    ];

                    let clicked = false;
                    for (const attemptVal of strategies) {
                        // Look for specific label text
                        // Use a more specific selector strategy to avoid random text
                        const option = this.page.locator('label, .chatbot_ListItem, div[class*="radio"], span')
                            .filter({ hasText: new RegExp(attemptVal, 'i') }) // Removed ^ anchor to be safe
                            .first();

                        if (await option.isVisible()) {
                            console.log(`[Naukri] Clicking option: "${attemptVal}"`);
                            try {
                                await option.click({ timeout: 2000, force: true });
                            } catch (err) {
                                console.log('[Naukri] Click failed. Trying JS Force Click...');
                                await option.evaluate((el: HTMLElement) => el.click());
                            }
                            clicked = true;
                            break;
                        }
                    }

                    if (!clicked) {
                        console.log(`[Naukri] Could not find clickable option for "${q.value}"`);
                    }
                }
            } catch (e) {
                console.log(`[Naukri] Error handling question "${q.keywords[0]}":`, (e as Error).message);
            }
        }

        // Detect Resume Upload Requirement
        const resumeHeader = await potentialHeaders.filter({ hasText: /resume|cv/i }).first();
        if (await resumeHeader.isVisible()) {
            console.log('[Naukri] Resume upload requested in modal.');

            // Explicitly click "Upload Resume" button if it exists to trigger input
            const uploadBtn = this.page.locator('button:has-text("Upload Resume")').first();
            if (await uploadBtn.isVisible()) {
                console.log('[Naukri] Clicking "Upload Resume" button...');
                try {
                    await uploadBtn.click({ force: true });
                } catch (e) { await uploadBtn.evaluate((el: HTMLElement) => el.click()); }
                await this.page.waitForTimeout(1000);
            }

            const fileInput = this.page.locator('input[type="file"]').first();
            if (await fileInput.count() > 0) {
                console.log(`[Naukri] Uploading resume from: ${profile.resumePath}`);
                await fileInput.setInputFiles(profile.resumePath);
                await this.page.waitForTimeout(2000); // Wait for upload
            } else {
                console.log('[Naukri] resume input not found even after clicking button.');
            }
        }

        // Detect "Save" or "Done" button in modal specific to these questions
        const saveBtn = this.page.locator('button:has-text("Save"), button:has-text("Done"), button:has-text("Submit")').first();
        if (await saveBtn.isVisible()) {
            console.log(`[Naukri] Clicking Modal Submit Button: "${await saveBtn.innerText()}"`);
            await saveBtn.click({ force: true });
            await this.page.waitForTimeout(1000);
        } else {
            console.log('[Naukri] No distinct Save/Submit button found in modal. Checking if auto-saved or main submit handles it.');
            // Debug screenshot to see what's left
            await this.page.screenshot({ path: path.resolve(__dirname, '../../debug_naukri_modal_end.png') });
        }
    }
}
