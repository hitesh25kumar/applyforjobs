import { Page } from 'playwright';
import { UserProfile } from './form-filler';
import { QuestionBank } from './utils/question-bank';

export interface QuestionAnswer {
    question: string;
    answer: string;
    fieldType?: string;
    category?: string;
}

export class LinkedInFormFiller {
    private questionAnswers: QuestionAnswer[] = [];

    constructor(
        private page: Page,
        private onUnmappedQuestion?: (question: string, type: string, category: string) => void
    ) { }

    async applyToJob(profile: UserProfile): Promise<{ success: boolean; questions: QuestionAnswer[] }> {
        const fillerVersion = "1.5";
        const maxSteps = 20;
        this.questionAnswers = []; // Reset for each application
        console.log(`[LinkedIn] === Starting Easy Apply process (Version ${fillerVersion}) ===`);

        try {
            const detailPanel = this.page.locator('.jobs-search__job-details, .jobs-unified-top-card, .job-details-jobs-unified-top-card').first();
            const easyApplyButton = detailPanel.locator(
                'button.jobs-apply-button, button:has-text("Easy Apply"), button[aria-label*="Easy Apply"]'
            ).first();

            console.log('[LinkedIn] Clicking Easy Apply button...');
            await easyApplyButton.scrollIntoViewIfNeeded();
            await easyApplyButton.click({ force: true });

            // Wait for modal stability
            const modal = this.page.locator('.jobs-details-apply-modal, .jobs-easy-apply-modal, [role="dialog"]:has-text("Apply")').first();
            await modal.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { throw new Error("Modal didn't appear") });

            let currentStep = 1;
            let stalledCount = 0;

            while (currentStep <= maxSteps) {
                console.log(`\n[LinkedIn] --- Step ${currentStep} (Stalled: ${stalledCount}) ---`);

                // Capture current modal state depth to detect navigation success
                const preClickHtml = await modal.innerHTML().catch(() => "");

                const wasSkipped = await this.fillCurrentStep(profile);

                // Speed optimization: wait less if step was skipped
                const waitTime = wasSkipped ? 500 : 2000;
                await this.page.waitForTimeout(waitTime);

                const submitButton = this.page.locator('button:has-text("Submit"), button[aria-label="Submit application"]').first();
                const nextButton = this.page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Review")').first();

                if (await submitButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                    console.log('[LinkedIn] Clicking Submit...');
                    await submitButton.click({ force: true });
                    await this.page.waitForTimeout(5000);

                    const success = await this.page.getByText(
                        /application (was )?sent|application submitted|thank you for applying|application received/i
                    ).first().isVisible({ timeout: 5000 }).catch(() => false);
                    if (success) {
                        console.log('[LinkedIn] ✅ Application successful!');
                        await this.closeModal();
                        return { success: true, questions: this.questionAnswers };
                    }
                    console.log('[LinkedIn] ⚠ No application confirmation was detected after Submit.');
                    return { success: false, questions: this.questionAnswers };
                } else if (await nextButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                    const btnText = await nextButton.innerText().catch(() => "Next");
                    console.log(`[LinkedIn] Clicking "${btnText}"...`);
                    await nextButton.click({ force: true });

                    // Speed optimization: wait less if step was skipped
                    const nextWait = wasSkipped ? 1000 : 3000;
                    await this.page.waitForTimeout(nextWait);

                    const postClickHtml = await modal.innerHTML().catch(() => "");
                    // Use length check for HTML state as a proxy for navigation
                    if (preClickHtml.length === postClickHtml.length) {
                        stalledCount++;
                        console.log(`[LinkedIn] ⚠ Navigation stalled. Error on page? (Attempt ${stalledCount}/3)`);
                        if (stalledCount >= 3) {
                            console.log('[LinkedIn] ❌ Stalled too long. Aborting.');
                            break;
                        }
                        continue;
                    } else {
                        stalledCount = 0;
                        currentStep++;
                    }
                } else {
                    console.log(`[LinkedIn] ⚠ No action button found on Step ${currentStep}`);
                    break;
                }
            }

            await this.closeModal();
            return { success: false, questions: this.questionAnswers };
        } catch (e) {
            console.error('[LinkedIn] Fatal Error:', (e as Error).message);
            await this.closeModal();
            return { success: false, questions: this.questionAnswers };
        }
    }

    private async closeModal(): Promise<void> {
        try {
            const closeBtn = this.page.locator('button[aria-label="Dismiss"], button[aria-label="Close"]').first();
            if (await closeBtn.isVisible({ timeout: 1000 })) {
                await closeBtn.click();
                await this.page.waitForTimeout(1000);
                const discard = this.page.locator('button:has-text("Discard")').first();
                if (await discard.isVisible({ timeout: 1000 })) await discard.click();
            }
        } catch { }
    }

    private async fillCurrentStep(profile: UserProfile): Promise<boolean> {
        console.log('[LinkedIn] Scanning questions for current step...');

        // Wait for stability
        await this.page.waitForTimeout(1000);

        const scrollContainer = this.page.locator('.jobs-easy-apply-content, .jobs-easy-apply-modal, .artdeco-modal__content').first();
        if (await scrollContainer.isVisible()) {
            await scrollContainer.evaluate(el => el.scrollTo(0, 500));
            await this.page.waitForTimeout(500);
            await scrollContainer.evaluate(el => el.scrollTo(0, 0));
            await this.page.waitForTimeout(500);
        }

        // Logic for skipping steps
        const stepHeader = await this.page.locator('.jobs-easy-apply-form-section__title, h3, h4').first().innerText().catch(() => "").then(t => t.toLowerCase());

        // 1. Skip Contact step if filled
        // if (profile.skipContactStepIfFilled !== false && (stepHeader.includes('contact info') || stepHeader.includes('contact information'))) {
        //     const phone = await this.page.locator('input[id*="phoneNumber"], input[name*="phoneNumber"]').first().inputValue().catch(() => "");
        //     const email = await this.page.locator('input[id*="emailAddress"], input[name*="emailAddress"]').first().inputValue().catch(() => "");
        //     if (phone || email) {
        //         console.log(`[LinkedIn] Skipping "${stepHeader}" step as it is already populated.`);
        //         return true;
        //     }
        // }

        // 2. Skip Resume step if filled
        // if (profile.skipResumeStepIfFilled !== false && stepHeader.includes('resume')) {
        //     const hasExistingResume = await this.page.locator('.jobs-document-upload-redesign-card__container, .jobs-document-upload-redesign-card__file-name, .jobs-easy-apply-form-section__grouping .artdeco-button--tertiary').first().isVisible().catch(() => false);
        //     if (hasExistingResume) {
        //         console.log(`[LinkedIn] Skipping "${stepHeader}" step as a resume is already present.`);
        //         return true;
        //     }
        // }

        const containers = await this.page.locator('.fb-dash-form-element, .jobs-easy-apply-form-section__grouping').all();
        console.log(`[LinkedIn] Found ${containers.length} question blocks`);

        for (const container of containers) {
            try {
                const labelElem = container.locator('label').first();
                if (!await labelElem.isVisible()) continue;

                let labelText = await labelElem.innerText().catch(() => "");
                // Clean the question text: take the first line and remove markers
                labelText = labelText.split('\n')[0].replace(/\*|:|Required|Select/gi, '').trim();

                if (!labelText) continue;

                const isEmailField = /\bemail\b/i.test(labelText);
                const isPhoneField = /\b(phone|mobile|telephone)\b/i.test(labelText);
                let input = container.locator('input, select, textarea').first();
                if (isEmailField || isPhoneField) {
                    const contactFields = isEmailField
                        ? container.locator('input[type="email"], input[name*="email" i], input[id*="email" i], input[placeholder*="email" i], input[type="text"], input:not([type])')
                        : container.locator('input[type="tel"], input[name*="phone" i], input[id*="phone" i], input[placeholder*="phone" i], input[type="text"], input:not([type])');
                    if (await contactFields.count() === 0) {
                        console.log(`[LinkedIn]   No contact input found for "${labelText}"`);
                        continue;
                    }
                    input = contactFields.first();
                }
                if (!await input.isVisible()) continue;

                const value = await this.getProfileValue(labelText, profile);
                if (value === null) {
                    console.log(`[LinkedIn]   Skipping: "${labelText}" (No profile match)`);
                    if (this.onUnmappedQuestion) {
                        const questionType = await input.evaluate((el: any) => el.tagName.toLowerCase() === 'select' ? 'select' : el.getAttribute('type') || 'text');
                        const category = this.categorizeQuestion(labelText);
                        this.onUnmappedQuestion(labelText, questionType, category);
                    }

                    // Keep local bank for fallback/offline dev
                    QuestionBank.getInstance().addUnmappedQuestion(labelText, 'text');
                    continue;
                }

                if (isEmailField || isPhoneField) {
                    const current = await input.inputValue().catch(() => '');
                    const normalizeContact = (contact: string) => isEmailField
                        ? contact.trim().toLowerCase()
                        : contact.replace(/\D/g, '');
                    if (current && normalizeContact(current) === normalizeContact(value)) {
                        console.log(`[LinkedIn]   Skipping already-matching contact field "${labelText}"`);
                        continue;
                    }
                }

                console.log(`[LinkedIn]   Matching: "${labelText}" -> "${value}"`);

                const tagName = await input.evaluate((el: HTMLElement) => el.tagName.toLowerCase());
                let fieldType = tagName;

                if (tagName === 'select') {
                    fieldType = 'select';
                    const selected = await this.handleDropdown(input, value);
                    if (!selected) {
                        console.log(`[LinkedIn]   Could not select dropdown answer "${value}" for "${labelText}"`);
                        continue;
                    }
                } else if (await input.getAttribute('type') === 'radio') {
                    fieldType = 'radio';
                    const selected = await this.handleChoice(container, value);
                    if (!selected) {
                        console.log(`[LinkedIn]   Could not select radio answer "${value}" for "${labelText}"`);
                        continue;
                    }
                } else {
                    fieldType = await input.getAttribute('type') || 'text';
                    await this.handleTextInput(input, labelText, value);
                }

                // Track question and answer
                this.questionAnswers.push({
                    question: labelText,
                    answer: value,
                    fieldType,
                    category: this.categorizeQuestion(labelText)
                });
            } catch (e) {
                console.log(`[LinkedIn]   Error in block:`, (e as Error).message);
            }
        }
        return false;
    }

    private categorizeQuestion(question: string): string {
        const q = question.toLowerCase();
        if (q.includes('phone') || q.includes('mobile')) return 'contact';
        if (q.includes('email')) return 'contact';
        if (q.includes('city') || q.includes('location') || q.includes('address')) return 'location';
        if (q.includes('experience') || q.includes('years')) return 'experience';
        if (q.includes('salary') || q.includes('compensation') || q.includes('ctc')) return 'salary';
        if (q.includes('notice') || q.includes('availability') || q.includes('join')) return 'availability';
        if (q.includes('visa') || q.includes('sponsor') || q.includes('authorization')) return 'visa';
        if (q.includes('education') || q.includes('degree') || q.includes('university')) return 'education';
        if (q.includes('linkedin') || q.includes('website') || q.includes('portfolio')) return 'links';
        return 'other';
    }

    private async getProfileValue(label: string, profile: UserProfile): Promise<string | null> {
        const l = label.toLowerCase();

        if (l.includes('email')) return profile.email || null;
        if (l.includes('phone') || l.includes('mobile') || l.includes('telephone')) return profile.phone || null;

        // 0. Check Global Question Bank (injected via profile.savedAnswers)
        if (profile.savedAnswers) {
            const saved = profile.savedAnswers.find(sa => sa.question.toLowerCase() === l || l.includes(sa.question.toLowerCase()));
            if (saved) {
                console.log(`[LinkedIn]     Found global saved answer: "${saved.question}" -> "${saved.answer}"`);
                return saved.answer;
            }
        }

        // 1. Check Local Question Bank (fallback)
        const bankedAnswer = QuestionBank.getInstance().getAnswer(label);
        if (bankedAnswer) {
            console.log(`[LinkedIn]     Found banked answer: "${label}" -> "${bankedAnswer}"`);
            return bankedAnswer;
        }

        // 2. Check for manual mappings first
        if (profile.questionMappings) {
            // Check for exact or normalized match in mappings
            const mappingKey = Object.keys(profile.questionMappings).find(k =>
                k.toLowerCase() === l || l.includes(k.toLowerCase())
            );
            if (mappingKey) {
                const fieldName = profile.questionMappings[mappingKey];
                const value = (profile as any)[fieldName];
                if (value !== undefined && value !== null) {
                    console.log(`[LinkedIn]     Found matching mapping: "${label}" -> field "${fieldName}"`);
                    return String(value);
                }
            }
        }

        // Broaden matching for key fields
        if (l.includes('product management') && (l.includes('experience') || l.includes('years'))) return profile.productManagementExperience || null;

        if (l.includes('ctc') || l.includes('salary')) {
            if (l.includes('current')) return profile.currentCTC || null;
            if (l.includes('expected')) return profile.expectedCTC || null;
            return profile.expectedCTC || profile.currentCTC || null;
        }

        if (l.includes('notice period') || l.includes('available to start')) {
            // USER REQUEST: If "Immediate", return "15"
            const np = profile.noticePeriod || '';
            if (np.toLowerCase().includes('immediate') || np === '0') {
                return '15';
            }
            return np || null;
        }
        if (l.includes('15 days') || l.includes('how soon')) return profile.canJoinIn15Days || 'Yes';
        if (l.includes('agile') || l.includes('scrum')) return profile.agileScrumExperience || 'Yes';
        if (l.includes('hybrid') || l.includes('bangalore') || l.includes('bengaluru')) return profile.openToHybrid || 'Yes';
        if (l.includes('tech concepts') || l.includes('system design') || l.includes('api')) return profile.techConceptsKnowledge || 'Yes';
        if (l.includes('strategic roadmap')) return profile.strategicRoadmapExperience || null;
        if (l.includes('artificial intelligence') || l.includes('ai')) return profile.aiExperience || null;
        if (l.includes('ecommerce') || l.includes('ott')) return profile.ecommerceOTTExperience || 'Yes';
        if (l.includes('growth product')) return profile.growthProductExperience || 'Yes';

        if (l.includes('authorized') || l.includes('right to work')) return profile.rightToWork || 'Yes';
        if (l.includes('sponsorship')) return 'No';

        if (l.includes('city')) return profile.preferredCity || null;
        if (l.includes('state')) return profile.state || null;

        // 3. Smart Skills & Domain Experience Lookup & Numeric/YesNo Fallback
        const isExpQuestion = (l.includes('how many years') || l.includes('years of') || l.includes('experience')) && !l.includes('notice');
        const isYesNo = l.includes('do you have') || l.includes('have you');

        if (isExpQuestion || (isYesNo && !l.includes('authorize') && !l.includes('work'))) {
            const allExperience = [...(profile.skillsExperience || []), ...(profile.domainsExperience || [])];

            if (allExperience.length > 0) {
                // Try to find a skill/domain from the list that is mentioned in the question
                const matched = allExperience.find(s =>
                    l.includes(s.skill.toLowerCase()) || s.skill.toLowerCase().split(' ').every(word => l.includes(word))
                );

                if (matched) {
                    console.log(`[LinkedIn]     Found matching exp/domain: "${matched.skill}" -> ${matched.years} years`);
                    // Fix: If it's an experience question (checks for "years"), return the number, even if "do you have" is present.
                    return (isYesNo && !isExpQuestion) ? "Yes" : String(matched.years);
                }
            }

            // Fallback for numeric experience questions if no match found
            if (l.includes('how many') || l.includes('number of')) {
                // Now we can use the generic years of experience if it's a generic question
                // Or if we failed to match a specific skill but it asks for years
                if (l.includes('experience') && !l.includes('product')) { // excluded product management handled above
                    console.log(`[LinkedIn]     Generic experience fallback: "${profile.yearsOfExperience}"`);
                    return profile.yearsOfExperience || "0";
                }

                console.log(`[LinkedIn]     Numeric experience fallback (no profile match): "0"`);
                return "0";
            }

            // Fallback for Yes/No domain questions if no match found
            if (isYesNo) {
                console.log(`[LinkedIn]     Yes/No domain fallback: "No"`);
                return "No";
            }
        }

        return null;
    }

    private async handleTextInput(input: any, label: string, value: string): Promise<void> {
        const current = await input.inputValue().catch(() => "");

        let val = value;
        // Strict number extraction for numeric-ish fields
        if (label.toLowerCase().includes('years') || label.toLowerCase().includes('ctc') || label.toLowerCase().includes('period')) {
            const m = value.match(/\d+/);
            if (m) val = m[0];
        }

        if (current.trim() === val.trim()) return;

        await input.scrollIntoViewIfNeeded();
        await input.fill(val);
        console.log(`[LinkedIn]     Field filled: "${val}"`);
    }

    private async handleDropdown(select: any, value: string): Promise<boolean> {
        const normalize = (option: string) => option.trim().toLowerCase();
        const target = normalize(value);
        const options: Array<{ label: string; value: string }> = await select.locator('option').evaluateAll((elements: HTMLOptionElement[]) =>
            elements.map((option: HTMLOptionElement) => ({
                label: option.label || option.textContent || '',
                value: option.value
            }))
        );
        const currentValue = await select.inputValue().catch(() => '');
        const currentOption = options.find(option => option.value === currentValue);

        if (currentOption && [currentOption.label, currentOption.value]
            .some(option => normalize(option) === target)) {
            console.log(`[LinkedIn]     Dropdown already has value: "${value}"`);
            return true;
        }

        const match = options.find(option =>
            [option.label, option.value].some(candidate => normalize(candidate) === target)
        ) ?? options.find(option =>
            [option.label, option.value].some(candidate => normalize(candidate).includes(target))
        );

        if (!match) {
            console.log(`[LinkedIn]     No dropdown option matches: "${value}"`);
            return false;
        }

        try {
            await select.selectOption({ value: match.value }, { timeout: 2000 });
            console.log(`[LinkedIn]     Dropdown selected: "${value}"`);
            return true;
        } catch {
            console.log(`[LinkedIn]     Dropdown selection failed for: "${value}"`);
            return false;
        }
    }

    private async handleChoice(container: any, value: string): Promise<boolean> {
        const normalize = (option: string) => option.replace(/[*:]/g, '').trim().toLowerCase();
        const answer = normalize(value);
        const target = answer === 'true' ? 'yes' : answer === 'false' ? 'no' : answer;
        const radios = container.locator('input[type="radio"]');

        for (let index = 0; index < await radios.count(); index++) {
            const radio = radios.nth(index);
            const option = await radio.evaluate((element: HTMLInputElement) => ({
                value: element.value,
                label: Array.from(element.labels || []).map(label => label.innerText).join(' '),
                ariaLabel: element.getAttribute('aria-label') || ''
            }));
            const matches = [option.value, option.label, option.ariaLabel]
                .some(text => normalize(text) === target);

            if (!matches || !await radio.isEnabled()) continue;

            try {
                await radio.check({ force: true, timeout: 2000 });
            } catch {
                await radio.evaluate((element: HTMLInputElement) => element.labels?.[0]?.click());
            }

            if (await radio.isChecked()) {
                console.log(`[LinkedIn]     Choice selected: "${value}"`);
                return true;
            }
        }

        return false;
    }
}
