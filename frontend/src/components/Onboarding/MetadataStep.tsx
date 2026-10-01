import React, { useState } from 'react';

interface MetadataStepProps {
    data: any;
    onNext: (data: any) => void;
    onBack?: () => void;
    onSkip: () => void;
}

const MetadataStep: React.FC<MetadataStepProps> = ({ data, onNext, onBack, onSkip }) => {
    const [formData, setFormData] = useState({
        education: data.education || [],
        experience: data.experience || [],
        techStack: data.techStack || [],
        skillsExperience: data.skillsExperience || [],
    });

    const [newSkill, setNewSkill] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext(formData);
    };

    const addEducation = () => {
        setFormData({
            ...formData,
            education: [...formData.education, { institution: '', degree: '', year: '' }],
        });
    };

    const updateEducation = (index: number, field: string, value: string) => {
        const updated = [...formData.education];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, education: updated });
    };

    const removeEducation = (index: number) => {
        setFormData({
            ...formData,
            education: formData.education.filter((_: any, i: number) => i !== index),
        });
    };

    const addExperience = () => {
        setFormData({
            ...formData,
            experience: [...formData.experience, { company: '', title: '', duration: '', description: '' }],
        });
    };

    const updateExperience = (index: number, field: string, value: string) => {
        const updated = [...formData.experience];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, experience: updated });
    };

    const removeExperience = (index: number) => {
        setFormData({
            ...formData,
            experience: formData.experience.filter((_: any, i: number) => i !== index),
        });
    };

    const addSkill = () => {
        if (newSkill.trim() && !formData.techStack.includes(newSkill.trim())) {
            setFormData({
                ...formData,
                techStack: [...formData.techStack, newSkill.trim()],
            });
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setFormData({
            ...formData,
            techStack: formData.techStack.filter((s: string) => s !== skill),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Auto-Fill Metadata</h2>
                <p className="text-sm text-gray-600">
                    Optional: Add details to auto-fill common ATS forms
                </p>
            </div>

            {/* Education */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Education</h3>
                    <button
                        type="button"
                        onClick={addEducation}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        + Add Education
                    </button>
                </div>
                {formData.education.map((edu: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <input
                                type="text"
                                placeholder="Institution"
                                value={edu.institution}
                                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Degree"
                                value={edu.degree}
                                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Year"
                                value={edu.year}
                                onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeEducation(index)}
                            className="text-xs text-red-600 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Work Experience */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Work Experience</h3>
                    <button
                        type="button"
                        onClick={addExperience}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        + Add Experience
                    </button>
                </div>
                {formData.experience.map((exp: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input
                                type="text"
                                placeholder="Company"
                                value={exp.company}
                                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Job Title"
                                value={exp.title}
                                onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
                            value={exp.duration}
                            onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3"
                        />
                        <textarea
                            placeholder="Description"
                            value={exp.description}
                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                            rows={2}
                        />
                        <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="text-xs text-red-600 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Skills */}
            <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Technical Skills</h3>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., React, Python, SQL"
                    />
                    <button
                        type="button"
                        onClick={addSkill}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                    >
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.techStack.map((skill: string) => (
                        <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                            {skill}
                            <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="text-green-600 hover:text-green-800"
                            >
                                ×
                            </button>
                        </span>
                    ))}
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
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    Complete Onboarding
                </button>
            </div>
        </form>
    );
};

export default MetadataStep;
