
import { LinkedInFormFiller } from '../core/linkedin-form-filler';
import { UserProfile } from '../core/form-filler';
import { QuestionBank } from '../core/utils/question-bank';
import { Page } from 'playwright';

// Mock Page
const mockPage = {} as Page;

// Mock Profile
const mockProfile: UserProfile = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "1234567890",
    linkedinData: "",
    resumePath: "",
    yearsOfExperience: "8",
    noticePeriod: "Immediate", // Should map to "15"
    skillsExperience: [
        { skill: "Microservices", years: 3 },
        { skill: "Java", years: 5 }
    ]
};

async function runTests() {
    console.log("=== Starting Logic Verification ===");

    const filler = new LinkedInFormFiller(mockPage);
    const fillerAny = filler as any;

    // Test 1: Microservices Experience (Should be 3, not 8)
    const q1 = "How many years of work experience do you have with Microservices?";
    const ans1 = fillerAny.getProfileValue(q1, mockProfile);
    console.log(`Q: "${q1}"`);
    console.log(`A: "${ans1}" (Expected: "3")`);
    if (ans1 === "3") console.log("✅ PASS");
    else console.error("❌ FAIL");

    // Test 2: Notice Period (Should be "15" for "Immediate")
    const q2 = "What is your notice period?";
    const ans2 = fillerAny.getProfileValue(q2, mockProfile);
    console.log(`Q: "${q2}"`);
    console.log(`A: "${ans2}" (Expected: "15")`);
    if (ans2 === "15") console.log("✅ PASS");
    else console.error("❌ FAIL");

    // Test 3: Generic Experience (Should be 8)
    const q3 = "How many years of work experience do you have?";
    const ans3 = fillerAny.getProfileValue(q3, mockProfile);
    console.log(`Q: "${q3}"`);
    console.log(`A: "${ans3}" (Expected: "8")`);
    if (ans3 === "8") console.log("✅ PASS");
    else console.error("❌ FAIL");

    // Test 4: Question Bank
    console.log("\nTesting Question Bank...");
    const qBank = "What is your favorite color?";
    QuestionBank.getInstance().addUnmappedQuestion(qBank, 'text');

    // Manually inject answer
    const qbInstance = QuestionBank.getInstance() as any;
    const key = qbInstance.normalize(qBank);
    qbInstance.questions[key].answer = "Blue";
    qbInstance.save();

    const ans4 = fillerAny.getProfileValue(qBank, mockProfile);
    console.log(`Q: "${qBank}"`);
    console.log(`A: "${ans4}" (Expected: "Blue")`);
    if (ans4 === "Blue") console.log("✅ PASS");
    else console.error("❌ FAIL");

}

runTests().catch(console.error);
