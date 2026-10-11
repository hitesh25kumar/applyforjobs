import { useState, useEffect } from 'react';
import { X, Briefcase, ShieldCheck } from 'lucide-react';
import { isAxiosError } from 'axios';
import api from '../api/client';

interface LinkedInProfileDefaults {
    defaultJobKeyword?: string;
    defaultLocation?: string;
    defaultMaxJobs?: number;
}

interface LinkedInJobSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
    localRunnerConnected: boolean;
    profile?: LinkedInProfileDefaults;
}

export const LinkedInJobSearchModal: React.FC<LinkedInJobSearchModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    onError,
    localRunnerConnected,
    profile: propProfile,
}) => {
    const [profile, setProfile] = useState<LinkedInProfileDefaults | null>(propProfile || null);
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [maxJobs, setMaxJobs] = useState(10);
    const [saveAsDefault, setSaveAsDefault] = useState(false);
    const [mockMode, setMockMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch profile if not provided
    useEffect(() => {
        if (!propProfile && isOpen) {
            fetchProfile();
        } else if (propProfile) {
            setProfile(propProfile);
        }
    }, [isOpen, propProfile]);

    // Auto-populate from profile defaults
    useEffect(() => {
        if (profile) {
            setKeyword(profile.defaultJobKeyword || '');
            setLocation(profile.defaultLocation || '');
            setMaxJobs(profile.defaultMaxJobs || 10);
        }
    }, [profile]);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setProfile(response.data);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mockMode && !localRunnerConnected) {
            onError('The local browser agent disconnected. Reconnect it or switch to Chrome extension mode.');
            return;
        }
        setIsSubmitting(true);

        try {
            // Save defaults if checkbox is checked
            if (saveAsDefault) {
                await api.patch('/profile', {
                    defaultJobKeyword: keyword,
                    defaultLocation: location,
                    defaultMaxJobs: maxJobs,
                });
            }

            if (mockMode) {
                await api.post('/automation/linkedin/mock', {
                    keyword,
                    location: location || undefined,
                    maxJobs,
                });
            } else {
                await api.post('/automation/local-runner/jobs', {
                    keyword,
                    location: location || undefined,
                    maxJobs,
                });
            }

            onSuccess(mockMode
                ? `Started a safe mock preview for "${keyword}". LinkedIn was not accessed.`
                : `Queued "${keyword}" for the connected local browser.`);
            onClose();
        } catch (error: unknown) {
            console.error(error);
            const message = isAxiosError<{ message?: unknown }>(error)
                ? error.response?.data?.message
                : undefined;
            onError(typeof message === 'string'
                ? message
                : mockMode
                    ? 'Could not start the safe preview. Please try again.'
                    : 'Could not queue the run. Connect your local browser agent first.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="size-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                        <Briefcase className="size-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">LinkedIn Auto Apply</h2>
                        <p className="text-sm text-slate-500">
                            {mockMode ? 'Preview the workflow without opening LinkedIn' : 'Search and apply to jobs automatically'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Job Title / Keyword *
                        </label>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="e.g., Product Manager, Software Engineer"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Location (Optional)
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., San Francisco, Remote"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">Leave empty to use your profile location</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {mockMode ? 'Mock jobs to preview' : 'Max Jobs to Apply'}
                        </label>
                        <input
                            type="number"
                            value={maxJobs}
                            onChange={(e) => setMaxJobs(parseInt(e.target.value) || 10)}
                            min="1"
                            max="50"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">Recommended: 5-15 jobs per session</p>
                    </div>

                    <div className="flex items-center gap-2 py-1">
                        <input
                            type="checkbox"
                            id="save-default"
                            checked={saveAsDefault}
                            onChange={(e) => setSaveAsDefault(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="save-default" className="text-sm font-medium text-slate-700 cursor-pointer">
                            Save as default settings
                        </label>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <input
                            type="checkbox"
                            checked={mockMode}
                            onChange={(event) => setMockMode(event.target.checked)}
                            className="mt-1 h-4 w-4 accent-emerald-600"
                        />
                        <span className="flex-1">
                            <span className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                                <ShieldCheck className="h-4 w-4" />
                                Safe mock preview
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-emerald-800">
                                Simulates job and form progress in the feed. It does not open LinkedIn, use your account, or submit applications. No local runner is needed.
                            </span>
                        </span>
                    </label>

                    <div className={`rounded-lg border p-3 ${mockMode ? 'border-emerald-200 bg-emerald-50' : 'border-blue-200 bg-blue-50'}`}>
                        <p className={`text-xs ${mockMode ? 'text-emerald-800' : 'text-blue-800'}`}>
                            {mockMode ? (
                                <><strong className="text-emerald-900">Mock mode:</strong> Safe simulation only; it cannot prevent account restrictions from separate live activity.</>
                            ) : (
                                <><strong>Local browser mode:</strong> This run requires the separately paired local browser agent.
                                    {localRunnerConnected
                                        ? ' It uses your visible browser session.'
                                        : ' The local runner is offline; turn on Safe mock preview to test without LinkedIn.'}
                                </>
                            )}
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !keyword || (!mockMode && !localRunnerConnected)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Starting...' : mockMode ? 'Start Safe Preview' : 'Start Applying'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
