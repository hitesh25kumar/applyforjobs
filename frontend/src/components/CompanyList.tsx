import { useEffect, useState } from 'react';
import { getCompanies } from '../api/client';
import { Building2, CheckCircle2, Clock, XCircle, Loader2, Trash2, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../api/client';

interface Company {
    _id: string;
    name: string;
    status: 'PENDING' | 'RESOLVED' | 'FAILED';
    websiteUrl?: string;
}

export const CompanyList = ({ refreshTrigger }: { refreshTrigger: number }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await getCompanies();
                setCompanies(res.data);
            } catch (error) {
                console.error("Failed to fetch companies", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, [refreshTrigger]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await api.delete(`/companies/${id}`);
            setCompanies(companies.filter(c => c._id !== id));
        } catch (error) {
            console.error("Failed to delete company", error);
            alert("Failed to delete company");
        }
    };

    const handleReset = async (id: string, name: string) => {
        if (!confirm(`Reset "${name}" to PENDING status?`)) return;
        try {
            await api.patch(`/companies/${id}/reset`);
            setCompanies(companies.map(c => c._id === id ? { ...c, status: 'PENDING' as const } : c));
        } catch (error) {
            console.error("Failed to reset company", error);
            alert("Failed to reset company");
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>;

    if (companies.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Building2 className="mx-auto size-12 mb-2 text-gray-400" />
                <p>No companies added yet.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-3">
            {companies.map((company) => (
                <div key={company._id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className={twMerge(clsx("p-2 rounded-full", {
                            'bg-yellow-100 text-yellow-600': company.status === 'PENDING',
                            'bg-green-100 text-green-600': company.status === 'RESOLVED',
                            'bg-red-100 text-red-600': company.status === 'FAILED',
                        }))}>
                            <Building2 className="size-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">{company.name}</h3>
                            {company.websiteUrl && <a href={company.websiteUrl} target="_blank" className="text-xs text-blue-500 hover:underline">{company.websiteUrl}</a>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {company.status === 'PENDING' && <span className="flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded"><Clock className="size-3" /> Pending</span>}
                        {company.status === 'RESOLVED' && <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded"><CheckCircle2 className="size-3" /> Resolved</span>}
                        {company.status === 'FAILED' && (
                            <>
                                <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded"><XCircle className="size-3" /> Failed</span>
                                <button
                                    onClick={() => handleReset(company._id, company.name)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Reset to Pending"
                                >
                                    <RotateCcw className="size-4" />
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => handleDelete(company._id, company.name)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Company"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
