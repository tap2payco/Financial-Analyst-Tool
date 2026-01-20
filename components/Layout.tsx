import React, { useState, useEffect } from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { authService, User } from '../services/authService';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setUser(authService.getCurrentUser());
    }, []);

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-indigo-100 dark:border-indigo-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
                            <div className="p-2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg shadow-indigo-500/20">
                                <LogoIcon className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400">
                                Finance Guru
                            </span>
                        </div>

                        {/* Nav Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="/" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Chat</a>
                            <a href="/docs" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">API Docs</a>
                            {user ? (
                                <div className="flex items-center gap-4 ml-4">
                                    <span className="text-sm font-medium text-slate-500">
                                        {user.name} ({user.role})
                                    </span>
                                    {user.role === 'admin' ? (
                                        <a href="/admin" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30">
                                            Admin Panel
                                        </a>
                                    ) : (
                                        <a href="/developer" className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-lg shadow-pink-600/30">
                                            Dev Console
                                        </a>
                                    )}
                                    <button 
                                        onClick={handleLogout}
                                        className="text-slate-500 hover:text-red-500 transition-colors"
                                        aria-label="Logout"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <a href="/login" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">Login</a>
                                    <a href="/register" className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5">
                                        Get Started
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            
            <main className="pt-16 min-h-screen">
                {children}
            </main>
        </div>
    );
};

export default Layout;
