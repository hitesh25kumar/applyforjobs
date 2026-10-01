import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    CheckCircle,
    Clock,
    TrendingUp,
    Globe,
    ArrowUpRight,
    ChevronRight,
    Linkedin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { Line } from 'react-chartjs-2';
import { Toast } from '../components/Toast';
import { LinkedInJobSearchModal } from '../components/LinkedInJobSearchModal';
import { NaukriJobSearchModal } from '../components/NaukriJobSearchModal';
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
    successRate: string;
    totalApplied?: number;
    totalSuccess?: number;
    totalFailed?: number;
    appliedToday?: number;
}

export const Dashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        total: 0,
        today: 0,
        successRate: '0%'
    });
    const [loading, setLoading] = useState(true);
    const [recentSuccess, setRecentSuccess] = useState<any[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
    const [isNaukriModalOpen, setIsNaukriModalOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, [refreshKey]);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, applicationsRes] = await Promise.all([
                apiClient.get('/applications/stats'),
                apiClient.get('/applications?limit=5&status=applied')
            ]);

            setStats(statsRes.data);
            setRecentSuccess(applicationsRes.data.applications);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Chart Data
    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Applications Sent',
                data: [12, 19, 15, 25, 22, 10, 8],
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

    const StatCard = ({ title, value, icon: Icon, color, trend, subtext }: any) => (
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon className="w-16 h-16 transform rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {trend && (
                        <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {trend}
                        </span>
                    )}
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Applications"
                    value={stats.total}
                    icon={Briefcase}
                    color="text-blue-600"
                    trend="+12% this week"
                    subtext="All platforms combined"
                />
                <StatCard
                    title="Success Rate"
                    value={stats.successRate}
                    icon={CheckCircle}
                    color="text-green-600"
                    trend="+2.1%"
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
                    title="Automation Health"
                    value="98%"
                    icon={Globe}
                    color="text-teal-600"
                    subtext="System operational"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Section */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Application Activity</h3>
                            <p className="text-sm text-slate-500">Weekly breakdown of automated applications</p>
                        </div>
                        <select className="bg-slate-50 border-none text-sm font-medium text-slate-600 rounded-lg px-3 py-1.5 outline-none hover:bg-slate-100 transition-colors cursor-pointer">
                            <option>This Week</option>
                            <option>Last Month</option>
                        </select>
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
                                onClick={() => setIsLinkedInModalOpen(true)}
                                className="w-full group flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Linkedin className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">Start LinkedIn</p>
                                        <p className="text-xs text-blue-100 opacity-90">Auto-apply to jobs</p>
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
                                onClick={() => setIsNaukriModalOpen(true)}
                                className="w-full group flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-orange-200 hover:bg-orange-50 text-slate-700 rounded-xl transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-colors">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm text-slate-900">Naukri Apply</p>
                                        <p className="text-xs text-slate-500">Search & Apply</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                            </button>
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
                onClose={() => setIsLinkedInModalOpen(false)}
                onSuccess={() => {
                    setToast({ message: 'LinkedIn automation started!', type: 'success' });
                    handleRefresh();
                }}
                onError={(error) => {
                    setToast({ message: `LinkedIn error: ${error}`, type: 'error' });
                }}
            />

            <NaukriJobSearchModal
                isOpen={isNaukriModalOpen}
                onClose={() => setIsNaukriModalOpen(false)}
                onSuccess={() => {
                    setToast({ message: 'Naukri automation started!', type: 'success' });
                    handleRefresh();
                }}
                onError={(error) => {
                    setToast({ message: `Naukri error: ${error}`, type: 'error' });
                }}
            />
        </div>
    );
};
