import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle, Zap, Globe, Cpu, Layout, Play } from 'lucide-react';

const Home: React.FC = () => {
    const { currentUser } = useAuth();
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const Navbar = () => (
        <nav className="fixed w-full z-50 transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-white/20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-xl text-white">
                            <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">JobApplyer<span className="text-blue-600">.ai</span></span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</button>
                        <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">How it Works</button>

                        {currentUser ? (
                            <Link
                                to="/dashboard"
                                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-[100px]" />
                    <div className="absolute top-40 right-10 w-96 h-96 bg-violet-400/20 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wide mb-6 animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        v2.0 Now Live
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        The smart way to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">automate your job search.</span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        Stop manually filling forms. Our AI agent applies to 100+ jobs daily on LinkedIn & Naukri while you sleep.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <Link
                            to="/signup"
                            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-2xl hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 group"
                        >
                            Start Applying Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button
                            onClick={() => scrollToSection('how-it-works')}
                            className="px-8 py-4 bg-white text-slate-700 text-lg font-semibold rounded-2xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                        >
                            <Play className="w-5 h-5 fill-slate-700" /> Watch Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to get hired fast</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">We've built the most comprehensive automation tool for job seekers.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Globe,
                                title: "Multi-Platform Support",
                                description: "Seamlessly apply to jobs on LinkedIn, Naukri, and diverse company career portals with a single click.",
                                color: "bg-blue-50 text-blue-600"
                            },
                            {
                                icon: Cpu,
                                title: "AI-Powered Answers",
                                description: "Our intelligent agent reads your resume and answers custom questions tailored to each specific job application.",
                                color: "bg-violet-50 text-violet-600"
                            },
                            {
                                icon: Layout,
                                title: "Smart Dashboard",
                                description: "Track every application, view success rates, and manage your profile from one beautiful, glass-morphic interface.",
                                color: "bg-emerald-50 text-emerald-600"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="glass-card p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
                                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 bg-white px-6 border-y border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold mb-6">WORKFLOW</div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Set it and forget it.</h2>
                            <p className="text-lg text-slate-600 mb-8">
                                Setup takes less than 2 minutes. Once configured, our bot runs entirely in the cloud, applying to jobs that match your criteria 24/7.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { step: "01", title: "Connect your accounts", text: "Securely link your LinkedIn and Naukri profiles." },
                                    { step: "02", title: "Set your preferences", text: "Define job titles, locations, and salary expectations." },
                                    { step: "03", title: "Launch automation", text: "Hit play and watch the applications roll in." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full border-2 border-slate-100 text-slate-400 font-bold flex items-center justify-center shrink-0">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                                            <p className="text-slate-500">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-2xl rotate-3 opacity-20 blur-lg"></div>
                            <div className="relative bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl">
                                <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">Automation Active</div>
                                        <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Running now
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((_, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">
                                                {i === 0 ? 'G' : i === 1 ? 'M' : 'A'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-2 w-24 bg-slate-200 rounded mb-1.5"></div>
                                                <div className="h-1.5 w-16 bg-slate-100 rounded"></div>
                                            </div>
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                                    <Zap className="w-4 h-4 fill-current" />
                                </div>
                                <span className="text-lg font-bold text-white tracking-tight">JobApplyer<span className="text-blue-500">.ai</span></span>
                            </div>
                            <p className="text-slate-400 max-w-sm">
                                We're on a mission to democratize job searching with autonomous AI agents.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                        <p>© {new Date().getFullYear()} JobApplyer Inc. All rights reserved.</p>
                        <p>Made with <span className="text-red-500">❤</span> for job seekers everywhere.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
