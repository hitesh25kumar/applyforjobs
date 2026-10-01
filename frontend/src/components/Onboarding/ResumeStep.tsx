import React, { useState } from 'react';

interface ResumeStepProps {
    data: any;
    onNext: (data: any) => void;
    onBack?: () => void;
    onSkip: () => void;
}

const ResumeStep: React.FC<ResumeStepProps> = ({ data, onNext, onBack, onSkip }) => {
    const [formData, setFormData] = useState({
        resumePath: data.resumePath || '',
        linkedinUrl: data.linkedinUrl || '',
        portfolioUrl: data.portfolioUrl || '',
        githubUrl: data.githubUrl || '',
    });

    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [uploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If there's a new resume file, upload it first
        if (resumeFile) {
            // TODO: Implement resume upload to backend/storage
            // For now, just save the filename
            // formData.resumePath = `/uploads/${resumeFile.name}`;
        }

        onNext(formData);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
                alert('Only PDF and DOC files are allowed');
                return;
            }
            setResumeFile(file);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Resume & Links</h2>
                <p className="text-sm text-gray-600">Share your professional profiles</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume (PDF/DOC, max 5MB)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                        {resumeFile ? (
                            <div className="text-green-600">
                                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="font-medium">{resumeFile.name}</p>
                                <p className="text-xs text-gray-500 mt-1">Click to change</p>
                            </div>
                        ) : (
                            <div className="text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="font-medium">Click to upload or drag and drop</p>
                                <p className="text-xs mt-1">PDF, DOC up to 5MB</p>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Profile URL
                </label>
                <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portfolio Website (optional)
                </label>
                <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourportfolio.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub Profile (optional)
                </label>
                <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/yourusername"
                />
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
                    disabled={uploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {uploading ? 'Uploading...' : 'Next'}
                </button>
            </div>
        </form>
    );
};

export default ResumeStep;
