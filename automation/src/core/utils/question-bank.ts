import * as fs from 'fs';
import * as path from 'path';

export interface QuestionEntry {
    question: string;
    answer?: string; // Optional: user might need to fill this manually in the JSON
    type?: string;
    createdAt: string;
    usageCount: number;
}

export class QuestionBank {
    private static instance: QuestionBank;
    private dbPath: string;
    private questions: Record<string, QuestionEntry> = {};

    private constructor() {
        // Resolve path relative to where the script runs, or a fixed location
        // For this project, we'll try to store it in the automation root under 'data'
        const rootDir = path.resolve(__dirname, '../../../../'); // Adjust based on dist structure
        const dataDir = path.join(rootDir, 'data');

        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        this.dbPath = path.join(dataDir, 'question_bank.json');
        this.load();
    }

    public static getInstance(): QuestionBank {
        if (!QuestionBank.instance) {
            QuestionBank.instance = new QuestionBank();
        }
        return QuestionBank.instance;
    }

    private load() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const data = fs.readFileSync(this.dbPath, 'utf-8');
                this.questions = JSON.parse(data);
            }
        } catch (e) {
            console.error('[QuestionBank] Failed to load DB:', e);
            this.questions = {};
        }
    }

    public save() {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(this.questions, null, 2));
        } catch (e) {
            console.error('[QuestionBank] Failed to save DB:', e);
        }
    }

    public getAnswer(question: string): string | null {
        // Normalize question for lookup (simple normalization)
        const key = this.normalize(question);
        const entry = this.questions[key];

        if (entry && entry.answer) {
            entry.usageCount++;
            this.save(); // Persist usage count
            return entry.answer;
        }
        return null;
    }

    public addUnmappedQuestion(question: string, type: string = 'text') {
        const key = this.normalize(question);

        if (!this.questions[key]) {
            this.questions[key] = {
                question: question, // Keep original text
                type,
                createdAt: new Date().toISOString(),
                usageCount: 0
            };
            this.save();
            console.log(`[QuestionBank] New unmapped question added: "${question}"`);
        }
    }

    private normalize(text: string): string {
        return text.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '');
    }
}
