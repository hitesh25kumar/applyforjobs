import { useState, useEffect } from 'react';
import { X, Briefcase, Copy, Check, MonitorPlay } from 'lucide-react';
import api from '../api/client';

interface LinkedInJobSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
    profile?: any; // Profile data passed from parent
}

export const LinkedInJobSearchModal: React.FC<LinkedInJobSearchModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    onError,
    profile: propProfile,
}) => {
    const [profile, setProfile] = useState<any>(propProfile || null);
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [maxJobs, setMaxJobs] = useState(10);
    const [saveAsDefault, setSaveAsDefault] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [useLocalBrowser, setUseLocalBrowser] = useState(false);
    const [pairingCode, setPairingCode] = useState('');
    const [localRunnerConnected, setLocalRunnerConnected] = useState(false);
    const [isPairing, setIsPairing] = useState(false);
    const [commandCopied, setCommandCopied] = useState(false);

    const runnerApiUrl = (import.meta.env.VITE_API_URL
        || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin))
        .replace(/\/$/, '');
    const runnerCommand = `cd automation && npm ci && npm run linkedin:local -- --api ${runnerApiUrl}`;

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

    useEffect(() => {
        if (!isOpen || !useLocalBrowser || !pairingCode) return;

        let active = true;
        const checkRunner = async () => {
            try {
                const response = await api.get('/automation/local-runner/status');
                if (active) setLocalRunnerConnected(Boolean(response.data.connected));
            } catch {
                if (active) setLocalRunnerConnected(false);
            }
        };

        void checkRunner();
        const interval = window.setInterval(checkRunner, 4000);
        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, [isOpen, useLocalBrowser, pairingCode]);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setProfile(response.data);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    };

    const connectLocalRunner = async () => {
        setIsPairing(true);
        setLocalRunnerConnected(false);
        try {
            const response = await api.post('/automation/local-runner/pair');
            setPairingCode(response.data.code);
        } catch (error: any) {
            onError(error.response?.data?.message || 'Could not create a local browser pairing code.');
        } finally {
            setIsPairing(false);
        }
    };

    const copyRunnerCommand = async () => {
        try {
            await navigator.clipboard.writeText(runnerCommand);
            setCommandCopied(true);
            window.setTimeout(() => setCommandCopied(false), 1800);
        } catch {
            onError('Clipboard access was unavailable. Copy the command shown below.');
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
                    defaultLocation: location,
                    defaultMaxJobs: maxJobs,
                });
            }

            await api.post(useLocalBrowser ? '/automation/local-runner/jobs' : '/automation/linkedin/start', {
                keyword,
                location: location || undefined,
                maxJobs,
            });

            onSuccess(useLocalBrowser
                ? `LinkedIn job queued for your local browser: ${maxJobs} "${keyword}" jobs.`
                : `LinkedIn automation started! Applying to ${maxJobs} "${keyword}" jobs.`);
            onClose();
        } catch (error) {
            console.error(error);
            onError((error as any).response?.data?.message || 'Failed to start LinkedIn automation.');
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
                        <p className="text-sm text-slate-500">Search and apply to jobs automatically</p>
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
                            Max Jobs to Apply
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

                    <div className="rounded-lg border border-slate-200 p-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <input
                                type="checkbox"
                                checked={useLocalBrowser}
                                onChange={(event) => setUseLocalBrowser(event.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            Run in a browser on this computer
                        </label>
                        {useLocalBrowser && (
                            <div className="mt-3 border-t border-slate-200 pt-3">
                                {!pairingCode ? (
                                    <button
                                        type="button"
                                        onClick={connectLocalRunner}
                                        disabled={isPairing}
                                        className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                                    >
                                        <MonitorPlay className="size-4" />
                                        {isPairing ? 'Preparing...' : 'Connect local browser'}
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs text-slate-500">Pairing code</p>
                                                <p className="font-mono text-lg font-semibold tracking-widest text-slate-900">{pairingCode}</p>
                                            </div>
                                            <span className={`text-xs font-medium ${localRunnerConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                {localRunnerConnected ? 'Browser connected' : 'Waiting for local runner'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600">On this computer, run the command and enter the pairing code. The browser session stays on this computer.</p>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs text-slate-500">Code expires after 10 minutes.</p>
                                            <button
                                                type="button"
                                                onClick={connectLocalRunner}
                                                disabled={isPairing}
                                                className="text-xs font-medium text-blue-700 hover:text-blue-900 disabled:opacity-50"
                                            >
                                                {isPairing ? 'Generating...' : 'Generate new code'}
                                            </button>
                                        </div>
                                        <div className="flex items-start gap-2 rounded-md bg-slate-50 p-2">
                                            <code className="min-w-0 flex-1 break-all text-xs text-slate-700">{runnerCommand}</code>
                                            <button
                                                type="button"
                                                onClick={copyRunnerCommand}
                                                title="Copy local runner command"
                                                aria-label="Copy local runner command"
                                                className="shrink-0 rounded p-1 text-slate-600 hover:bg-slate-200"
                                            >
                                                {commandCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
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

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                            <strong>Note:</strong> {useLocalBrowser
                                ? 'The local runner opens LinkedIn for sign-in and only applies to Easy Apply jobs.'
                                : "The hosted browser must already have a valid LinkedIn session. Only Easy Apply jobs are supported."}
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
                            disabled={isSubmitting || !keyword || (useLocalBrowser && !localRunnerConnected)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Starting...' : 'Start Applying'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
