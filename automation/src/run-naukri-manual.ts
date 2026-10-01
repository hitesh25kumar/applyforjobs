
import { NaukriAutomationEngine } from './core/naukri-automation-engine';
import { UserProfile } from './core/form-filler';
import * as path from 'path';

// Dummy profile for manual testing - the goal is just to trigger the engine loop
// The actual resume/details will be used if already filled in Naukri, or manual intervention is expected.
const manualProfile: UserProfile = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '9999999999',
    linkedinData: '',
    portfolio: '',
    resumePath: path.resolve(__dirname, '../../uploads/resume.pdf'), // Dummy path
    preferredCity: 'Bangalore',
    coverLetter: ''
};

async function runManual() {
    console.log('================================================');
    console.log('🚀 NAUKRI AUTOMATION - MANUAL TERMINAL MODE ');
    console.log('================================================');
    console.log('Ensure you are logged in during the wait period!');

    const engine = new NaukriAutomationEngine();

    try {
        await engine.run(manualProfile, {
            keyword: process.env.KEYWORD || 'Product Manager',
            headless: false, // ALWAYS VISIBLE
            maxJobs: 50,
            sessionPath: path.resolve(__dirname, '../sessions/naukri.json')
        });
    } catch (error) {
        console.error('Manual run failed:', error);
    }
}

runManual();
