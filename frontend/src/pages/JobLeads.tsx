import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    ArrowDown,
    ArrowUp,
    BriefcaseBusiness,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Copy,
    Download,
    ExternalLink,
    Filter,
    LoaderCircle,
    Mail,
    MapPin,
    Search,
    X,
} from 'lucide-react';
import apiClient from '../api/client';

interface Lead {
    _id: string;
    companyName?: string;
    position?: string;
    location?: string;
    recruiterEmails?: string[];
    primaryEmail?: string;
    publishedAt?: string;
    createdAt?: string;
    discoveredAt?: string;
    sourceType?: string;
    sourceUrl?: string;
    sourcePostText?: string;
    recruiterName?: string;
    recruiterProfileUrl?: string;
    extractionStatus?: string;
    reviewStatus?: string;
    outreachStatus?: string;
    skills?: string[];
    requiredSkills?: string[];
    optionalSkills?: string[];
    searchQuery?: string;
}

interface LeadResponse {
    leads: Lead[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

const filterKeys = [
    'q', 'company', 'position', 'location', 'hasEmail', 'email',
    'postedFrom', 'postedTo', 'collectedFrom', 'collectedTo', 'source',
    'reviewStatus', 'outreachStatus', 'sort', 'order', 'page',
] as const;

const leadEmails = (lead: Lead) => lead.recruiterEmails?.length
    ? lead.recruiterEmails
    : lead.primaryEmail
        ? [lead.primaryEmail]
        : [];

const queryToApiParams = (query: URLSearchParams) => {
    const params: Record<string, string | number> = { limit: 25, page: Number(query.get('page')) || 1 };
    for (const key of filterKeys) {
        const value = query.get(key);
        if (value && key !== 'page' && key !== 'q') params[key] = value;
    }
    const search = query.get('q');
    if (search) params.search = search;
    return params;
};

const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const JobLeads = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [rows, setRows] = useState<Lead[]>([]);
    const [pagination, setPagination] = useState<LeadResponse['pagination']>({ page: 1, limit: 25, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchDraft, setSearchDraft] = useState(searchParams.get('q') || '');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [notice, setNotice] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const queryKey = searchParams.toString();
    const query = useMemo(() => new URLSearchParams(queryKey), [queryKey]);
    const updateParam = useCallback((key: string, value: string) => {
        setSearchParams(previous => {
            const next = new URLSearchParams(previous);
            if (value) next.set(key, value);
            else next.delete(key);
            next.set('page', '1');
            return next;
        });
    }, [setSearchParams]);

    useEffect(() => {
        setSearchDraft(query.get('q') || '');
    }, [query]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const value = searchDraft.trim();
            if (value !== (query.get('q') || '')) {
                setSearchParams(previous => {
                    const next = new URLSearchParams(previous);
                    if (value) next.set('q', value);
                    else next.delete('q');
                    next.set('page', '1');
                    return next;
                });
            }
        }, 350);
        return () => window.clearTimeout(timer);
    }, [query, searchDraft, setSearchParams]);

    const loadLeads = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.get<LeadResponse>('/recruiter/leads', {
                params: queryToApiParams(query),
                signal,
            });
            setRows(response.data.leads || []);
            setPagination(response.data.pagination);
        } catch (requestError) {
            if (signal?.aborted) return;
            console.error('Could not load job leads:', requestError);
            setError('Could not load saved leads. Check your connection and retry.');
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [query]);

    useEffect(() => {
        const controller = new AbortController();
        void loadLeads(controller.signal);
        return () => controller.abort();
    }, [loadLeads]);

    const openLead = async (lead: Lead) => {
        setSelectedLead(lead);
        setDrawerLoading(true);
        try {
            const response = await apiClient.get<Lead>(`/recruiter/leads/${lead._id}`);
            setSelectedLead(response.data);
        } catch (requestError) {
            console.error('Could not load job lead details:', requestError);
            setNotice('Could not load the full saved post. Try opening it again.');
        } finally {
            setDrawerLoading(false);
        }
    };

    const updateStatus = async (lead: Lead, key: 'reviewStatus' | 'outreachStatus', value: string) => {
        setUpdatingStatus(true);
        setNotice('');
        try {
            const response = await apiClient.patch<Lead>(`/recruiter/leads/${lead._id}`, { [key]: value });
            setRows(current => current.map(row => row._id === lead._id ? { ...row, ...response.data } : row));
            setSelectedLead(current => current?._id === lead._id ? { ...current, ...response.data } : current);
            setNotice('Lead status updated.');
        } catch (requestError) {
            console.error('Could not update job lead status:', requestError);
            setNotice('Status could not be updated. Please retry.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const exportCsv = async () => {
        setExporting(true);
        setError('');
        try {
            const params = queryToApiParams(query);
            const allLeads: Lead[] = [];
            let page = 1;
            let totalPages = 1;
            do {
                const response = await apiClient.get<LeadResponse>('/recruiter/leads', {
                    params: { ...params, page },
                });
                allLeads.push(...response.data.leads);
                totalPages = response.data.pagination.totalPages;
                page += 1;
            } while (page <= totalPages);
            const columns: Array<[string, (lead: Lead) => string]> = [
                ['Company', lead => lead.companyName || ''],
                ['Job title', lead => lead.position || ''],
                ['Location', lead => lead.location || ''],
                ['Emails', lead => leadEmails(lead).join('; ')],
                ['Posted at', lead => lead.publishedAt || ''],
                ['Collected at', lead => lead.createdAt || lead.discoveredAt || ''],
                ['Source', lead => lead.sourceType || ''],
                ['Original URL', lead => lead.sourceUrl || ''],
                ['Extraction status', lead => lead.extractionStatus || ''],
                ['Review status', lead => lead.reviewStatus || ''],
                ['Contact status', lead => lead.outreachStatus || ''],
                ['Skills', lead => [...new Set([...(lead.skills || []), ...(lead.requiredSkills || []), ...(lead.optionalSkills || [])])].join('; ')],
                ['Original post text', lead => lead.sourcePostText || ''],
            ];
            const csv = [
                columns.map(([heading]) => csvCell(heading)).join(','),
                ...allLeads.map(lead => columns.map(([, value]) => csvCell(value(lead))).join(',')),
            ].join('\r\n');
            const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'job-leads.csv';
            anchor.click();
            URL.revokeObjectURL(url);
        } catch (requestError) {
            console.error('Could not export job leads:', requestError);
            setError('Could not export leads. Please retry.');
        } finally {
            setExporting(false);
        }
    };

    const copyEmails = async (lead: Lead) => {
        const emails = leadEmails(lead);
        try {
            await navigator.clipboard.writeText(emails.join('; '));
            setNotice(emails.length ? `Copied ${emails.length} email address(es).` : 'This lead has no email address to copy.');
        } catch (copyError) {
            console.error('Could not copy lead emails:', copyError);
            setNotice('Could not access clipboard. Select the email text and copy it manually.');
        }
    };

    const setPage = (page: number) => {
        setSearchParams(previous => {
            const next = new URLSearchParams(previous);
            next.set('page', String(page));
            return next;
        });
    };

    const toggleSort = (field: string) => {
        const direction = query.get('sort') === field && query.get('order') !== 'asc' ? 'asc' : 'desc';
        setSearchParams(previous => {
            const next = new URLSearchParams(previous);
            next.set('sort', field);
            next.set('order', direction);
            next.set('page', '1');
            return next;
        });
    };

    const dateLabel = (value?: string) => value ? new Date(value).toLocaleString() : 'Not available';
    const currentPage = pagination.page || 1;

    return (
        <main className="mx-auto max-w-[1500px] space-y-5 pb-12">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <BriefcaseBusiness className="h-6 w-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-slate-900">Job Leads</h1>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Search and manage real extracted posts saved to your account.</p>
                </div>
                <button type="button" onClick={() => void exportCsv()} disabled={exporting || loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
                    {exporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Export filtered CSV
                </button>
            </header>

            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
            {notice && <div role="status" className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss"><X className="h-4 w-4" /></button></div>}

            <section className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="relative text-xs font-semibold text-slate-600 lg:col-span-2">
                        <span className="mb-1 block">Keyword search</span>
                        <Search className="absolute left-3 top-[34px] h-4 w-4 text-slate-400" />
                        <input value={searchDraft} onChange={event => setSearchDraft(event.target.value)} placeholder="Search company, title, email, post text, skills…" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                    </label>
                    {[
                        ['company', 'Company', 'Company name'],
                        ['position', 'Job title', 'Job title'],
                        ['location', 'Location', 'Location'],
                        ['email', 'Email address', 'name@example.com'],
                    ].map(([key, label, placeholder]) => (
                        <label key={key} className="text-xs font-semibold text-slate-600">
                            <span className="mb-1 block">{label}</span>
                            <input value={query.get(key) || ''} onChange={event => updateParam(key, event.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                        </label>
                    ))}
                    <label className="text-xs font-semibold text-slate-600">
                        <span className="mb-1 block">Email presence</span>
                        <select value={query.get('hasEmail') || 'any'} onChange={event => updateParam('hasEmail', event.target.value === 'any' ? '' : event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal">
                            <option value="any">Any</option><option value="yes">Has email</option><option value="no">No email</option>
                        </select>
                    </label>
                    <label className="text-xs font-semibold text-slate-600">
                        <span className="mb-1 block">Source</span>
                        <select value={query.get('source') || ''} onChange={event => updateParam('source', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal">
                            <option value="">All sources</option><option value="linkedin-post">LinkedIn</option><option value="pasted-text">Pasted text</option><option value="public-url">Public URL</option><option value="csv-import">CSV import</option>
                        </select>
                    </label>
                    <label className="text-xs font-semibold text-slate-600">
                        <span className="mb-1 block">Review status</span>
                        <select value={query.get('reviewStatus') || ''} onChange={event => updateParam('reviewStatus', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal">
                            <option value="">All review states</option><option value="NEEDS_REVIEW">Needs review</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option>
                        </select>
                    </label>
                    <label className="text-xs font-semibold text-slate-600">
                        <span className="mb-1 block">Contact status</span>
                        <select value={query.get('outreachStatus') || ''} onChange={event => updateParam('outreachStatus', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal">
                            <option value="">All contact states</option><option value="NOT_CONTACTED">Not contacted</option><option value="DRAFTED">Drafted</option><option value="SENT">Sent</option>
                        </select>
                    </label>
                </div>
                <div className="grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ['postedFrom', 'Posted from'],
                        ['postedTo', 'Posted to'],
                        ['collectedFrom', 'Collected from'],
                        ['collectedTo', 'Collected to'],
                    ].map(([key, label]) => (
                        <label key={key} className="text-xs font-semibold text-slate-600">
                            <span className="mb-1 flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{label}</span>
                            <input type="date" value={query.get(key) || ''} onChange={event => updateParam(key, event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" />
                        </label>
                    ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><Filter className="h-3.5 w-3.5" />{pagination.total} matching lead(s)</span>
                    <button type="button" onClick={() => { setSearchDraft(''); setSearchParams(new URLSearchParams()); }} className="font-semibold text-blue-700 hover:text-blue-900">Clear filters</button>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1250px] border-collapse text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                {[
                                    ['companyName', 'Company'], ['position', 'Job title'], ['location', 'Location'],
                                    ['publishedAt', 'Posted'], ['createdAt', 'Collected'], ['sourceType', 'Source'],
                                ].map(([field, label]) => (
                                    <th key={field} className="px-4 py-3">
                                        <button type="button" onClick={() => toggleSort(field)} className="inline-flex items-center gap-1 font-semibold hover:text-slate-900">
                                            {label}
                                            {query.get('sort') === field && (query.get('order') === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                        </button>
                                    </th>
                                ))}
                                <th className="px-4 py-3">Original post URL</th>
                                <th className="px-4 py-3">Emails</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? Array.from({ length: 7 }, (_, index) => (
                                <tr key={index} className="animate-pulse">
                                    {Array.from({ length: 9 }, (_, cell) => <td key={cell} className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>)}
                                </tr>
                            )) : rows.map(lead => (
                                <tr key={lead._id} className="hover:bg-slate-50/80">
                                    <td className="max-w-48 px-4 py-3 font-medium text-slate-900">{lead.companyName || 'Unknown'}</td>
                                    <td className="max-w-56 px-4 py-3 text-slate-700">{lead.position || 'Not specified'}</td>
                                    <td className="px-4 py-3 text-slate-600">{lead.location || '—'}</td>
                                    <td className="px-4 py-3 text-xs text-slate-600">{lead.publishedAt ? new Date(lead.publishedAt).toLocaleDateString() : '—'}</td>
                                    <td className="px-4 py-3 text-xs text-slate-600">{dateLabel(lead.createdAt || lead.discoveredAt)}</td>
                                    <td className="px-4 py-3 text-xs text-slate-600">{lead.sourceType || '—'}</td>
                                    <td className="max-w-48 px-4 py-3">
                                        {lead.sourceUrl
                                            ? <a href={lead.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex max-w-48 items-center gap-1 truncate text-xs text-blue-700 hover:underline"><span className="truncate">{lead.sourceUrl}</span><ExternalLink className="h-3 w-3 shrink-0" /></a>
                                            : <span className="text-xs text-slate-400">Unavailable</span>}
                                    </td>
                                    <td className="max-w-56 px-4 py-3">
                                        {leadEmails(lead).length
                                            ? <div className="space-y-1">{leadEmails(lead).map(email => <div key={email} className="break-all text-xs text-blue-700">{email}</div>)}</div>
                                            : <span className="text-xs text-slate-400">No email</span>}
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        <span className="block text-slate-700">{lead.extractionStatus || '—'}</span>
                                        <span className="text-slate-500">{lead.reviewStatus || '—'} · {lead.outreachStatus || '—'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={() => void openLead(lead)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white">Details</button>
                                            <button type="button" title="Copy emails" onClick={() => void copyEmails(lead)} className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"><Copy className="h-4 w-4" /></button>
                                            {lead.sourceUrl && <a title="Open original post" href={lead.sourceUrl} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"><ExternalLink className="h-4 w-4" /></a>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && !rows.length && (
                            <tr><td colSpan={10} className="px-6 py-14 text-center">
                                    <BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-300" />
                                    <p className="mt-3 font-semibold text-slate-700">{error ? 'Results unavailable' : 'No saved leads match these filters'}</p>
                                    <p className="mt-1 text-sm text-slate-500">{error ? 'Retry after checking the API connection.' : 'Try clearing filters or run a hiring-post search.'}</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
                    <span>Page {currentPage} of {Math.max(1, pagination.totalPages)} · {pagination.total} records</span>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setPage(currentPage - 1)} disabled={loading || currentPage <= 1} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Previous</button>
                        <button type="button" onClick={() => setPage(currentPage + 1)} disabled={loading || currentPage >= pagination.totalPages} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40">Next<ChevronRight className="h-4 w-4" /></button>
                    </div>
                </footer>
            </section>

            {selectedLead && (
                <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/40" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedLead(null); }}>
                    <aside role="dialog" aria-modal="true" aria-label="Job lead details" className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl">
                        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
                            <div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Saved post details</p><h2 className="mt-1 text-lg font-bold text-slate-900">{selectedLead.position || 'Job lead'}</h2></div>
                            <button type="button" onClick={() => setSelectedLead(null)} aria-label="Close details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                        </header>
                        <div className="space-y-5 p-5">
                            {drawerLoading && <div className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Loading saved post…</div>}
                            <div className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                                <div><span className="text-xs text-slate-500">Company</span><p className="font-semibold text-slate-900">{selectedLead.companyName || 'Unknown'}</p></div>
                                <div><span className="text-xs text-slate-500">Location</span><p className="inline-flex items-center gap-1 font-semibold text-slate-900"><MapPin className="h-3.5 w-3.5" />{selectedLead.location || 'Not found'}</p></div>
                                <div><span className="text-xs text-slate-500">Original publication</span><p className="font-medium text-slate-800">{dateLabel(selectedLead.publishedAt)}</p></div>
                                <div><span className="text-xs text-slate-500">Collected</span><p className="font-medium text-slate-800">{dateLabel(selectedLead.createdAt || selectedLead.discoveredAt)}</p></div>
                                <div><span className="text-xs text-slate-500">Source / extraction</span><p className="font-medium text-slate-800">{selectedLead.sourceType || '—'} · {selectedLead.extractionStatus || '—'}</p></div>
                                <div><span className="text-xs text-slate-500">Recruiter / author</span><p className="font-medium text-slate-800">{selectedLead.recruiterName || 'Not available'}</p></div>
                            </div>
                            <div>
                                <div className="mb-2 flex items-center justify-between"><h3 className="font-semibold text-slate-900">Extracted email addresses</h3><button type="button" onClick={() => void copyEmails(selectedLead)} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><Copy className="h-3.5 w-3.5" />Copy all</button></div>
                                {leadEmails(selectedLead).length
                                    ? leadEmails(selectedLead).map(email => <a key={email} href={`mailto:${email}`} className="mb-1 flex items-center gap-2 break-all text-sm text-blue-700"><Mail className="h-4 w-4 shrink-0" />{email}</a>)
                                    : <p className="text-sm text-slate-500">No email address was found in the saved post.</p>}
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-slate-900">Extracted skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {[...new Set([...(selectedLead.skills || []), ...(selectedLead.requiredSkills || []), ...(selectedLead.optionalSkills || [])])].map(skill => <span key={skill} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800">{skill}</span>)}
                                    {!selectedLead.skills?.length && !selectedLead.requiredSkills?.length && !selectedLead.optionalSkills?.length && <span className="text-sm text-slate-500">No recognized skills were found.</span>}
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="text-xs font-semibold text-slate-600">Review status
                                    <select disabled={updatingStatus} value={selectedLead.reviewStatus || 'NEEDS_REVIEW'} onChange={event => void updateStatus(selectedLead, 'reviewStatus', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal">
                                        <option value="NEEDS_REVIEW">Needs review</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option>
                                    </select>
                                </label>
                                <label className="text-xs font-semibold text-slate-600">Contact status
                                    <select disabled={updatingStatus} value={selectedLead.outreachStatus || 'NOT_CONTACTED'} onChange={event => void updateStatus(selectedLead, 'outreachStatus', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal">
                                        <option value="NOT_CONTACTED">Not contacted</option><option value="DRAFTED">Drafted</option><option value="SENT">Sent</option>
                                    </select>
                                </label>
                            </div>
                            {selectedLead.sourceUrl && <a href={selectedLead.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><ExternalLink className="h-4 w-4" />Open original post</a>}
                            <div>
                                <h3 className="mb-2 font-semibold text-slate-900">Original extracted post text</h3>
                                <pre className="max-h-[42vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">{selectedLead.sourcePostText || 'No original text was stored for this record.'}</pre>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </main>
    );
};
