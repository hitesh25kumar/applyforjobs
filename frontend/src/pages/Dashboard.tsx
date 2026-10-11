import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    CheckCircle,
    Clock,
    Globe,
    ArrowUpRight,
    ChevronRight,
    Linkedin,
    Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { Line } from 'react-chartjs-2';
import { Toast } from '../components/Toast';
import { LinkedInJobSearchModal } from '../components/LinkedInJobSearchModal';
import { AddCompanyForm } from '../components/AddCompanyForm';
import { CompanyList } from '../components/CompanyList';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface DashboardStats {
    total: number;
    today: number;
    responseRate: string;
    activity: Array<{ date: string; count: number }>;
    totalApplied?: number;
    totalSuccess?: number;
    totalFailed?: number;
    appliedToday?: number;
}

interface PairingDetails {
    code: string;
    expiresAt: string;
}

interface ExtensionTask {
    id: string;
    state: string;
    job: { title: string; company: string; url: string };
    events: Array<{ message: string; timestamp: string }>;
}

interface ExtensionPairingDetails {
    code: string;
    expiresAt: string;
}

interface LinkedInDiscoveryRun {
    _id: string;
    position: string;
    status: string;
    processedPosts: number;
    recordsSaved: number;
    createdAt: string;
    completedAt?: string;
}

type ApplicationMode = 'local' | 'extension';

export const Dashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        total: 0,
        today: 0,
        responseRate: '0%',
        activity: [],
    });
    const [loading, setLoading] = useState(true);
    const [recentSuccess, setRecentSuccess] = useState<any[]>([]);
    const [localRunnerConnected, setLocalRunnerConnected] = useState<boolean | null>(null);
    const [pairingDetails, setPairingDetails] = useState<PairingDetails | null>(null);
    const [pairingLoading, setPairingLoading] = useState(false);
    const [extensionStatus, setExtensionStatus] = useState<boolean | null>(null);
    const [extensionTasks, setExtensionTasks] = useState<ExtensionTask[]>([]);
    const [extensionPairing, setExtensionPairing] = useState<ExtensionPairingDetails | null>(null);
    const [extensionPairingLoading, setExtensionPairingLoading] = useState(false);
    const [applicationMode, setApplicationMode] = useState<ApplicationMode>(() => (
        localStorage.getItem('job-applyer-application-mode') === 'extension' ? 'extension' : 'local'
    ));
    const [refreshKey, setRefreshKey] = useState(0);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
    const [pastLinkedInRuns, setPastLinkedInRuns] = useState<LinkedInDiscoveryRun[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, [refreshKey]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            void fetchDashboardData();
        }, 5000);
        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        let active = true;
        const loadRuns = async () => {
            try {
                const response = await apiClient.get<LinkedInDiscoveryRun[]>('/linkedin-discovery/runs');
                if (active) setPastLinkedInRuns(response.data.slice(0, 5));
            } catch (error) {
                console.error('Could not load past LinkedIn post searches:', error);
            }
        };
        void loadRuns();
        const interval = window.setInterval(() => void loadRuns(), 15000);
        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, applicationsRes, runnerRes, extensionStatusRes, extensionTasksRes] = await Promise.all([
                apiClient.get('/applications/stats'),
                apiClient.get('/applications?limit=5&status=Applied'),
                apiClient.get('/automation/local-runner/status'),
                apiClient.get('/extension/status'),
                apiClient.get('/extension/tasks/dashboard'),
            ]);

            setStats(statsRes.data);
            setRecentSuccess(applicationsRes.data.applications);
            setLocalRunnerConnected(Boolean(runnerRes.data.connected));
            setExtensionStatus(Boolean(extensionStatusRes.data.connected));
            setExtensionTasks(extensionTasksRes.data);
            if (extensionStatusRes.data.connected
                && !runnerRes.data.connected
                && !localStorage.getItem('job-applyer-application-mode')) {
                setApplicationMode('extension');
                localStorage.setItem('job-applyer-application-mode', 'extension');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const chooseApplicationMode = (mode: ApplicationMode) => {
        setApplicationMode(mode);
        localStorage.setItem('job-applyer-application-mode', mode);
    };

    const createLocalRunnerPairing = async () => {
        setPairingLoading(true);
        try {
            const response = await apiClient.post('/automation/local-runner/pair');
            setPairingDetails(response.data);
        } catch (error) {
            console.error('Failed to create local runner pairing code:', error);
            setToast({ message: 'Could not create a pairing code. Please try again.', type: 'error' });
        } finally {
            setPairingLoading(false);
        }
    };

    const createExtensionPairing = async () => {
        setExtensionPairingLoading(true);
        try {
            const response = await apiClient.post('/extension/pair/code');
            const pairing = response.data as ExtensionPairingDetails;
            const requestId = crypto.randomUUID();
            const paired = await new Promise<boolean>((resolve) => {
                const timeout = window.setTimeout(() => {
                    window.removeEventListener('message', onExtensionReply);
                    resolve(false);
                }, 5000);
                const onExtensionReply = (event: MessageEvent) => {
                    if (event.source !== window
                        || event.origin !== window.location.origin
                        || event.data?.source !== 'job-applyer-extension'
                        || event.data?.type !== 'pair-result'
                        || event.data?.requestId !== requestId) return;
                    window.clearTimeout(timeout);
                    window.removeEventListener('message', onExtensionReply);
                    resolve(Boolean(event.data.response?.ok));
                };
                window.addEventListener('message', onExtensionReply);
                window.postMessage({
                    source: 'job-applyer-dashboard',
                    type: 'pair-extension',
                    requestId,
                    code: pairing.code,
                    apiBaseUrl: import.meta.env.DEV
                        ? 'http://localhost:3000'
                        : import.meta.env.VITE_API_URL || 'https://job-applyer-api.onrender.com',
                }, window.location.origin);
            });
            if (paired) {
                setExtensionPairing(null);
                setExtensionStatus(true);
                setToast({ message: 'Chrome extension paired successfully.', type: 'success' });
            } else {
                await apiClient.post('/extension/pair/cancel', { code: pairing.code });
                const status = await apiClient.get('/extension/status');
                if (status.data.connected) {
                    setExtensionPairing(null);
                    setExtensionStatus(true);
                    setToast({ message: 'Chrome extension is connected.', type: 'success' });
                } else {
                    const fallback = await apiClient.post('/extension/pair/code');
                    setExtensionPairing(fallback.data);
                    setToast({ message: 'Extension not detected. Use the fresh fallback code in its popup and make sure its API URL matches this dashboard.', type: 'error' });
                }
            }
        } catch (error) {
            console.error('Failed to create extension pairing code:', error);
            setToast({ message: 'Could not create an extension pairing code. Please try again.', type: 'error' });
        } finally {
            setExtensionPairingLoading(false);
        }
    };

    const updateExtensionTask = async (taskId: string, action: 'cancel' | 'submitted_confirmed' | 'submission_unconfirmed') => {
        if (action === 'submitted_confirmed'
            && !window.confirm('Only continue if you submitted this application yourself on the job site.')) {
            return;
        }
        try {
            if (action === 'cancel') {
                await apiClient.post(`/extension/tasks/${encodeURIComponent(taskId)}/cancel`);
            } else {
                await apiClient.post(`/extension/tasks/${encodeURIComponent(taskId)}/outcome`, { outcome: action });
            }
            await fetchDashboardData();
        } catch (error) {
            console.error('Could not update extension task:', error);
            setToast({ message: 'Could not update this extension task. Refresh and try again.', type: 'error' });
        }
    };

    const disconnectExtension = async () => {
        try {
            await apiClient.delete('/extension/devices');
            setExtensionStatus(false);
            chooseApplicationMode('local');
            setToast({ message: 'Chrome extension pairing revoked.', type: 'success' });
        } catch (error) {
            console.error('Could not revoke extension pairing:', error);
            setToast({ message: 'Could not revoke the extension pairing. Please try again.', type: 'error' });
        }
    };

    const chartData = {
        labels: stats.activity.map(({ date }) =>
            new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
                weekday: 'short',
                timeZone: 'UTC',
            }),
        ),
        datasets: [
            {
                label: 'Applications submitted',
                data: stats.activity.map(({ count }) => count),
                borderColor: '#2563EB',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#2563EB',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1E293B',
                padding: 12,
                titleFont: { family: 'Outfit', size: 13 },
                bodyFont: { family: 'Outfit', size: 12 },
                cornerRadius: 8,
                displayColors: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#F1F5F9',
                    borderDash: [5, 5],
                },
                ticks: {
                    font: { family: 'Outfit', size: 11 },
                    color: '#94A3B8'
                },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: {
                    font: { family: 'Outfit', size: 11 },
                    color: '#94A3B8'
                },
                border: { display: false }
            },
        },
    };

    const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon className="w-16 h-16 transform rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{loading ? '...' : value}</h3>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Welcome Section */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    Welcome back, <span className="text-gradient">{currentUser?.email?.split('@')[0]}</span>
                </h2>
                <p className="text-slate-500 mt-1">Here's what's happening with your job search today.</p>
            </div>

            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                        <h3 className="font-bold text-slate-900">Past LinkedIn post searches</h3>
                        <p className="mt-1 text-xs text-slate-500">Reopen a run to review its saved results and live activity.</p>
                    </div>
                    <button type="button" onClick={() => navigate('/recruiter-discovery')} className="text-sm font-semibold text-blue-700 hover:text-blue-900">Open post search</button>
                </div>
                {pastLinkedInRuns.length ? (
                    <div className="divide-y divide-slate-100">
                        {pastLinkedInRuns.map(item => (
                            <button key={item._id} type="button" onClick={() => navigate(`/recruiter-discovery?runId=${encodeURIComponent(item._id)}`)} className="flex w-full flex-wrap items-center justify-between gap-2 py-3 text-left hover:bg-slate-50">
                                <span className="min-w-[180px] flex-1">
                                    <span className="block text-sm font-semibold text-slate-800">{item.position}</span>
                                    <span className="mt-0.5 block text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
                                </span>
                                <span className="text-xs text-slate-600">{item.processedPosts} processed · {item.recordsSaved} saved</span>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : item.status === 'failed' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{item.status}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">No saved searches yet. Start a search from Recruiter Post Extract.</p>
                )}
            </section>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Applications"
                    value={stats.total}
                    icon={Briefcase}
                    color="text-blue-600"
                    subtext="All platforms combined"
                />
                <StatCard
                    title="Response Rate"
                    value={stats.responseRate}
                    icon={CheckCircle}
                    color="text-green-600"
                    subtext="Applications replied to"
                />
                <StatCard
                    title="Applied Today"
                    value={stats.today}
                    icon={Clock}
                    color="text-violet-600"
                    subtext="Last 24 hours"
                />
                <StatCard
                    title="Local Agent"
                    value={localRunnerConnected === null ? 'Unknown' : localRunnerConnected ? 'Connected' : 'Offline'}
                    icon={Globe}
                    color="text-teal-600"
                    subtext="Visible local browser status"
                />
            </div>

            <section className="glass-panel rounded-2xl p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Local browser agent</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Run the visible LinkedIn browser on your computer. Browser sessions stay local.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${localRunnerConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {localRunnerConnected === null ? 'Checking…' : localRunnerConnected ? 'Connected' : 'Offline'}
                        </span>
                        <button
                            onClick={() => void createLocalRunnerPairing()}
                            disabled={pairingLoading}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                        >
                            {pairingLoading ? 'Generating…' : 'Generate pairing code'}
                        </button>
                    </div>
                </div>
                {pairingDetails && (
                    <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <p className="text-sm font-semibold text-blue-900">One-time pairing code</p>
                        <p className="my-2 font-mono text-2xl font-bold tracking-[0.2em] text-blue-800">{pairingDetails.code}</p>
                        <p className="text-xs text-blue-800">
                            Expires {new Date(pairingDetails.expiresAt).toLocaleTimeString()}.
                            Keep this code private and enter it only in your local runner terminal.
                        </p>
                        <p className="mt-2 text-xs text-blue-800">
                            This code is valid only for this dashboard's API. Copy the API URL below exactly; codes are one-time and expire after 10 minutes.
                        </p>
                        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                            {`cd backend/automation
npm ci
npx playwright install chromium
npm run linkedin:local -- --api ${import.meta.env.DEV ? 'http://localhost:3000' : import.meta.env.VITE_API_URL || '<your-api-url>'}`}
                        </pre>
                    </div>
                )}
                <button
                    onClick={() => navigate('/live-feed')}
                    className="mt-4 text-sm font-semibold text-blue-700 hover:underline"
                >
                    View live run feed
                </button>
            </section>

            <section id="chrome-extension" className="glass-panel rounded-2xl border border-blue-100 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Chrome extension</h3>
                        <p className="mt-1 max-w-2xl text-sm text-slate-600">
                            An alternative to the local browser agent. It uses your current Chrome tab only when you ask,
                            prepares matching form fields, and always leaves review and submission to you.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${extensionStatus ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {extensionStatus === null ? 'Checking…' : extensionStatus ? 'Connected' : 'Offline'}
                        </span>
                        {extensionStatus ? (
                            <button
                                onClick={() => void disconnectExtension()}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Disconnect
                            </button>
                        ) : (
                            <button
                                onClick={() => void createExtensionPairing()}
                                disabled={extensionPairingLoading}
                                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                            >
                                {extensionPairingLoading ? 'Generating…' : 'Pair extension'}
                            </button>
                        )}
                    </div>
                </div>
                <fieldset className="mt-5 rounded-xl border border-slate-200 p-4">
                    <legend className="px-2 text-sm font-semibold text-slate-800">Choose how to assist applications</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${applicationMode === 'local' ? 'border-slate-800 bg-slate-50' : 'border-slate-200'}`}>
                            <input
                                type="radio"
                                name="application-mode"
                                value="local"
                                checked={applicationMode === 'local'}
                                onChange={() => chooseApplicationMode('local')}
                                className="mt-1"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-slate-900">Local browser agent</span>
                                <span className="text-xs text-slate-600">Keyword-based run in the separately paired visible browser.</span>
                                <span className="mt-1 block text-xs font-medium">{localRunnerConnected ? 'Connected' : 'Not connected'}</span>
                            </span>
                        </label>
                        <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${applicationMode === 'extension' ? 'border-blue-700 bg-blue-50' : 'border-slate-200'}`}>
                            <input
                                type="radio"
                                name="application-mode"
                                value="extension"
                                checked={applicationMode === 'extension'}
                                onChange={() => chooseApplicationMode('extension')}
                                className="mt-1"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-slate-900">Chrome extension</span>
                                <span className="text-xs text-slate-600">Assist with a job opened in your current Chrome tab; you review and submit.</span>
                                <span className="mt-1 block text-xs font-medium">{extensionStatus ? 'Connected' : 'Not connected'}</span>
                            </span>
                        </label>
                    </div>
                </fieldset>
                {extensionPairing && (
                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <p className="text-sm font-semibold text-blue-900">One-time extension pairing code</p>
                        <p className="my-2 break-all font-mono text-lg font-bold tracking-wide text-blue-800">{extensionPairing.code}</p>
                        <p className="text-xs text-blue-800">
                            Expires {new Date(extensionPairing.expiresAt).toLocaleTimeString()}. Enter this code only in the extension popup.
                            API URL: {import.meta.env.DEV
                                ? 'http://localhost:3000'
                                : import.meta.env.VITE_API_URL || 'https://job-applyer-api.onrender.com'}
                        </p>
                    </div>
                )}
                <ol className="mt-4 list-inside list-decimal space-y-1 text-sm text-slate-600">
                    <li>Build with <code>cd chrome-extension &amp;&amp; npm run build</code>.</li>
                    <li>Open <code>chrome://extensions</code>, enable Developer mode, and choose Load unpacked once.</li>
                    <li>After the extension is installed, Pair extension connects automatically; if it is not detected, enter the displayed code in the extension popup.</li>
                    <li>Open a supported job page and click Prepare current job; review the form and submit it yourself.</li>
                </ol>
                <div className="mt-5 space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900">Extension application assistance</h4>
                    {extensionTasks.length === 0 ? (
                        <p className="text-sm text-slate-500">No extension tasks yet. Prepare a job from the extension popup to see its review status here.</p>
                    ) : extensionTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">{task.job.title} · {task.job.company}</p>
                                <p className="mt-1 text-xs text-slate-600">
                                    {task.state.replaceAll('_', ' ')} · {task.events.at(-1)?.message || 'Waiting for review'}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['prepared', 'awaiting_user_review'].includes(task.state) && (
                                    <>
                                        <button onClick={() => void updateExtensionTask(task.id, 'submitted_confirmed')} className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">
                                            I submitted it
                                        </button>
                                        <button onClick={() => void updateExtensionTask(task.id, 'submission_unconfirmed')} className="rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white">
                                            Outcome uncertain
                                        </button>
                                        <button onClick={() => void updateExtensionTask(task.id, 'cancel')} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Section */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Application Activity</h3>
                            <p className="text-sm text-slate-500">Submitted applications over the last seven days</p>
                        </div>
                        <span className="text-sm text-slate-500">Last 7 days</span>
                    </div>
                    <div className="h-[300px] w-full">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Quick Actions & Recent */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    if (applicationMode === 'extension') {
                                        document.getElementById('chrome-extension')?.scrollIntoView({ behavior: 'smooth' });
                                        setToast({
                                            message: extensionStatus
                                                ? 'Extension mode is ready. Open a job listing in this Chrome window, then use the Job Applyer extension to prepare it.'
                                                : 'Connect the Chrome extension above, then open a job listing and prepare it from the extension popup.',
                                            type: extensionStatus ? 'success' : 'error',
                                        });
                                        return;
                                    }
                                    if (!localRunnerConnected) {
                                        setToast({
                                            message: 'Local browser mode is selected, but its runner is offline. Connect the local browser agent above or switch to Chrome extension mode.',
                                            type: 'error',
                                        });
                                        return;
                                    }
                                    setIsLinkedInModalOpen(true);
                                }}
                                className="w-full group flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Linkedin className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">{applicationMode === 'extension' ? 'Use Chrome extension' : 'Start local LinkedIn run'}</p>
                                        <p className="text-xs text-blue-100 opacity-90">
                                            {applicationMode === 'extension' ? 'Assist with the current job tab' : localRunnerConnected ? 'Search with the local browser agent' : 'Local browser agent is offline'}
                                        </p>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => navigate('/questions-bank')}
                                className="w-full group flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-violet-200 hover:bg-violet-50 text-slate-700 rounded-xl transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-violet-100 text-violet-600 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-colors">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm text-slate-900">Question Bank</p>
                                        <p className="text-xs text-slate-500">Review answers</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
                            </button>

                            <button
                                onClick={() => navigate('/recruiter-discovery')}
                                className="w-full group flex items-center justify-between p-4 bg-white border border-emerald-200 hover:bg-emerald-50 text-slate-700 rounded-xl transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-colors">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm text-slate-900">Recruiter Post Extract</p>
                                        <p className="text-xs text-slate-500">Extract leads from a post or CSV</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            </button>

                            <div className="w-full rounded-xl border border-orange-100 bg-orange-50 p-4 text-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm text-slate-900">Naukri automation</p>
                                        <p className="text-xs text-slate-500">Unavailable until local controls are implemented</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Mini */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Recent Applications</h3>
                            <button onClick={() => navigate('/applications')} className="text-xs font-semibold text-blue-600 hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
                            ) : recentSuccess.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">No recent applications.</p>
                            ) : (
                                recentSuccess.map((app, i) => (
                                    <div key={i} className="flex items-center gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                                            {app.companyName?.[0] || '?'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{app.jobTitle}</p>
                                            <p className="text-xs text-slate-500 truncate">{app.companyName}</p>
                                        </div>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${app.status === 'Applied' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Company Management */}
            <div className="glass-panel p-6 rounded-2xl">
                <h2 className="text-lg font-bold mb-6 text-slate-900">Target Companies</h2>
                <AddCompanyForm onCompanyAdded={handleRefresh} />
                <div className="mt-6">
                    <CompanyList refreshTrigger={refreshKey} />
                </div>
            </div>

            {/* Modals */}
            <LinkedInJobSearchModal
                isOpen={isLinkedInModalOpen}
                localRunnerConnected={Boolean(localRunnerConnected)}
                onClose={() => setIsLinkedInModalOpen(false)}
                onSuccess={() => {
                    setToast({ message: 'LinkedIn automation started!', type: 'success' });
                    handleRefresh();
                    navigate('/live-feed');
                }}
                onError={(error) => {
                    setToast({ message: `LinkedIn error: ${error}`, type: 'error' });
                }}
            />

        </div>
    );
};
