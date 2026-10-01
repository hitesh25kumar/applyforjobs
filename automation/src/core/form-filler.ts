import { Page } from 'playwright';

export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    linkedinData: string;
    github?: string;
    portfolio?: string;
    resumePath: string;
    preferredCity?: string;
    preferredCountry?: string;
    address?: string;
    state?: string;
    zipCode?: string;
    coverLetter?: string;
    coverLetterPath?: string;
    techStack?: string[];
    dateAvailable?: string;
    desiredPay?: string;
    rightToWork?: string;
    currentCTC?: string;
    expectedCTC?: string;
    noticePeriod?: string;
    noticePeriodDays?: number; // Numeric value for forms (0=Immediate, 15, 30, etc.)
    yearsOfExperience?: string;
    productManagementExperience?: string;
    canJoinIn15Days?: string;
    agileScrumExperience?: string;
    openToHybrid?: string;
    techConceptsKnowledge?: string;
    strategicRoadmapExperience?: string;
    aiExperience?: string;
    questionMappings?: Record<string, string>;
    ecommerceOTTExperience?: string;
    growthProductExperience?: string;
    skillsExperience?: { skill: string; years: number }[];
    skipContactStepIfFilled?: boolean;
    skipResumeStepIfFilled?: boolean;
    domainsExperience?: { skill: string; years: number }[];

    // Technology-specific experience (for LinkedIn/Naukri detailed questions)
    nodeJsExperience?: string;
    reactJsExperience?: string;
    angularExperience?: string;
    mernStackExperience?: string;
    pythonExperience?: string;
    javaExperience?: string;
    dotNetExperience?: string;
    technologyExperience?: Record<string, string>; // Flexible mapping

    // Saved Q&A Repository
    savedAnswers?: Array<{
        question: string;
        answer: string;
        category?: string;
    }>;
}

export class FormFiller {
    constructor(private page: Page) { }

    async detectAndFill(profile: UserProfile): Promise<boolean> {
        console.log("Attempting to autofill form...");

        await this.clickApplyButton();

        const fieldMappings: Record<string, string[]> = {
            [profile.firstName]: ['first name', 'given name', 'fname', 'first'],
            [profile.lastName]: ['last name', 'surname', 'lname', 'last', 'family name'],
            [profile.email]: ['email', 'e-mail'],
            [profile.phone]: ['phone', 'mobile', 'cell', 'tel'],
            [profile.linkedinData]: ['linkedin', 'linked in'],
            [profile.github || '']: ['github', 'git'],
            [profile.portfolio || '']: ['portfolio', 'website', 'personal site', 'blog'],
            [profile.preferredCity || '']: ['city', 'location', 'town'],
            [profile.preferredCountry || '']: ['country', 'region'],
            [profile.address || '']: ['address', 'street', 'street address'],
            [profile.state || '']: ['state', 'province', 'region'],
            [profile.zipCode || '']: ['zip', 'postal', 'zip code', 'postal code'],
            [profile.coverLetter || '']: ['cover letter', 'why', 'motivation'],
            [(profile.techStack || []).join(', ')]: ['skills', 'tech stack', 'technologies'],
            [profile.dateAvailable || '']: ['date available', 'start date', 'available'],
            [profile.desiredPay || '']: ['desired pay', 'salary', 'expected salary'],
            [profile.rightToWork || '']: ['right to work', 'work authorization', 'visa', 'eligibility'],
            [profile.currentCTC || '']: ['current ctc', 'current salary', 'current pay'],
            [profile.expectedCTC || '']: ['expected ctc', 'expected salary', 'desired ctc'],
            [profile.noticePeriod || '']: ['notice period', 'notice'],
            [profile.yearsOfExperience || '']: ['years of experience', 'total experience', 'work experience'],
            [profile.productManagementExperience || '']: ['product management experience', 'pm experience'],
            [profile.canJoinIn15Days || '']: ['join in 15 days', 'join within 15 days', 'start in 15 days'],
            [profile.agileScrumExperience || '']: ['agile and scrum', 'agile/scrum', 'scrum experience'],
            [profile.openToHybrid || '']: ['open to a hybrid role', 'hybrid role', 'open to hybrid'],
            [profile.techConceptsKnowledge || '']: ['core tech concepts', 'tech concepts', 'understanding of system design'],
        };

        let filledCount = 0;

        for (const [value, keywords] of Object.entries(fieldMappings)) {
            if (!value) continue;

            for (const keyword of keywords) {
                const filled = await this.fillByLabel(keyword, value);
                if (filled) {
                    filledCount++;
                    break;
                }
            }
        }

        await this.uploadResume(profile.resumePath);

        if (profile.coverLetterPath) {
            await this.uploadCoverLetter(profile.coverLetterPath);
        }

        return filledCount > 0;
    }

    private async clickApplyButton(): Promise<void> {
        console.log("=== Looking for Apply button ===");
        try {
            console.log("Waiting 3 seconds for page to settle...");
            await this.page.waitForTimeout(3000);

            const formVisible = await this.page.locator('input[name="firstName"], input[placeholder*="First Name" i]').first().isVisible({ timeout: 1000 }).catch(() => false);

            if (formVisible) {
                console.log("✓ Application form is already open - skipping button click");
                return;
            }

            const strategies = [
                () => this.page.locator('button:has-text("Apply for This Job")').first(),
                () => this.page.locator('button:has-text("Apply")').first(),
                () => this.page.locator('a.BambooHR-ATS-Apply-Button, button.BambooHR-ATS-Apply-Button').first(),
                () => this.page.locator('button, a, [role="button"]').filter({ hasText: /apply/i }).first(),
                () => this.page.locator('a[href*="apply"]').first(),
                () => this.page.locator('[id*="apply"], [class*="apply"]').filter({ hasText: /apply/i }).first(),
            ];

            const startTime = Date.now();
            const timeout = 15000;

            while (Date.now() - startTime < timeout) {
                for (const strategy of strategies) {
                    try {
                        const element = strategy();
                        const isVisible = await element.isVisible({ timeout: 200 }).catch(() => false);

                        if (isVisible) {
                            const text = await element.innerText().catch(() => 'button');
                            console.log(`✓ Found apply element: "${text}"`);
                            if (await element.isEnabled()) {
                                await element.click();
                                console.log("✓ Clicked apply button");
                                await this.page.waitForTimeout(2000);
                                return;
                            }
                        }
                    } catch { }
                }
                await this.page.waitForTimeout(500);
            }
            console.log("⚠ No apply button found after retries - will try to fill form directly");
        } catch (e) {
            console.log("⚠ Error finding apply button:", (e as Error).message);
        }
    }

    private async fillByLabel(keyword: string, value: string): Promise<boolean> {
        try {
            const label = this.page.getByLabel(new RegExp(keyword, 'i')).first();
            let input = label;

            if (await label.isVisible()) {
                const tagName = await label.evaluate(el => el.tagName.toLowerCase());
                if (tagName === 'label') {
                    const customSelect = this.page.locator(`text=${keyword}`).locator('xpath=./ancestor::div[contains(@class, "fab-FormRow")]//div[contains(@class, "fab-Select-control")] | ./ancestor::div[contains(@class, "form")]//div[contains(@class, "select")] | ./following::div[contains(@class, "select")]').first();
                    if (await customSelect.isVisible()) {
                        input = customSelect;
                    }
                }
            }

            if (await input.isVisible()) {
                const tagName = await input.evaluate(el => el.tagName.toLowerCase());
                const type = await input.getAttribute('type');

                // === 1. Smart "Right to Work" / Radios ===
                if (keyword.match(/right to work|work auth|visa|eligibility|legal/i) || type === 'radio') {
                    let questionText = keyword;
                    try {
                        const labelText = await input.evaluate(el => {
                            const id = el.id;
                            if (id) {
                                const label = document.querySelector(`label[for="${id}"]`);
                                return label ? label.textContent || '' : '';
                            }
                            return el.getAttribute('aria-label') || '';
                        });
                        if (labelText) questionText = labelText;
                    } catch { }

                    let answer = 'No';
                    if (questionText.match(/india/i) || value.match(/india/i)) {
                        answer = 'Yes';
                    }

                    const container = this.page.getByText(new RegExp(keyword.substring(0, 25), 'i')).locator('xpath=./ancestor::div[contains(@class, "form")] | ./ancestor::tr | ./ancestor::div[contains(@class, "Check")]').first();

                    if (await container.isVisible()) {
                        const option = container.getByText(new RegExp(`^${answer}$`, 'i'), { exact: true }).first();
                        if (await option.isVisible()) {
                            await option.click();
                            console.log(`Clicked custom radio option "${answer}" for "${keyword}"`);
                            return true;
                        }
                    }
                }

                // === 2. Dropdown (Custom & Native) - SIGNIFICANTLY SLOWED DOWN ===
                const classAttr = await input.getAttribute('class') || '';
                const isCustomSelect = classAttr.match(/select|dropdown/i) || tagName === 'div';
                const isLocationField = keyword.match(/country|state|city|location/i);

                console.log(`[DEBUG] Field "${keyword}": tagName=${tagName}, isCustomSelect=${isCustomSelect}, isLocationField=${isLocationField}`);

                if (tagName === 'select' || (isCustomSelect && isLocationField)) {
                    // Use the actual value from profile - NO HARDCODING
                    const targetValue = value;

                    console.log(`[SLOW MODE] ✓ Detected dropdown field for "${keyword}"`);
                    console.log(`[SLOW MODE] ✓ Target value from profile: "${targetValue}"`);
                    console.log(`[SLOW MODE] ✓ Element type: ${tagName === 'select' ? 'Native SELECT' : 'Custom Dropdown'}`);

                    const doSelect = async () => {
                        if (tagName === 'select') {
                            console.log(`[SLOW MODE] Using native SELECT element...`);
                            await this.page.waitForTimeout(1000);
                            try {
                                await input.selectOption({ label: targetValue });
                                console.log(`[SLOW MODE] ✓ Selected by label: "${targetValue}"`);
                            } catch (e) {
                                console.log(`[SLOW MODE] Label match failed, trying fuzzy match...`);
                                const options = await input.locator('option').allInnerTexts();
                                console.log(`[SLOW MODE] Available options: ${JSON.stringify(options)}`);
                                const match = options.find(o => o.toLowerCase().includes(targetValue.toLowerCase()));
                                if (match) {
                                    await input.selectOption({ label: match });
                                    console.log(`[SLOW MODE] ✓ Selected fuzzy match: "${match}"`);
                                } else {
                                    await input.selectOption({ value: targetValue });
                                    console.log(`[SLOW MODE] ✓ Selected by value: "${targetValue}"`);
                                }
                            }
                        } else {
                            // Custom Select - VERY SLOW
                            console.log(`[SLOW MODE] Using CUSTOM dropdown...`);
                            console.log(`[SLOW MODE] Step 1: Clicking dropdown...`);
                            await this.page.waitForTimeout(2000);
                            await input.click();
                            console.log(`[SLOW MODE] ✓ Clicked`);

                            console.log(`[SLOW MODE] Step 2: Waiting for dropdown to open...`);
                            await this.page.waitForTimeout(2000);
                            console.log(`[SLOW MODE] ✓ Wait complete`);

                            console.log(`[SLOW MODE] Step 3: Typing "${targetValue}"...`);
                            await this.page.keyboard.type(targetValue, { delay: 100 });
                            console.log(`[SLOW MODE] ✓ Typed`);

                            console.log(`[SLOW MODE] Step 4: Waiting for filter (2.5s)...`);
                            await this.page.waitForTimeout(2500);
                            console.log(`[SLOW MODE] ✓ Filter wait complete`);

                            // Extra delay for country field specifically
                            if (keyword.match(/country/i)) {
                                console.log(`[SLOW MODE] 🌍 Country field - adding extra 2s delay after typing...`);
                                await this.page.waitForTimeout(2000);
                                console.log(`[SLOW MODE] ✓ Extra country delay complete`);
                            }

                            console.log(`[SLOW MODE] Step 5: Looking for EXACT match option...`);

                            // Get all visible options and find exact match
                            const allOptions = this.page.locator('.fab-Select-option, .Select-option, div[role="option"]');
                            const count = await allOptions.count();
                            console.log(`[SLOW MODE] Found ${count} total options`);

                            let exactMatchOption = null;
                            for (let i = 0; i < count; i++) {
                                const opt = allOptions.nth(i);
                                const isVis = await opt.isVisible().catch(() => false);
                                if (isVis) {
                                    const text = await opt.innerText();
                                    const trimmedText = text.trim();
                                    console.log(`[SLOW MODE] Option ${i}: "${trimmedText}"`);

                                    if (trimmedText === targetValue) {
                                        console.log(`[SLOW MODE] ✓ Found EXACT match at index ${i}!`);
                                        exactMatchOption = opt;
                                        break;
                                    }
                                }
                            }

                            if (exactMatchOption) {
                                console.log(`[SLOW MODE] Step 6: Clicking exact match option...`);
                                await this.page.waitForTimeout(500);
                                await exactMatchOption.click();
                                console.log(`[SLOW MODE] ✓ Exact match option clicked`);
                            } else {
                                console.log(`[SLOW MODE] Step 6: No exact match found via iteration`);
                                console.log(`[SLOW MODE] Trying fallback: Clear and retype, then Arrow Down + Enter...`);

                                // Clear the input
                                await this.page.keyboard.press('Control+A');
                                await this.page.keyboard.press('Backspace');
                                await this.page.waitForTimeout(500);

                                // Retype
                                await this.page.keyboard.type(targetValue, { delay: 100 });
                                await this.page.waitForTimeout(2000);

                                // Press Down arrow to select filtered option, then Enter
                                // For country field, press Down TWICE (British Indian Ocean Territory is first, India is second)
                                if (keyword.match(/country/i)) {
                                    console.log(`[SLOW MODE] Country field - pressing Arrow Down TWICE to select India (2nd option)...`);
                                    await this.page.keyboard.press('ArrowDown');
                                    await this.page.waitForTimeout(300);
                                    await this.page.keyboard.press('ArrowDown');
                                    await this.page.waitForTimeout(300);
                                } else {
                                    await this.page.keyboard.press('ArrowDown');
                                    await this.page.waitForTimeout(500);
                                }
                                await this.page.keyboard.press('Enter');
                                console.log(`[SLOW MODE] ✓ Fallback: Arrow Down + Enter executed`);
                            }
                        }
                    };

                    await doSelect();
                    console.log(`[SLOW MODE] ✅ COMPLETED dropdown "${keyword}" with "${targetValue}"`);

                    // CRITICAL: Wait for State reload if Country was changed
                    if (keyword.match(/country/i)) {
                        console.log("[SLOW MODE] 🌍 Country field detected - waiting 5s for dependent fields to reload...");
                        await this.page.waitForTimeout(5000);
                        console.log("[SLOW MODE] ✓ State reload wait complete");
                    }

                    return true;
                }

                // === 3. Date Handling ===
                if (type === 'date' || keyword.match(/date/i)) {
                    const dateVal = new Date(value);
                    if (!isNaN(dateVal.getTime())) {
                        const day = String(dateVal.getDate()).padStart(2, '0');
                        const month = String(dateVal.getMonth() + 1).padStart(2, '0');
                        const year = dateVal.getFullYear();

                        if (type === 'date') {
                            await this.page.waitForTimeout(500);
                            await input.fill(dateVal.toISOString().split('T')[0]);
                        } else {
                            await input.click();
                            await this.page.waitForTimeout(500);
                            await input.fill(`${day}/${month}/${year}`);
                            await input.press('Enter');
                        }
                        console.log(`Filled DATE field matching "${keyword}"`);
                        return true;
                    }
                }

                await input.fill(value);
                return true;
            }
        } catch { }

        try {
            const input = this.page.getByPlaceholder(new RegExp(keyword, 'i')).first();
            if (await input.isVisible()) await input.fill(value);
        } catch { }

        return false;
    }

    private async uploadResume(path: string): Promise<void> {
        try {
            console.log(`[SLOW MODE] Attempting to upload resume from: ${path}`);

            console.log("[SLOW MODE] Waiting 3s for page to be ready...");
            await this.page.waitForTimeout(3000);

            await this.page.evaluate(() => {
                document.querySelectorAll('input[type="file"]').forEach(i => {
                    (i as HTMLElement).style.display = 'block';
                    (i as HTMLElement).style.visibility = 'visible';
                    (i as HTMLElement).style.opacity = '1';
                    (i as HTMLElement).style.width = '1px';
                    (i as HTMLElement).style.height = '1px';
                    (i as HTMLElement).removeAttribute('hidden');
                });
            });

            console.log("[SLOW MODE] Looking for Resume input...");
            let fileInput = this.page.locator('//label[contains(translate(text(), "RESUME", "resume"), "resume") and not(contains(translate(text(), "COVER", "cover"), "cover letter"))]//input[@type="file"] | //label[contains(translate(text(), "RESUME", "resume"), "resume") and not(contains(translate(text(), "COVER", "cover"), "cover letter"))]/following::input[@type="file"][1]').first();

            if (await fileInput.count() === 0) {
                const resumeLabel = this.page.getByText('Resume', { exact: true }).or(this.page.getByText('Resume *')).first();
                if (await resumeLabel.isVisible()) {
                    fileInput = resumeLabel.locator('xpath=./following::input[@type="file"][1]').first();
                }
            }

            if (await fileInput.count() === 0) {
                fileInput = this.page.locator('input[type="file"]').first();
            }

            if (await fileInput.count() > 0) {
                console.log("[SLOW MODE] Setting file...");
                await fileInput.setInputFiles(path);
                console.log("[SLOW MODE] Uploaded resume, waiting 3s for processing...");
                await this.page.waitForTimeout(3000);
            } else {
                console.log("⚠ Could not find Resume input.");
            }
        } catch (e) {
            console.error("Failed to upload resume", e);
        }
    }

    async uploadCoverLetter(path: string): Promise<void> {
        try {
            const fileInput = this.page.locator('//label[contains(translate(text(), "COVER", "cover"), "cover letter")]//input[@type="file"] | //label[contains(translate(text(), "COVER", "cover"), "cover letter")]/following::input[@type="file"][1]').first();

            if (await fileInput.count() > 0) {
                await fileInput.setInputFiles(path);
                console.log("Uploaded cover letter");
            }
        } catch (e) {
            console.error("Failed to upload cover letter", e);
        }
    }

    async waitForSubmission(): Promise<void> {
        console.log("=== Auto-Submit Mode ===");
        console.log("Looking for Submit/Apply button to click automatically...");

        try {
            // Wait a bit for any final form processing
            await this.page.waitForTimeout(2000);

            // Try to find and click the submit button
            const submitButton = this.page.locator(
                'button[type="submit"],' +
                'button:has-text("Submit Application"),' +
                'button:has-text("Submit"),' +
                'button:has-text("Apply"),' +
                'button:has-text("Send Application"),' +
                'input[type="submit"],' +
                'button.submit,' +
                'button#submit'
            ).first();

            const isVisible = await submitButton.isVisible({ timeout: 3000 }).catch(() => false);

            if (isVisible) {
                console.log("✓ Found Submit button - clicking automatically...");
                await submitButton.click();
                await this.page.waitForTimeout(3000);

                // Check for success confirmation
                const successIndicators = this.page.locator(
                    'text=/application.*submitted/i,' +
                    'text=/thank you/i,' +
                    'text=/successfully.*applied/i,' +
                    'text=/application.*received/i'
                );

                const hasSuccess = await successIndicators.first().isVisible({ timeout: 5000 }).catch(() => false);

                if (hasSuccess) {
                    console.log("✅ Application submitted successfully!");
                } else {
                    console.log("⚠ Submit button clicked, but no confirmation message detected");
                }

                // Wait a bit to see the result
                await this.page.waitForTimeout(3000);
            } else {
                console.log("⚠ No Submit button found - form may require manual review");
                console.log("Waiting 30 seconds for manual review...");
                await this.page.waitForTimeout(30000);
            }
        } catch (e) {
            console.error("Error during auto-submit:", e);
            console.log("Waiting 30 seconds for manual review...");
            await this.page.waitForTimeout(30000);
        }
    }
}
