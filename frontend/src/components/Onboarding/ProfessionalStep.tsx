import React, { useState } from 'react';

interface ProfessionalStepProps {
    data: any;
    onNext: (data: any) => void;
    onBack?: () => void;
    onSkip: () => void;
}

const ProfessionalStep: React.FC<ProfessionalStepProps> = ({ data, onNext, onBack, onSkip }) => {
    const [formData, setFormData] = useState({
        preferredJobTitles: data.preferredJobTitles || [],
        noticePeriod: data.noticePeriod || '',
        currentCTC: data.currentCTC || '',
        expectedCTC: data.expectedCTC || '',
    });

    const [newJobTitle, setNewJobTitle] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext(formData);
    };

    const addJobTitle = () => {
        if (newJobTitle.trim() && !formData.preferredJobTitles.includes(newJobTitle.trim())) {
            setFormData({
                ...formData,
                preferredJobTitles: [...formData.preferredJobTitles, newJobTitle.trim()],
            });
            setNewJobTitle('');
        }
    };

    const removeJobTitle = (title: string) => {
        setFormData({
            ...formData,
            preferredJobTitles: formData.preferredJobTitles.filter((t: string) => t !== title),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Professional Information</h2>
                <p className="text-sm text-gray-600">Tell us about your career preferences</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Job Titles
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={newJobTitle}
                        onChange={(e) => setNewJobTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addJobTitle())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Product Manager"
                    />
                    <button
                        type="button"
                        onClick={addJobTitle}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.preferredJobTitles.map((title: string) => (
                        <span
                            key={title}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                            {title}
                            <button
                                type="button"
                                onClick={() => removeJobTitle(title)}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notice Period
                </label>
                <select
                    value={formData.noticePeriod}
                    onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select notice period</option>
                    <option value="Immediate">Immediate</option>
                    <option value="15 Days">15 Days</option>
                    <option value="1 Month">1 Month</option>
                    <option value="2 Months">2 Months</option>
                    <option value="3 Months">3 Months</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current CTC (optional)
                    </label>
                    <input
                        type="text"
                        value={formData.currentCTC}
                        onChange={(e) => setFormData({ ...formData, currentCTC: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 12 LPA"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected CTC
                    </label>
                    <input
                        type="text"
                        value={formData.expectedCTC}
                        onChange={(e) => setFormData({ ...formData, expectedCTC: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 18 LPA"
                    />
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <div className="space-x-2">
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            Back
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onSkip}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                        Skip for now
                    </button>
                </div>
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Next
                </button>
            </div>
        </form>
    );
};

export default ProfessionalStep;
