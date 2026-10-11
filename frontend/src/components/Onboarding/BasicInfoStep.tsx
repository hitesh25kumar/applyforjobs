import React, { useState } from 'react';

interface BasicInfoStepProps {
    data: any;
    onNext: (data: any) => void;
    onBack?: () => void;
    onSkip: () => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onNext, onSkip }) => {
    const [formData, setFormData] = useState({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        preferredCity: data.preferredCity || '',
        preferredCountry: data.preferredCountry || '',
        yearsOfExperience: data.yearsOfExperience || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext(formData);
    };

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Basic Information</h2>
                <p className="text-sm text-gray-600">Let's start with the essentials</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email * (read-only)
                </label>
                <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                </label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred City
                    </label>
                    <input
                        type="text"
                        value={formData.preferredCity}
                        onChange={(e) => handleChange('preferredCity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Bengaluru"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Country
                    </label>
                    <input
                        type="text"
                        value={formData.preferredCountry}
                        onChange={(e) => handleChange('preferredCountry', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="India"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                </label>
                <select
                    value={formData.yearsOfExperience}
                    onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select years</option>
                    <option value="0">0 - Fresher</option>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((year) => (
                        <option key={year} value={year}>
                            {year} {year === 1 ? 'year' : 'years'}
                        </option>
                    ))}
                    <option value="30">30+ years</option>
                </select>
            </div>

            <div className="flex justify-between pt-4">
                <button
                    type="button"
                    onClick={onSkip}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                    Skip for now
                </button>
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

export default BasicInfoStep;
