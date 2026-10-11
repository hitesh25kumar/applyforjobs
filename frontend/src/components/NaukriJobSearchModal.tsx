import { useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';
import api from '../api/client';

interface NaukriJobSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
    profile?: any; // Profile data passed from parent
}

export const NaukriJobSearchModal: React.FC<NaukriJobSearchModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    onError,
    profile: propProfile,
}) => {
    const [profile, setProfile] = useState<any>(propProfile || null);
    const [keyword, setKeyword] = useState('');
    const [maxJobs, setMaxJobs] = useState(10);
    const [headless, setHeadless] = useState(true);
    const [saveAsDefault, setSaveAsDefault] = useState(false);
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
        setIsSubmitting(true);

        try {
            // Save defaults if checkbox is checked
            if (saveAsDefault) {
                await api.patch('/profile', {
                    defaultJobKeyword: keyword,
                    defaultMaxJobs: maxJobs,
                });
            }

            await api.post('/automation/naukri/start', {
                keyword,
                maxJobs,
                headless,
            });

            onSuccess(`Naukri automation started! Applying to ${maxJobs} "${keyword}" jobs.`);
            onClose();
        } catch (error) {
            console.error(error);
            onError('Failed to start Naukri automation. Check backend logs for details.');
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
                    <div className="bg-orange-600 text-white p-2 rounded-lg">
                        <Globe className="size-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Naukri Auto Apply</h2>
                        <p className="text-sm text-slate-500">Search and apply to jobs on Naukri</p>
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
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Max Jobs to Apply
                        </label>
                        <input
                            type="number"
                            value={maxJobs}
                            onChange={(e) => setMaxJobs(parseInt(e.target.value) || 10)}
                            min="1"
                            max="50"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">Recommended: 5-20 jobs per session</p>
                    </div>

                    <div className="flex items-center gap-2 py-1">
                        <input
                            type="checkbox"
                            id="headless-toggle"
                            checked={!headless}
                            onChange={(e) => setHeadless(!e.target.checked)}
                            className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                        />
                        <label htmlFor="headless-toggle" className="text-sm font-medium text-slate-700 cursor-pointer">
                            Show Browser (Testing Mode)
                        </label>
                    </div>

                    <div className="flex items-center gap-2 py-1">
                        <input
                            type="checkbox"
                            id="save-default-naukri"
                            checked={saveAsDefault}
                            onChange={(e) => setSaveAsDefault(e.target.checked)}
                            className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                        />
                        <label htmlFor="save-default-naukri" className="text-sm font-medium text-slate-700 cursor-pointer">
                            Save as default settings
                        </label>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-xs text-orange-800">
                            <strong>Note:</strong> This runs in <strong>Headless Mode</strong> (background).
                            Make sure your session cookies are saved in the backend.
                            The bot will use parameters from your profile.
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
                            disabled={isSubmitting || !keyword}
                            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Starting...' : 'Start Applying'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
