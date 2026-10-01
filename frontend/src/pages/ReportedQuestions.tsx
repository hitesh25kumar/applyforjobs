import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import apiClient from '../api/client';

export const ReportedQuestions = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/profile');
            setQuestions(response.data.reportedQuestions || []);
        } catch (err) {
            console.error('Failed to fetch reported questions:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearAllQuestions = async () => {
        if (!confirm('Are you sure you want to clear all unmapped questions?')) {
            return;
        }

        setSaving(true);
        try {
            await apiClient.patch('/profile', { reportedQuestions: [] });
            setQuestions([]);
        } catch (err) {
            console.error('Failed to clear questions:', err);
            alert('Failed to clear questions');
        } finally {
            setSaving(false);
        }
    };

    const removeQuestion = async (questionToRemove: string) => {
        setSaving(true);
        try {
            const updatedQuestions = questions.filter(q => q !== questionToRemove);
            await apiClient.patch('/profile', { reportedQuestions: updatedQuestions });
            setQuestions(updatedQuestions);
        } catch (err) {
            console.error('Failed to remove question:', err);
            alert('Failed to remove question');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Unmapped Questions</h1>
                    <p className="text-gray-600">Questions that couldn't be auto-filled from your profile</p>
                </div>
                {questions.length > 0 && (
                    <button
                        onClick={clearAllQuestions}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="py-4">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : questions.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">All Set!</h3>
                        <p className="text-gray-600 mb-6">
                            No unmapped questions found. All questions during automation were successfully matched to your profile.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Info Alert */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-900">
                                <p className="font-medium mb-1">What are these questions?</p>
                                <p className="text-blue-800">
                                    These questions appeared during job applications but couldn't be auto-filled because they don't match any fields in your profile.
                                    Consider adding these to your profile or creating custom question mappings to improve automation.
                                </p>
                            </div>
                        </div>

                        {/* Questions List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Found {questions.length} Unmapped Question{questions.length !== 1 ? 's' : ''}
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {questions.map((question, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50 transition flex items-center justify-between group">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <span className="text-sm font-semibold text-blue-600">{idx + 1}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-900 font-medium">{question}</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Add this field to your profile to auto-fill in future applications
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeQuestion(question)}
                                            disabled={saving}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                            title="Remove this question"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
