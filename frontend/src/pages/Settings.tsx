import { useState } from 'react';
import { Save, Bell, Lock, Monitor, AlertCircle } from 'lucide-react';

export const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        browser: true,
        jobAlerts: true
    });
    const [automation, setAutomation] = useState({
        stopOnError: true,
        headlessMode: false,
        dailyLimit: 50
    });

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        // Add toast notification here
    };

    const Section = ({ title, icon: Icon, children }: any) => (
        <div className="glass-panel overflow-hidden rounded-2xl mb-6">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="font-bold text-slate-800 text-lg">{title}</h2>
            </div>
            <div className="p-8">
                {children}
            </div>
        </div>
    );

    const Toggle = ({ label, description, checked, onChange }: any) => (
        <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 last:pb-0 first:pt-0">
            <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500">Configure application behavior and preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition-all font-semibold shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>{loading ? 'Saving...' : 'Save Settings'}</span>
                </button>
            </div>

            <Section title="Automation Preferences" icon={Monitor}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Daily Application Limit</label>
                        <input
                            type="number"
                            value={automation.dailyLimit}
                            onChange={(e) => setAutomation({ ...automation, dailyLimit: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        />
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Recommended limit: 50 per day to avoid bans
                        </p>
                    </div>
                </div>
                <div className="space-y-2">
                    <Toggle
                        label="Stop on Error"
                        description="Pause automation if a critical error occurs"
                        checked={automation.stopOnError}
                        onChange={(v: boolean) => setAutomation({ ...automation, stopOnError: v })}
                    />
                    <Toggle
                        label="Headless Mode"
                        description="Run browser in background (faster but harder to debug)"
                        checked={automation.headlessMode}
                        onChange={(v: boolean) => setAutomation({ ...automation, headlessMode: v })}
                    />
                </div>
            </Section>

            <Section title="Notifications" icon={Bell}>
                <div className="space-y-2">
                    <Toggle
                        label="Email Notifications"
                        description="Receive daily summaries of applied jobs"
                        checked={notifications.email}
                        onChange={(v: boolean) => setNotifications({ ...notifications, email: v })}
                    />
                    <Toggle
                        label="Browser Notifications"
                        description="Get alerted when automation starts/finishes"
                        checked={notifications.browser}
                        onChange={(v: boolean) => setNotifications({ ...notifications, browser: v })}
                    />
                </div>
            </Section>

            <Section title="Security" icon={Lock}>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                            <p className="text-sm font-bold text-slate-900">Change Password</p>
                            <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                        </div>
                        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm">
                            Update
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                        <div>
                            <p className="text-sm font-bold text-red-900">Delete Account</p>
                            <p className="text-xs text-red-600/80">Permanently remove all data</p>
                        </div>
                        <button className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition shadow-sm">
                            Delete
                        </button>
                    </div>
                </div>
            </Section>
        </div>
    );
};
