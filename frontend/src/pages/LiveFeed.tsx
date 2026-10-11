import { useCallback, useEffect, useState } from 'react';
import { Activity, ExternalLink, LoaderCircle, Pause, Play, ShieldCheck, Square } from 'lucide-react';
import apiClient from '../api/client';

type RunStatus = 'queued' | 'running' | 'paused' | 'stopping' | 'completed' | 'failed' | 'stopped';

interface FeedEvent {
    _id?: string;
    type: string;
    message: string;
    timestamp: string;
    title?: string;
    company?: string;
    jobUrl?: string;
}

interface AutomationRun {
    _id: string;
    keyword: string;
    location?: string;
    status: RunStatus;
    executionMode?: 'cloud' | 'local' | 'mock';
    jobsApplied: number;
    jobsFailed: number;
    events: FeedEvent[];
    createdAt: string;
}

export const LiveFeed = () => {
    const [run, setRun] = useState<AutomationRun | null>(null);
    const [loading, setLoading] = useState(true);
    const [controlBusy, setControlBusy] = useState(false);
    const [error, setError] = useState('');

    const fetchLatestRun = useCallback(async () => {
        try {
            const response = await apiClient.get('/automation/linkedin/runs/latest');
            setRun(response.data);
            setError('');
        } catch (requestError) {
            console.error('Failed to load LinkedIn live feed:', requestError);
            setError('Could not load the live feed. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchLatestRun();
        const interval = window.setInterval(() => void fetchLatestRun(), 2000);
        return () => window.clearInterval(interval);
    }, [fetchLatestRun]);

    const controlRun = async (action: 'pause' | 'resume' | 'stop') => {
        if (!run) return;
        setControlBusy(true);
        setError('');
        try {
            if (run.executionMode === 'local') {
                await apiClient.post('/automation/local-runner/command', {
                    action: action === 'stop' ? 'cancel' : action,
                });
                await fetchLatestRun();
            } else {
                const response = await apiClient.post(`/automation/linkedin/runs/${run._id}/control`, { action });
                setRun(response.data);
            }
        } catch (requestError) {
            console.error(`Failed to ${action} LinkedIn automation:`, requestError);
            setError(`Could not ${action} the run. Refresh the feed and try again.`);
            await fetchLatestRun();
        } finally {
            setControlBusy(false);
        }
    };

    const isActive = run && ['running', 'paused', 'stopping'].includes(run.status);
    const isMock = run?.executionMode === 'mock';
    const statusStyles: Record<RunStatus, string> = {
        queued: 'bg-sky-100 text-sky-700',
        running: 'bg-emerald-100 text-emerald-700',
        paused: 'bg-amber-100 text-amber-700',
        stopping: 'bg-orange-100 text-orange-700',
        completed: 'bg-blue-100 text-blue-700',
        failed: 'bg-red-100 text-red-700',
        stopped: 'bg-slate-100 text-slate-700',
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6 pb-10">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Activity className="h-6 w-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-slate-900">Live Automation Feed</h1>
                    </div>
                    <p className="mt-1 text-slate-500">Watch LinkedIn automation progress and control an active run.</p>
                </div>
                {isActive && (
                    <div className="flex gap-2">
                        {run.status === 'paused' ? (
                            <button
                                onClick={() => void controlRun('resume')}
                                disabled={controlBusy}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                                <Play className="h-4 w-4" /> Resume
                            </button>
                        ) : (
                            <button
                                onClick={() => void controlRun('pause')}
                                disabled={controlBusy || run.status === 'stopping'}
                                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                            >
                                <Pause className="h-4 w-4" /> Pause
                            </button>
                        )}
                        <button
                            onClick={() => void controlRun('stop')}
                            disabled={controlBusy || run.status === 'stopping'}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            <Square className="h-4 w-4" /> {run.status === 'stopping' ? 'Stopping…' : 'Stop'}
                        </button>
                    </div>
                )}
            </header>

            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            {loading ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-12 text-slate-500 shadow-sm">
                    <LoaderCircle className="h-5 w-5 animate-spin" /> Loading feed…
                </div>
            ) : !run ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                    <Activity className="mx-auto mb-3 h-9 w-9 text-slate-300" />
                    <h2 className="font-semibold text-slate-800">No LinkedIn run yet</h2>
                    <p className="mt-1 text-sm text-slate-500">Start a LinkedIn search from the dashboard to see its activity here.</p>
                </div>
            ) : (
                <>
                    <section className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl bg-white p-5 shadow-sm sm:col-span-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Search</p>
                            <p className="mt-2 font-semibold text-slate-900">{run.keyword}</p>
                            {run.location && <p className="text-sm text-slate-500">{run.location}</p>}
                            {isMock && (
                                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                                    <ShieldCheck className="h-3.5 w-3.5" /> Safe mock · no LinkedIn access
                                </span>
                            )}
                        </div>
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {isMock ? 'Mock previews passed' : 'Applications submitted'}
                            </p>
                            <p className="mt-2 text-2xl font-bold text-emerald-600">{run.jobsApplied}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {isMock ? 'Simulated form issues' : 'Failed'}
                            </p>
                            <p className="mt-2 text-2xl font-bold text-red-600">{run.jobsFailed}</p>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-slate-900">Activity timeline</h2>
                                {isActive && <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />}
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[run.status] || statusStyles.failed}`}>
                                {run.status}
                            </span>
                        </div>
                        {run.events.length === 0 ? (
                            <div className="space-y-5 p-8">
                                <div className="flex items-center justify-center gap-3 text-sm font-medium text-slate-600">
                                    <LoaderCircle className="h-5 w-5 animate-spin text-blue-600" />
                                    {isMock ? 'Preparing a safe local simulation…' : 'Waiting for the local browser agent to report progress…'}
                                </div>
                                <div className="mx-auto max-w-xl animate-pulse space-y-3" aria-hidden="true">
                                    <div className="h-3 rounded-full bg-slate-100" />
                                    <div className="h-3 w-4/5 rounded-full bg-slate-100" />
                                    <div className="h-3 w-3/5 rounded-full bg-slate-100" />
                                </div>
                            </div>
                        ) : (
                            <ol className="divide-y divide-slate-100">
                                {[...run.events].reverse().map((event, index) => (
                                    <li key={event._id || `${event.timestamp}-${index}`} className="flex gap-4 px-5 py-4">
                                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                            event.type === 'application.succeeded' ? 'bg-emerald-500' :
                                            event.type === 'mock.application.succeeded' ? 'bg-emerald-500' :
                                            event.type === 'application.failed' || event.type === 'mock.application.failed' || event.type === 'form.field.failed' || event.type === 'mock.field.failed' || event.type === 'run.failed' ? 'bg-red-500' :
                                            event.type === 'job.skipped' || event.type === 'form.field.skipped' ? 'bg-amber-400' :
                                            event.type === 'form.field.filled' || event.type === 'mock.field.filled' ? 'bg-violet-500' : 'bg-blue-500'
                                        }`} />
                                        <div className="min-w-0 flex-1">
                                            {(event.title || event.company) && (
                                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    {[event.title, event.company].filter(Boolean).join(' · ')}
                                                </p>
                                            )}
                                            <p className="text-sm text-slate-800">{event.message}</p>
                                            {event.jobUrl && (
                                                <a href={event.jobUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                                    View job <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                            <time className="mt-1 block text-xs text-slate-400" dateTime={event.timestamp}>
                                                {new Date(event.timestamp).toLocaleTimeString()}
                                            </time>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};
