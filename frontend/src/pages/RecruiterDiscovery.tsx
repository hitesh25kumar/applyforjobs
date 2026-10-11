import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, AlertCircle, CheckCircle2, ExternalLink, LoaderCircle, Mail, Search, Square, Users } from 'lucide-react';
import apiClient from '../api/client';
import { auth } from '../firebase/auth';

type RunStatus = 'queued' | 'running' | 'stopping' | 'completed' | 'failed' | 'stopped';
type LogLevel = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

interface SearchRun {
    _id: string;
    position: string;
    searchedSkills?: string[];
    searchQuery: string;
    status: RunStatus;
    currentPost: number;
    processedPosts: number;
    emailsFound: number;
    recordsSaved: number;
    duplicatesSkipped: number;
    failures: number;
    maxPosts: number;
    errorMessage?: string;
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
}

interface Lead {
    _id: string;
    companyName?: string;
    position?: string;
    recruiterName?: string;
    recruiterProfileUrl?: string;
    recruiterEmails?: string[];
    sourceUrl?: string;
    sourcePostText?: string;
    emailStatus: string;
    extractionStatus: string;
    discoveredAt?: string;
    location?: string;
    skills?: string[];
    requiredSkills?: string[];
    optionalSkills?: string[];
}

interface ActivityLog {
    _id: string;
    runId?: string;
    level: LogLevel;
    eventType: string;
    message: string;
    timestamp: string;
}

const activeStatuses: RunStatus[] = ['queued', 'running', 'stopping'];
const levelClass: Record<LogLevel, string> = {
    INFO: 'text-sky-300',
    SUCCESS: 'text-emerald-300',
    WARNING: 'text-amber-300',
    ERROR: 'text-rose-300',
};

export const RecruiterDiscovery = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [position, setPosition] = useState('Fullstack Developer');
    const [skillInput, setSkillInput] = useState('');
    const [run, setRun] = useState<SearchRun | null>(null);
    const [runHistory, setRunHistory] = useState<SearchRun[]>([]);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [streamState, setStreamState] = useState<'connecting' | 'live' | 'offline'>('connecting');
    const [maxPosts, setMaxPosts] = useState(25);
    const lastEventId = useRef('');
    const logsEndRef = useRef<HTMLDivElement>(null);

    const loadLeads = useCallback(async () => {
        try {
            const response = await apiClient.get('/recruiter-leads', { params: { limit: 50 } });
            setLeads(response.data.leads || []);
        } catch (requestError) {
            console.error('Could not load saved recruiter leads:', requestError);
            setError('Could not load saved results. Check the connection and try again.');
        }
    }, []);

    const loadRun = useCallback(async (runId: string) => {
        try {
            const response = await apiClient.get(`/linkedin-discovery/runs/${runId}`);
            setRun(response.data);
            return response.data as SearchRun;
        } catch (requestError) {
            console.error('Could not refresh LinkedIn search status:', requestError);
            return null;
        }
    }, []);

    const loadActivity = useCallback(async (runId: string) => {
        try {
            const response = await apiClient.get('/recruiter/activity', { params: { runId, limit: 100 } });
            const items = [...(response.data.events || [])].reverse() as ActivityLog[];
            setLogs(items);
            if (items.length) lastEventId.current = items[items.length - 1]._id;
        } catch (requestError) {
            console.error('Could not load persisted search activity:', requestError);
        }
    }, []);

    useEffect(() => {
        let active = true;
        void Promise.all([
            apiClient.get('/linkedin-discovery/runs'),
            loadLeads(),
        ]).then(([runsResponse]) => {
            if (!active) return;
            const history = runsResponse.data as SearchRun[];
            setRunHistory(history);
            const requestedId = searchParams.get('runId');
            const selected = (requestedId && history.find(item => item._id === requestedId)) || history[0] || null;
            if (selected) {
                setRun(selected);
                setPosition(selected.position || 'Fullstack Developer');
                setSkillInput((selected.searchedSkills || []).join(', '));
                void loadActivity(selected._id);
            }
        }).catch(requestError => {
            console.error('Could not initialize LinkedIn post search:', requestError);
            if (active) setError('Could not load LinkedIn post search. Please refresh and retry.');
        });
        return () => { active = false; };
    }, [loadActivity, loadLeads, searchParams, setSearchParams]);

    useEffect(() => {
        if (!run || !activeStatuses.includes(run.status)) return;
        const timer = window.setInterval(() => {
            void loadRun(run._id).then(next => {
                if (next && !activeStatuses.includes(next.status)) void loadLeads();
            });
        }, 1800);
        return () => window.clearInterval(timer);
    }, [loadLeads, loadRun, run]);

    useEffect(() => {
        if (!run?._id) return;
        let stopped = false;
        let retryDelay = 1000;
        let controller: AbortController | undefined;
        const connect = async () => {
            while (!stopped) {
                controller = new AbortController();
                try {
                    const token = await auth.currentUser?.getIdToken();
                    if (!token) throw new Error('Sign in to view live search activity.');
                    const base = (apiClient.defaults.baseURL || '/api').replace(/\/$/, '');
                    const response = await fetch(`${base}/linkedin-discovery/runs/${run._id}/events`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            ...(lastEventId.current ? { 'Last-Event-ID': lastEventId.current } : {}),
                        },
                        signal: controller.signal,
                    });
                    if (!response.ok || !response.body) throw new Error(`Activity stream returned ${response.status}.`);
                    setStreamState('live');
                    retryDelay = 1000;
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';
                    while (!stopped) {
                        const { value, done } = await reader.read();
                        if (done) break;
                        buffer += decoder.decode(value, { stream: true });
                        const messages = buffer.split(/\r?\n\r?\n/);
                        buffer = messages.pop() || '';
                        for (const message of messages) {
                            const lines = message.split(/\r?\n/);
                            const id = lines.find(line => line.startsWith('id:'))?.slice(3).trim();
                            const data = lines.filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).join('\n');
                            if (!data) continue;
                            const parsed = JSON.parse(data) as { _id?: string; id?: string; data?: ActivityLog };
                            const item = (parsed.data || parsed) as ActivityLog;
                            const eventId = id || item._id || parsed.id;
                            if (eventId) lastEventId.current = eventId;
                            if (item.message) setLogs(current => [...current.slice(-199), item]);
                            if (item.eventType?.startsWith('post.') || item.eventType === 'search.completed') void loadLeads();
                        }
                    }
                } catch (streamError) {
                    if (stopped) break;
                    console.warn('LinkedIn search event stream disconnected:', streamError);
                    setStreamState('offline');
                }
                if (!stopped) await new Promise(resolve => window.setTimeout(resolve, retryDelay));
                retryDelay = Math.min(30000, retryDelay * 2);
            }
        };
        void connect();
        return () => {
            stopped = true;
            controller?.abort();
        };
    }, [loadLeads, run?._id]);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [logs]);

    const startSearch = async (event: React.FormEvent) => {
        event.preventDefault();
        const title = position.trim();
        if (!title) {
            setError('Enter the job title to search for.');
            return;
        }
        if (title.length > 120) {
            setError('Job title must be 120 characters or fewer.');
            return;
        }
        setBusy(true);
        setError('');
        lastEventId.current = '';
        setLogs([]);
        try {
            const skills = [...new Set(skillInput.split(',').map(skill => skill.trim()).filter(Boolean))].slice(0, 20);
            const response = await apiClient.post('/linkedin-discovery/start', {
                position: title,
                maxPosts: Math.min(100, Math.max(1, maxPosts)),
                skills,
            });
            setRun(response.data);
            setRunHistory(current => [response.data, ...current.filter(item => item._id !== response.data._id)].slice(0, 20));
            setSearchParams(previous => {
                const next = new URLSearchParams(previous);
                next.delete('runId');
                return next;
            });
            await loadActivity(response.data._id);
        } catch (requestError: any) {
            console.error('Could not start LinkedIn post search:', requestError);
            const message = requestError?.response?.data?.message;
            setError(Array.isArray(message) ? message.join(' ') : message || 'Could not start the search. Pair your visible local browser runner and try again.');
        } finally {
            setBusy(false);
        }
    };

    const stopSearch = async () => {
        if (!run) return;
        setError('');
        try {
            const response = await apiClient.post(`/linkedin-discovery/runs/${run._id}/stop`);
            setRun(response.data);
        } catch (requestError: any) {
            console.error('Could not stop LinkedIn post search:', requestError);
            setError(requestError?.response?.data?.message || 'Could not stop this search. Refresh the run status and retry.');
        }
    };

    const selectPastRun = async (runId: string) => {
        setSearchParams(previous => {
            const next = new URLSearchParams(previous);
            if (runId) next.set('runId', runId);
            else next.delete('runId');
            return next;
        });
        const selected = await loadRun(runId);
        if (selected) {
            setRun(selected);
            setPosition(selected.position || 'Fullstack Developer');
            setSkillInput((selected.searchedSkills || []).join(', '));
            await loadActivity(selected._id);
        }
    };

    const isActive = Boolean(run && activeStatuses.includes(run.status));
    const statusLabel = run?.status || 'idle';
    const statusColor = run?.status === 'completed' ? 'bg-emerald-100 text-emerald-700'
        : run?.status === 'failed' ? 'bg-rose-100 text-rose-700'
            : run?.status === 'stopped' ? 'bg-slate-100 text-slate-600'
                : isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600';

    return (
        <main className="mx-auto max-w-7xl space-y-6 pb-12">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Search className="h-6 w-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-slate-900">LinkedIn Hiring Post Search</h1>
                    </div>
                    <p className="mt-1 max-w-3xl text-sm text-slate-500">
                        Search the LinkedIn Posts view through your paired, visible local browser. Posts are saved only after their content is actually retrieved.
                    </p>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${streamState === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    <span className={`h-2 w-2 rounded-full ${streamState === 'live' ? 'animate-pulse bg-emerald-500' : 'bg-slate-400'}`} />
                    {streamState === 'live' ? 'Live activity connected' : 'Activity reconnecting'}
                </span>
            </header>

            {error && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                {runHistory.length > 0 && (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <label className="min-w-0 text-sm font-medium text-slate-700">
                            Past search runs
                            <select value={searchParams.get('runId') || run?._id || ''} onChange={event => void selectPastRun(event.target.value)} className="ml-3 max-w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal">
                                {runHistory.map(item => <option key={item._id} value={item._id}>{new Date(item.createdAt).toLocaleString()} · {item.position} · {item.status}</option>)}
                            </select>
                        </label>
                        <a href="/job-leads" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Browse all job leads →</a>
                    </div>
                )}
                <form onSubmit={startSearch} className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_130px_auto_auto]">
                    <label className="block text-sm font-medium text-slate-700">
                        Job title
                        <input
                            value={position}
                            onChange={event => setPosition(event.target.value)}
                            maxLength={120}
                            disabled={isActive || busy}
                            placeholder="Fullstack Developer"
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                        />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                        Skill hints <span className="font-normal text-slate-400">(optional, comma-separated)</span>
                        <input
                            value={skillInput}
                            onChange={event => setSkillInput(event.target.value)}
                            disabled={isActive || busy}
                            placeholder="React, TypeScript, Node.js"
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                        />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                        Max posts
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={maxPosts}
                            onChange={event => setMaxPosts(Number(event.target.value))}
                            disabled={isActive || busy}
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={isActive || busy}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        Search LinkedIn Hiring Posts
                    </button>
                    {isActive && (
                        <button type="button" onClick={() => void stopSearch()} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50">
                            <Square className="h-3.5 w-3.5 fill-current" /> Stop
                        </button>
                    )}
                </form>
                <p className="mt-3 text-xs text-slate-500">
                    Skills are optional match hints: matches are highlighted, but title-matching posts are still saved when no skill hint matches. Uses your paired visible browser; access restrictions are never bypassed.
                </p>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Run status', value: statusLabel, icon: Activity, status: true },
                    { label: 'Posts processed', value: `${run?.processedPosts || 0}${run ? ` / ${run.maxPosts}` : ''}`, icon: CheckCircle2 },
                    { label: 'Emails found', value: run?.emailsFound || 0, icon: Mail },
                    { label: 'Saved · duplicates · failures', value: `${run?.recordsSaved || 0} · ${run?.duplicatesSkipped || 0} · ${run?.failures || 0}`, icon: Users },
                ].map(item => (
                    <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            {item.label}
                            <item.icon className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="mt-2">
                            {item.status
                                ? <span className={`rounded-full px-2.5 py-1 text-sm font-semibold capitalize ${statusColor}`}>{item.value}</span>
                                : <span className="text-xl font-bold text-slate-900">{item.value}</span>}
                        </div>
                    </div>
                ))}
            </section>

            {run && (
                <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500">
                        <span>Search: <strong className="font-semibold text-slate-700">{run.searchQuery}</strong></span>
                        {run.searchedSkills?.length ? <span>Skill hints: <strong className="font-semibold text-slate-700">{run.searchedSkills.join(', ')}</strong></span> : null}
                        <span>Started: {run.startedAt ? new Date(run.startedAt).toLocaleString() : 'Waiting for local runner'}</span>
                        <span>Completed: {run.completedAt ? new Date(run.completedAt).toLocaleString() : '—'}</span>
                    </div>
                    {isActive && (
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-blue-100">
                            <div className="h-full w-1/3 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-blue-500" />
                        </div>
                    )}
                    {run.errorMessage && <p className="mt-3 text-sm text-rose-700">{run.errorMessage}</p>}
                </section>
            )}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            <Activity className="h-4 w-4 text-blue-400" /> Live activity
                        </div>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'animate-pulse bg-emerald-400' : 'bg-slate-500'}`} />
                            {isActive ? 'RUNNING' : statusLabel.toUpperCase()}
                        </span>
                    </div>
                    <div className="h-[360px] space-y-2 overflow-y-auto p-4 font-mono text-xs">
                        {logs.length ? logs.map(log => (
                            <div key={log._id} className="animate-[fadeIn_250ms_ease-out] leading-relaxed">
                                <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <span className={`mx-2 font-bold ${levelClass[log.level] || levelClass.INFO}`}>{log.level}</span>
                                <span className="text-slate-200">{log.message}</span>
                            </div>
                        )) : (
                            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
                                {isActive
                                    ? <LoaderCircle className="h-7 w-7 animate-spin text-blue-400" />
                                    : <Activity className="h-7 w-7 text-slate-700" />}
                                <p>{isActive ? 'Waiting for real browser activity…' : 'Search activity will appear here.'}</p>
                            </div>
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">Saved hiring posts</h2>
                            <p className="mt-0.5 text-xs text-slate-500">Persisted recruiter leads, including posts without email addresses.</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{leads.length} shown</span>
                    </div>
                    <div className="max-h-[360px] overflow-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                                <tr><th className="px-4 py-3">Company / role</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Post</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leads.map(lead => (
                                    <tr key={lead._id} className="align-top hover:bg-slate-50/70">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{lead.companyName || 'Unknown company'}</div>
                                            <div className="mt-0.5 text-xs text-slate-500">{lead.position || 'Requested title'}</div>
                                            {lead.location && <div className="mt-1 text-xs text-slate-600">Location: {lead.location}</div>}
                                            {(lead.skills?.length || lead.requiredSkills?.length || lead.optionalSkills?.length) ? (
                                                <div className="mt-1 line-clamp-2 text-xs text-violet-700">
                                                    Skills: {[...new Set([...(lead.skills || []), ...(lead.requiredSkills || []), ...(lead.optionalSkills || [])])].join(', ')}
                                                </div>
                                            ) : null}
                                            {lead.extractionStatus === 'NEEDS_REVIEW' && <span className="mt-1 inline-block text-[10px] font-medium text-amber-700">Needs review</span>}
                                        </td>
                                        <td className="max-w-[180px] px-4 py-3">
                                            {lead.recruiterName && lead.recruiterProfileUrl
                                                ? <a className="text-xs font-medium text-blue-700 hover:underline" href={lead.recruiterProfileUrl} target="_blank" rel="noreferrer">{lead.recruiterName} <ExternalLink className="inline h-3 w-3" /></a>
                                                : <div className="text-xs text-slate-700">{lead.recruiterName || 'Author unknown'}</div>}
                                            {lead.recruiterEmails?.length
                                                ? lead.recruiterEmails.map(email => <div key={email} className="mt-1 break-all text-xs text-blue-700">{email}</div>)
                                                : <div className="mt-1 text-xs text-amber-700">Email missing</div>}
                                        </td>
                                        <td className="max-w-[220px] px-4 py-3">
                                            <details>
                                                <summary className="cursor-pointer list-none">
                                                    <span className="line-clamp-3 whitespace-pre-wrap text-xs text-slate-500">{lead.sourcePostText}</span>
                                                    <span className="mt-1 inline-block text-xs font-medium text-blue-700">Show full post</span>
                                                </summary>
                                                <div className="mt-2 max-h-72 overflow-auto rounded-lg bg-slate-50 p-3">
                                                    <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-700">{lead.sourcePostText}</p>
                                                </div>
                                            </details>
                                            {lead.sourceUrl && <a className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline" href={lead.sourceUrl} target="_blank" rel="noreferrer">Open post <ExternalLink className="h-3 w-3" /></a>}
                                        </td>
                                    </tr>
                                ))}
                                {!leads.length && <tr><td colSpan={3} className="px-4 py-12 text-center text-sm text-slate-500">No saved posts yet. Start a search to populate results.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
};
