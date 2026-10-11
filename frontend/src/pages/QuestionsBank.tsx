import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '../api/client';
import { Globe, Loader2, Search, CheckCircle2, BrainCircuit, Filter } from 'lucide-react';

interface Question {
    _id: string;
    text: string;
    type: string;
    category: string;
    userAnswer: string;
}

const CATEGORIES = ['All', 'Screening', 'Behavioral', 'Education', 'Unmapped'];

export const QuestionsBank: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await apiClient.get('/questions');
            setQuestions(response.data);
            // Pre-fill saved set
            const saved = new Set<string>();
            response.data.forEach((q: Question) => {
                if (q.userAnswer) saved.add(q._id);
            });
            setSavedIds(saved);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (id: string, value: string) => {
        setQuestions(prev => prev.map(q => q._id === id ? { ...q, userAnswer: value } : q));
        if (savedIds.has(id)) {
            const newSaved = new Set(savedIds);
            newSaved.delete(id);
            setSavedIds(newSaved);
        }
    };

    const saveAnswer = async (id: string, answer: string) => {
        setSavingId(id);
        try {
            await apiClient.post('/questions/answer', {
                questionId: id,
                answer
            });
            setSavedIds(prev => new Set(prev).add(id));
        } catch (error) {
            console.error('Error saving answer:', error);
            alert('Failed to save answer');
        } finally {
            setSavingId(null);
        }
    };

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All'
                ? true
                : activeCategory === 'Screening'
                    ? ((q.category === 'screening' || !q.category) && q.type !== 'text')
                    : activeCategory === 'Behavioral'
                        ? (q.category === 'behavioral' || q.type === 'text')
                        : q.category?.toLowerCase() === activeCategory.toLowerCase();
            return matchesSearch && matchesCategory;
        });
    }, [questions, searchQuery, activeCategory]);

    const progressPercentage = Math.round((savedIds.size / (questions.length || 1)) * 100);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-tight">Global Question Bank</h1>
                        <p className="text-xs text-slate-500">Train your AI to auto-fill applications</p>
                    </div>
                </div>

                {/* Progress Widget */}
                <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold text-slate-700">{savedIds.size} / {questions.length} Answered</span>
                        <div className="w-32 h-1.5 bg-slate-300 rounded-full mt-1 overflow-hidden">
                            <div
                                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-teal-600">
                        {progressPercentage}%
                    </div>
                </div>
            </div>

            <div className="space-y-8">

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-24 z-40 bg-slate-50/95 p-2 rounded-xl backdrop-blur-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none shadow-sm text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-teal-500" />
                        <p>Loading your personal knowledge base...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuestions.map((q) => (
                            <div
                                key={q._id}
                                className={`group relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl ${savedIds.has(q._id)
                                    ? 'border-teal-200 shadow-sm'
                                    : 'border-slate-200 shadow-sm hover:border-blue-300'
                                    }`}
                            >
                                <div className="p-6 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-slate-100 px-2 py-1 rounded-md text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                            {q.category || 'General'}
                                        </div>
                                        {savedIds.has(q._id) && (
                                            <CheckCircle2 className="w-5 h-5 text-teal-500 animate-in zoom-in spin-in-50 duration-300" />
                                        )}
                                    </div>

                                    <h3 className="text-md font-medium text-slate-800 mb-4 bg-slate-50/50 p-2 -mx-2 rounded-lg min-h-[3rem]">
                                        {q.text}
                                    </h3>

                                    <div className="mt-auto space-y-3">
                                        <div className="relative">
                                            {q.type === 'boolean' ? (
                                                <div className="relative">
                                                    <select
                                                        className={`w-full p-3 text-sm bg-slate-50 border rounded-xl outline-none transition-all appearance-none cursor-pointer focus:bg-white focus:ring-2 ${savedIds.has(q._id) ? 'border-teal-200 focus:ring-teal-500' : 'border-slate-200 focus:ring-blue-500'}`}
                                                        value={q.userAnswer === 'true' ? 'Yes' : q.userAnswer === 'false' ? 'No' : q.userAnswer || ''}
                                                        onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                                    >
                                                        <option value="">Select an answer...</option>
                                                        <option value="Yes">Yes</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            ) : q.type === 'number' ? (
                                                <input
                                                    type="number"
                                                    className={`w-full p-3 text-sm bg-slate-50 border rounded-xl outline-none transition-all focus:bg-white focus:ring-2 ${savedIds.has(q._id) ? 'border-teal-200 focus:ring-teal-500' : 'border-slate-200 focus:ring-blue-500'}`}
                                                    placeholder="Enter number..."
                                                    value={q.userAnswer || ''}
                                                    onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                                />
                                            ) : (q.type === 'text' || q.text.toLowerCase().includes('describe') || q.text.toLowerCase().includes('why')) ? (
                                                <textarea
                                                    className={`w-full p-3 text-sm bg-slate-50 border rounded-xl outline-none transition-all resize-none h-24 focus:bg-white focus:ring-2 ${savedIds.has(q._id) ? 'border-teal-200 focus:ring-teal-500' : 'border-slate-200 focus:ring-blue-500'}`}
                                                    placeholder="Draft your answer..."
                                                    value={q.userAnswer || ''}
                                                    onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    className={`w-full p-3 text-sm bg-slate-50 border rounded-xl outline-none transition-all focus:bg-white focus:ring-2 ${savedIds.has(q._id) ? 'border-teal-200 focus:ring-teal-500' : 'border-slate-200 focus:ring-blue-500'}`}
                                                    placeholder="Your answer..."
                                                    value={q.userAnswer || ''}
                                                    onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                                />
                                            )}

                                            {/* AI assist hint - decorative for now */}
                                            {(!q.userAnswer && (q.category === 'behavioral' || q.type === 'text') && q.type !== 'boolean' && q.type !== 'number') && (
                                                <div className="absolute bottom-2 right-2">
                                                    <BrainCircuit className="w-4 h-4 text-purple-400 opacity-50 hover:opacity-100 cursor-help" />
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => saveAnswer(q._id, q.userAnswer)}
                                            disabled={savingId === q._id || !q.userAnswer}
                                            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${savingId === q._id
                                                ? 'bg-slate-100 text-slate-400 cursor-wait'
                                                : savedIds.has(q._id)
                                                    ? 'bg-teal-50 text-teal-600 hover:bg-teal-100 border border-teal-200'
                                                    : q.userAnswer
                                                        ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg transform active:scale-95'
                                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {savingId === q._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : savedIds.has(q._id) ? (
                                                <>Saved Successfully</>
                                            ) : (
                                                <>Save Answer</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredQuestions.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-600">No questions found</h3>
                        <p className="text-slate-400">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};
