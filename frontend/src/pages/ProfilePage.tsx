import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Save, User, FileText, Briefcase, Target, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        linkedinUrl: '',
        githubUrl: '',
        portfolioUrl: '',
        bio: '',
        resumeText: '', // Critical for AI
        jobKeywords: '', // Stored as string for editing
        preferredCity: '',
        preferredCountry: '',
        address: '',
        state: '',
        zipCode: '',
        coverLetter: '',
        resumeFilePath: '',
        resumeFileName: '', // Display uploaded filename
        coverLetterFileName: '', // Display uploaded cover letter filename
        techStack: '', // Comma-separated for editing
        dateAvailable: '',
        desiredPay: '',
        rightToWork: 'Yes',
        currentCTC: '',
        expectedCTC: '',
        noticePeriod: '',
        yearsOfExperience: '',
        productManagementExperience: '',
        canJoinIn15Days: 'Yes',
        agileScrumExperience: 'Yes',
        openToHybrid: 'Yes',
        techConceptsKnowledge: 'Yes',
        strategicRoadmapExperience: '',
        aiExperience: '',
        ecommerceOTTExperience: 'Yes',
        growthProductExperience: 'Yes',
        questionMappings: {} as Record<string, string>,
        reportedQuestions: [] as string[],
        skillsExperience: [] as { skill: string; years: number }[],
        skipContactStepIfFilled: true,
        skipResumeStepIfFilled: true,
        domainsExperience: [] as { skill: string; years: number }[],
        noExperience: 0,
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile');
            if (res.data) {
                setProfile(prev => ({
                    ...prev,
                    ...res.data,
                    jobKeywords: Array.isArray(res.data.jobKeywords) ? res.data.jobKeywords.join(', ') : (res.data.jobKeywords || ''),
                    techStack: Array.isArray(res.data.techStack) ? res.data.techStack.join(', ') : (res.data.techStack || ''),
                    questionMappings: res.data.questionMappings || {},
                    reportedQuestions: res.data.reportedQuestions || [],
                    skillsExperience: res.data.skillsExperience || [],
                    skipResumeStepIfFilled: res.data.skipResumeStepIfFilled ?? true,
                    domainsExperience: res.data.domainsExperience || []
                }));
            }
        } catch (e) {
            console.error("Failed to fetch profile", e);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Convert comma-separated strings back to arrays
            const payload = {
                ...profile,
                jobKeywords: profile.jobKeywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0),
                techStack: profile.techStack.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0)
            };
            await api.put('/profile', payload);
            alert("Profile saved! The AI Braniac has been updated.");
        } catch (e) {
            console.error("Failed to save", e);
            alert("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async () => {
        if (!resumeFile) {
            alert('Please select a file first');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);
            const res = await api.post('/profile/upload-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Resume uploaded successfully!');
            setProfile(prev => ({ ...prev, resumeFileName: res.data.filename }));
            setResumeFile(null);
        } catch (e) {
            console.error('Failed to upload resume', e);
            alert('Failed to upload resume');
        } finally {
            setUploading(false);
        }
    };

    const handleCoverLetterUpload = async () => {
        if (!coverLetterFile) {
            alert('Please select a file first');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('coverLetter', coverLetterFile);
            const res = await api.post('/profile/upload-cover-letter', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Cover letter uploaded successfully!');
            setProfile(prev => ({ ...prev, coverLetterFileName: res.data.filename }));
            setCoverLetterFile(null);
        } catch (e) {
            console.error('Failed to upload cover letter', e);
            alert('Failed to upload cover letter');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="font-medium">Loading your profile...</p>
        </div>
    );

    const SectionHeader = ({ icon: Icon, title, description }: any) => (
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h2 className="font-bold text-slate-800 text-lg">{title}</h2>
                    {description && <p className="text-xs text-slate-500">{description}</p>}
                </div>
            </div>
        </div>
    );

    const InputGroup = ({ label, name, placeholder, value, type = "text" }: any) => (
        <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                placeholder={placeholder}
            />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-slate-500">Manage your personal information and automation preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Application Materials Card (Priority) */}
            <section className="glass-panel overflow-hidden rounded-2xl">
                <SectionHeader icon={FileText} title="Application Materials" description="Resume and Cover Letter settings" />
                <div className="p-8 space-y-8">
                    {/* Resume Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-800">Resume (PDF)</label>
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors group">
                                <div className="space-y-3">
                                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        <label htmlFor="resume-upload" className="font-semibold text-blue-600 hover:underline cursor-pointer">
                                            Click to upload
                                        </label> or drag and drop
                                    </div>
                                    <p className="text-xs text-slate-400">PDF only (Max 5MB)</p>
                                </div>
                                <input
                                    id="resume-upload"
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                            </div>

                            {resumeFile && (
                                <div className="flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
                                    <span className="truncate max-w-[200px] font-medium">{resumeFile.name}</span>
                                    <button onClick={handleFileUpload} disabled={uploading} className="text-xs font-bold uppercase tracking-wide bg-white px-3 py-1 rounded-md shadow-sm hover:bg-blue-600 hover:text-white transition-colors">
                                        {uploading ? 'Uploading...' : 'Upload Now'}
                                    </button>
                                </div>
                            )}

                            {profile.resumeFileName && !resumeFile && (
                                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium px-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Current: {profile.resumeFileName}
                                </div>
                            )}
                        </div>

                        {/* Cover Letter Upload */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-800">Cover Letter (Optional)</label>
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-orange-400 transition-colors group">
                                <div className="space-y-3">
                                    <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        <label htmlFor="cl-upload" className="font-semibold text-orange-600 hover:underline cursor-pointer">
                                            Click to upload
                                        </label> or drag and drop
                                    </div>
                                    <p className="text-xs text-slate-400">PDF or DOCX</p>
                                </div>
                                <input
                                    id="cl-upload"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => setCoverLetterFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                            </div>
                            {coverLetterFile && (
                                <div className="flex items-center justify-between p-3 bg-orange-50 text-orange-700 rounded-lg text-sm border border-orange-100">
                                    <span className="truncate max-w-[200px] font-medium">{coverLetterFile.name}</span>
                                    <button onClick={handleCoverLetterUpload} disabled={uploading} className="text-xs font-bold uppercase tracking-wide bg-white px-3 py-1 rounded-md shadow-sm hover:bg-orange-600 hover:text-white transition-colors">
                                        {uploading ? 'Uploading...' : 'Upload Now'}
                                    </button>
                                </div>
                            )}
                            {profile.coverLetterFileName && !coverLetterFile && (
                                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium px-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Current: {profile.coverLetterFileName}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <InputGroup label="Desired Pay" name="desiredPay" value={profile.desiredPay} placeholder="$120,000" />
                        <InputGroup label="Date Available" name="dateAvailable" type="date" value={profile.dateAvailable} />
                    </div>
                </div>
            </section>

            {/* Identity Card */}
            <section className="glass-panel overflow-hidden rounded-2xl">
                <SectionHeader icon={User} title="Personal Details" description="Basic identity information" />
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="First Name" name="firstName" value={profile.firstName} placeholder="Jane" />
                    <InputGroup label="Last Name" name="lastName" value={profile.lastName} placeholder="Doe" />
                    <InputGroup label="Email" name="email" value={profile.email} placeholder="jane@example.com" />
                    <InputGroup label="Phone" name="phone" value={profile.phone} placeholder="+1 555 000 0000" />
                    <InputGroup label="Current City" name="city" value={profile.city} placeholder="San Francisco" />
                    <InputGroup label="Address" name="address" value={profile.address} placeholder="123 Main St" />
                </div>
            </section>

            {/* Targeting & Preferences Card */}
            <section className="glass-panel overflow-hidden rounded-2xl">
                <SectionHeader icon={Target} title="Job Targeting" description="Define what you're looking for" />
                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Job Title Keywords</label>
                        <input name="jobKeywords" value={profile.jobKeywords} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" placeholder="Product Manager, PO, Product Owner" />
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Target className="w-3 h-3" /> The automation will ONLY apply to jobs containing these words.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Preferred City" name="preferredCity" value={profile.preferredCity} placeholder="San Francisco" />
                        <InputGroup label="Preferred Country" name="preferredCountry" value={profile.preferredCountry} placeholder="USA" />
                    </div>
                </div>
            </section>

            {/* AI Brain Card (Resume Text) */}
            <section className="glass-panel overflow-hidden rounded-2xl">
                <SectionHeader icon={Briefcase} title="AI Context" description="Help the AI understand your background" />
                <div className="p-8 space-y-6">
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-sm text-indigo-800 mb-4 flex gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm h-fit">
                            <Briefcase className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                            <strong>Pro Tip:</strong> Paste your full resume text below. This is the primary source of truth for the AI when answering application questions.
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Resume Plain Text</label>
                        <textarea
                            name="resumeText"
                            value={profile.resumeText}
                            onChange={handleChange}
                            rows={15}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs leading-relaxed text-slate-700 resize-y"
                            placeholder="Paste your resume content here..."
                        />
                    </div>
                </div>
            </section>

            {/* Dynamic Question Mapping Card */}
            <section className="glass-panel overflow-hidden rounded-2xl">
                <SectionHeader icon={Globe} title="Dynamic Learning" description="Teach the bot how to answer specific questions" />
                <div className="p-8 space-y-6">

                    {/* Unmapped Questions Section */}
                    {profile.reportedQuestions.length > 0 && (
                        <div className="space-y-4 bg-red-50/50 p-4 rounded-xl border border-red-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-red-700 uppercase tracking-tight flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    New Questions Found ({profile.reportedQuestions.length})
                                </h3>
                                <button
                                    onClick={() => setProfile(prev => ({ ...prev, reportedQuestions: [] }))}
                                    className="text-xs text-red-600 hover:text-red-800 font-medium px-3 py-1.5 bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50 transition"
                                >
                                    Ignore All
                                </button>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {profile.reportedQuestions.map((q, idx) => (
                                    <div key={idx} className="flex flex-col gap-3 p-4 bg-white border border-red-100 rounded-xl shadow-sm">
                                        <div className="text-sm font-medium text-slate-800 italic">"{q}"</div>
                                        <div className="flex gap-2">
                                            <select
                                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                                                onChange={(e) => {
                                                    const field = e.target.value;
                                                    if (!field) return;
                                                    setProfile(prev => ({
                                                        ...prev,
                                                        questionMappings: { ...prev.questionMappings, [q]: field },
                                                        reportedQuestions: prev.reportedQuestions.filter(uq => uq !== q)
                                                    }));
                                                }}
                                            >
                                                <option value="">Select Field to Map...</option>
                                                <option value="productManagementExperience">Product Mgmt Exp</option>
                                                <option value="yearsOfExperience">Total Experience</option>
                                                <option value="currentCTC">Current CTC</option>
                                                <option value="expectedCTC">Expected CTC</option>
                                                <option value="noticePeriod">Notice Period</option>
                                                <option value="strategicRoadmapExperience">Roadmaps Exp</option>
                                                <option value="aiExperience">AI Exp</option>
                                                <option value="canJoinIn15Days">Can join 15d?</option>
                                                <option value="agileScrumExperience">Agile/Scrum</option>
                                                <option value="openToHybrid">Open to Hybrid</option>
                                                <option value="techConceptsKnowledge">Tech Concepts</option>
                                                <option value="phone">Phone/Mobile</option>
                                                <option value="preferredCity">City</option>
                                                <option value="city">Current City</option>
                                                <option value="state">State</option>
                                                <option value="rightToWork">Right to Work</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Mappings Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Active Mappings</h3>
                        {Object.keys(profile.questionMappings).length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                                <p className="text-sm text-slate-400">No custom mappings yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {Object.entries(profile.questionMappings).map(([q, f], idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 w-fit px-2 py-0.5 rounded-full">{f}</span>
                                            <span className="text-sm text-slate-700 font-medium">"{q}"</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newMappings = { ...profile.questionMappings };
                                                delete newMappings[q];
                                                setProfile(prev => ({ ...prev, questionMappings: newMappings }));
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};
