import React, { useState, useEffect } from 'react';
import DevLayout from './DevLayout';
import { authService, User } from '../../services/authService';

const DevOverview: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    const handleRequestKey = () => {
        if (user) {
            authService.requestApiKey(user.id);
            setUser(authService.getCurrentUser()); // Refresh
        }
    };

    if (!user) return null;

    const activeKeysCount = user.apiKeys.filter(k => k.status === 'active').length;
    const totalRequests = 0; // Mock stat

    return (
        <DevLayout activePage="overview">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Overview</h1>
            <p className="text-slate-500 mb-8">Welcome back, {user.name}. Here's what's happening with your API integration.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Stats Cards */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20">
                    <div className="text-indigo-200 text-sm font-medium mb-1">Total Requests</div>
                    <div className="text-3xl font-bold">{totalRequests}</div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Active Keys</div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{activeKeysCount}</div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Plan</div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">Free</div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">API Keys</h2>
                <button 
                    onClick={handleRequestKey}
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Key
                </button>
            </div>

             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {user.apiKeys.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No API keys yet. Create one to get started.
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">API Key</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                            {user.apiKeys.map((key) => (
                                <tr key={key.key} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                                        {key.status === 'active' ? key.key : '•'.repeat(24)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${key.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                                              key.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {key.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(key.requestedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-red-600 transition-colors text-xs font-medium uppercase tracking-wide">
                                            Revoke
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </DevLayout>
    );
};

export default DevOverview;
