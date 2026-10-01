"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const question_schema_1 = require("../questions/schemas/question.schema");
dotenv.config({ path: path.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-applyer';
const seedQuestions = async () => {
    console.log('Connecting to MongoDB at', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');
    const QuestionModel = mongoose.model('Question', question_schema_1.QuestionSchema);
    const dataPath = path.join(__dirname, 'questions_data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);
    const screeningQuestions = data.screeningQuestions || [];
    const openEndedQuestions = data.openEndedQuestions || [];
    let count = 0;
    for (const q of screeningQuestions) {
        try {
            await QuestionModel.updateOne({ text: q.question }, {
                $setOnInsert: {
                    text: q.question,
                    type: q.type === 'boolean' ? 'boolean' : (q.type === 'number' ? 'number' : 'text'),
                    category: 'screening'
                }
            }, { upsert: true });
            console.log(`Processed: ${q.question}`);
            count++;
        }
        catch (e) {
            console.error(`Error processing ${q.question}:`, e.message);
        }
    }
    for (const q of openEndedQuestions) {
        try {
            await QuestionModel.updateOne({ text: q.question }, {
                $setOnInsert: {
                    text: q.question,
                    type: 'text',
                    category: 'behavioral'
                }
            }, { upsert: true });
            console.log(`Processed: ${q.question}`);
            count++;
        }
        catch (e) {
            console.error(`Error processing ${q.question}:`, e.message);
        }
    }
    console.log(`Seeding complete. Processed ${count} questions.`);
    await mongoose.disconnect();
};
seedQuestions().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed-questions.js.map