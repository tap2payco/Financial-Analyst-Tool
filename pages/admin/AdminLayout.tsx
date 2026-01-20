import React, { useState, useEffect } from 'react';
import { authService, User } from '../../services/authService';

interface AdminLayoutProps {
    children: React.ReactNode;
    activePage: 'overview' | 'users' | 'requests';
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activePage }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = '/login';
            return;
        }
        setUser(currentUser);
    }, []);

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    if (!user) return null;

    const navItems = [
        { id: 'overview', label: 'Overview', href: '/admin/overview', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )},
        { id: 'users', label: 'User Management', href: '/admin/users', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )},
        { id: 'requests', label: 'API Requests', href: '/admin/requests', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
        )}
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans text-slate-900 dark:text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full z-20 hidden md:flex flex-col">
                <div className="p-6">
                    <a href="/" className="flex items-center gap-2 mb-8 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                            FG
                        </div>
                        <span className="font-bold text-xl tracking-tight">
                            Finance Guru
                        </span>
                    </a>
                    
                    <div className="px-3 py-2 bg-slate-800 rounded-xl mb-6">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Authenticated as</div>
                        <div className="font-medium text-sm text-fuchsia-400">Administrator</div>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <a
                                key={item.id}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                                    ${activePage === item.id 
                                        ? 'bg-fuchsia-600 text-white' 
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{user.name}</div>
                            <div className="text-xs text-slate-400 truncate">{user.email}</div>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

             {/* Mobile Header */}
             <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-20 px-4 py-3 flex items-center justify-between shadow-md">
                <a href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center text-white font-bold">FG</div>
                    <span className="font-bold text-lg">Finance Guru Admin</span>
                </a>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 mt-14 md:mt-0 overflow-y-auto h-screen bg-slate-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
