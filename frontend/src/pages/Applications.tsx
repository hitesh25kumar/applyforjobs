import { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Building2, Briefcase, ExternalLink, Eye, Globe } from 'lucide-react';
import apiClient from '../api/client';

interface Application {
    _id: string;
    platform: string;
    companyName: string;
    jobTitle: string;
    jobUrl?: string;
    location?: string;
    status: string;
    appliedAt: string;
    success: boolean;
}

interface QuestionAnswer {
    question: string;
    answer: string;
    fieldType?: string;
    category?: string;
}

export const Applications = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [platformFilter, setPlatformFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [questions, setQuestions] = useState<QuestionAnswer[]>([]);
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, [page, platformFilter, statusFilter]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });

            if (platformFilter) params.append('platform', platformFilter);
            if (statusFilter) params.append('status', statusFilter);

            const response = await apiClient.get(`/applications?${params}`);
            setApplications(response.data.applications);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            console.error('Failed to fetch applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const viewQuestions = async (app: Application) => {
        setSelectedApp(app);
        try {
            const response = await apiClient.get(`/applications/${app._id}/questions`);
            setQuestions(response.data);
            setShowQuestionsModal(true);
        } catch (err) {
            console.error('Failed to fetch questions:', err);
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'linkedin': return <span className="text-blue-600 font-bold">in</span>;
            case 'naukri': return <span className="text-blue-800 font-bold">Nk</span>;
            default: return <Globe className="w-4 h-4 text-slate-500" />;
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            applied: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
            interview: 'bg-amber-100 text-amber-700 border-amber-200',
            default: 'bg-slate-100 text-slate-700 border-slate-200'
        };
        const key = status.toLowerCase() as keyof typeof styles;
        const style = styles[key] || styles.default;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
                {status}
            </span>
        );
    };

    const filteredApplications = applications.filter(app =>
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Application History</h1>
                    <p className="text-slate-500">Track and manage your automated job applications</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search applications..."
                            className="pl-10 pr-4 py-2 w-64 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters Dropdown */}
            {showFilters && (
                <div className="glass-panel p-4 rounded-xl animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Platform</label>
                            <select
                                value={platformFilter}
                                onChange={(e) => setPlatformFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">All Platforms</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Naukri">Naukri</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">All Statuses</option>
                                <option value="Applied">Applied</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Interview">Interview</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Applications Table */}
            <div className="glass-panel rounded-2xl overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mb-4"></div>
                        <p className="text-sm">Loading applications...</p>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 text-center px-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Briefcase className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No applications found</h3>
                        <p className="text-slate-500 max-w-sm mt-1">
                            We couldn't find any applications matching your criteria. Try adjusting your filters or search terms.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Platform</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredApplications.map((app) => (
                                    <tr key={app._id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0 border border-white shadow-sm">
                                                    {app.companyName[0]}
                                                </div>
                                                <span className="font-semibold text-slate-900">{app.companyName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-slate-600 font-medium">{app.jobTitle}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getPlatformIcon(app.platform)}
                                                <span className="text-sm text-slate-500 capitalize">{app.platform}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={app.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(app.appliedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => viewQuestions(app)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                    title="View Q&A"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {app.jobUrl && (
                                                    <a
                                                        href={app.jobUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                                        title="View Job"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-slate-500 font-medium">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Questions Modal */}
            {showQuestionsModal && selectedApp && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl ring-1 ring-black/5">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedApp.companyName}</h2>
                                    <p className="text-sm text-slate-500">{selectedApp.jobTitle}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowQuestionsModal(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)] space-y-4">
                            {questions.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Briefcase className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No recorded questions found.</p>
                                    <p className="text-xs text-slate-400 mt-1">This application might have been simple click-to-apply.</p>
                                </div>
                            ) : (
                                questions.map((qa, idx) => (
                                    <div key={idx} className="group bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all">
                                        <div className="flex gap-4">
                                            <div className="mt-0.5 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <p className="font-semibold text-slate-800 text-sm leading-relaxed">{qa.question}</p>
                                                <div className="bg-white rounded-lg p-3 border border-slate-200 text-sm text-slate-600 font-medium shadow-sm">
                                                    {qa.answer}
                                                </div>
                                                {qa.category && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Category:</span>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide">
                                                            {qa.category}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
