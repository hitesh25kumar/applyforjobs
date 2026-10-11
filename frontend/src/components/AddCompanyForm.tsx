import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { addCompanies } from '../api/client';

export const AddCompanyForm = ({ onCompanyAdded }: { onCompanyAdded: () => void }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setLoading(true);
        try {
            const names = input.split(',').map(n => n.trim()).filter(Boolean);
            await addCompanies(names);
            setInput('');
            onCompanyAdded();
        } catch (error) {
            console.error('Failed to add company', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-white shadow-sm rounded-lg border border-gray-100">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter company names (comma separated)"
                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin size-4" /> : <Plus className="size-4" />}
                Add
            </button>
        </form>
    );
};
