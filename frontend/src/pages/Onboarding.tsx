import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import BasicInfoStep from '../components/Onboarding/BasicInfoStep';
import ProfessionalStep from '../components/Onboarding/ProfessionalStep';
import ResumeStep from '../components/Onboarding/ResumeStep';
import MetadataStep from '../components/Onboarding/MetadataStep';
import { CheckCircle, Zap } from 'lucide-react';

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [profileData, setProfileData] = useState<any>({});
    const [loading, setLoading] = useState(true);

    const steps = [
        { id: 1, title: 'Basic Info', component: BasicInfoStep },
        { id: 2, title: 'Professional', component: ProfessionalStep },
        { id: 3, title: 'Resume & Links', component: ResumeStep },
        { id: 4, title: 'Auto-Fill Data', component: MetadataStep },
    ];

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        try {
            const response = await apiClient.get('/onboarding/progress');
            if (response.data?.completed) {
                navigate('/dashboard');
                return;
            }

            const savedStep = Number(response.data?.currentStep);
            const nextStep = Number.isFinite(savedStep) ? savedStep + 1 : 1;
            setCurrentStep(Math.min(Math.max(nextStep, 1), steps.length));
            setProfileData(response.data.profile || {});
        } catch (error) {
            console.error('Failed to load progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async (stepData: any) => {
        try {
            if (currentStep < 4) {
                await apiClient.patch(`/onboarding/step/${currentStep}`, stepData);
                setProfileData({ ...profileData, ...stepData });
                setCurrentStep(currentStep + 1);
            } else {
                await apiClient.patch(`/onboarding/step/${currentStep}`, stepData);
                setProfileData({ ...profileData, ...stepData });
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Failed to save step:', error);
            alert('Failed to save. Please try again.');
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = async () => {
        if (window.confirm('Skip onboarding? You can complete it later from settings.')) {
            try {
                await apiClient.patch('/onboarding/skip');
                navigate('/dashboard');
            } catch (error) {
                console.error('Failed to skip:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-medium">Loading your journey...</p>
                </div>
            </div>
        );
    }

    const activeStep = steps[currentStep - 1];
    const CurrentStepComponent = activeStep.component;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            {/* Header */}
            <div className="flex items-center justify-center gap-2 mb-10 animate-fade-in">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30">
                    <Zap className="w-5 h-5 fill-current" />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">JobApplyer<span className="text-blue-600">.ai</span></span>
            </div>

            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                {/* Progress Indicators */}
                <div className="relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 rounded-full -translate-y-1/2 z-0"></div>
                    <div className="absolute top-1/2 left-0 h-1 bg-blue-600 rounded-full -translate-y-1/2 z-0 transition-all duration-500 ease-out" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>

                    <div className="relative z-10 flex justify-between">
                        {steps.map((step) => {
                            const isCompleted = step.id < currentStep;
                            const isCurrent = step.id === currentStep;

                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 group cursor-default">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm border-2 
                                            ${isCompleted ? 'bg-blue-600 border-blue-600 text-white scale-100' :
                                                isCurrent ? 'bg-white border-blue-600 text-blue-600 scale-110 shadow-blue-200' :
                                                    'bg-white border-slate-200 text-slate-400'}`}
                                    >
                                        {isCompleted ? <CheckCircle className="w-6 h-6" /> : step.id}
                                    </div>
                                    <span
                                        className={`text-xs font-semibold uppercase tracking-wide transition-colors duration-300
                                            ${isCurrent ? 'text-blue-600 translate-y-0' : 'text-slate-400 translate-y-1'}`}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Card */}
                <div className="glass-panel p-8 md:p-10 rounded-2xl shadow-xl transition-all duration-500">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{activeStep.title}</h1>
                        <p className="text-slate-500">Please provide your details so our AI can represent you best.</p>
                    </div>

                    <CurrentStepComponent
                        data={profileData || {}} // Ensure data is not null
                        onNext={handleNext}
                        onBack={currentStep > 1 ? handleBack : undefined}
                        onSkip={handleSkip}
                    />
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
