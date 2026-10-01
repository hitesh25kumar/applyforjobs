import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    Settings,
    Globe,
    FileText,
    Menu,
    X,
    ChevronRight,
    Sparkles,
    Bell,
    Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { Instagram } from 'lucide-react';
import { InstagramAutomationModal } from './InstagramAutomationModal';
import { Toast } from './Toast';

export const Layout = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed] = useState(false);

    // Instagram Modal State
    const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to logout', error);
        }
    };

    const handleInstagramClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsInstagramModalOpen(true);
        setIsMobileMenuOpen(false);
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/applications', label: 'Applications', icon: FileText },
        { path: '/profile', label: 'My Profile', icon: User },
        { path: '/questions-bank', label: 'Question Bank', icon: Globe },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    const userDisplayName = currentUser?.email?.split('@')[0] || 'User';
    const userPhotoURL = currentUser?.photoURL;

    // Get current page title
    const currentPage = navItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

    return (
        <div className="min-h-screen flex font-sans text-slate-900">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <InstagramAutomationModal
                isOpen={isInstagramModalOpen}
                onClose={() => setIsInstagramModalOpen(false)}
                onSuccess={(msg) => {
                    setToast({ message: msg, type: 'success' });
                }}
                onError={(msg) => {
                    setToast({ message: msg, type: 'error' });
                }}
            />

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    bg-white/80 backdrop-blur-2xl border-r border-white/40 shadow-2xl lg:shadow-none
                    transition-all duration-300 ease-in-out
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${isSidebarCollapsed ? 'w-20' : 'w-72'}
                    flex flex-col
                `}
            >
                {/* Sidebar Header */}
                <div className="h-20 flex items-center px-6 border-b border-slate-100/50">
                    <div className="flex items-center gap-3 overflow-hidden w-full">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        {!isSidebarCollapsed && (
                            <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 truncate">
                                JobApplyer
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden ml-auto p-1 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden
                                    ${isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/25'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                `}
                                title={isSidebarCollapsed ? item.label : undefined}
                            >
                                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                {!isSidebarCollapsed && (
                                    <span className="font-medium text-[15px]">{item.label}</span>
                                )}
                                {!isSidebarCollapsed && isActive && (
                                    <ChevronRight className="w-4 h-4 ml-auto text-white/50" />
                                )}
                            </Link>
                        );
                    })}

                    {/* Instagram Auto Link */}
                    <button
                        onClick={handleInstagramClick}
                        className={`
                            w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden
                            text-slate-600 hover:bg-pink-50 hover:text-pink-600
                        `}
                        title={isSidebarCollapsed ? "Instagram Auto" : undefined}
                    >
                        <Instagram className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-pink-500" />
                        {!isSidebarCollapsed && (
                            <span className="font-medium text-[15px]">Instagram Auto</span>
                        )}
                        {!isSidebarCollapsed && (
                            <ChevronRight className="w-4 h-4 ml-auto text-pink-200 group-hover:text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </button>

                </nav>

                {/* User Profile Section */}
                <div className="p-4 border-t border-slate-100/50 bg-white/40 backdrop-blur-sm">
                    <div
                        className={`
                            flex items-center gap-3 p-3 rounded-2xl
                            ${isSidebarCollapsed ? 'justify-center' : ''}
                            bg-white border border-slate-100 shadow-sm
                        `}
                    >
                        {userPhotoURL ? (
                            <img
                                src={userPhotoURL}
                                alt="Profile"
                                className="w-9 h-9 rounded-full border border-slate-200 shrink-0"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                                {userDisplayName[0]?.toUpperCase()}
                            </div>
                        )}

                        {!isSidebarCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                    {userDisplayName}
                                </p>
                                <button
                                    onClick={handleLogout}
                                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 mt-0.5"
                                >
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-0">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 py-4 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-white/50 rounded-xl transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 hidden md:block animate-fade-in">
                                {currentPage}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-white/80 backdrop-blur-xl border border-white/40 rounded-full px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all w-64">
                            <Search className="w-4 h-4 text-slate-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
                            />
                        </div>
                        <button className="relative p-2.5 bg-white/80 backdrop-blur-xl border border-white/40 rounded-full text-slate-600 hover:text-blue-600 hover:shadow-md transition-all">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 scroll-smooth will-change-scroll">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
