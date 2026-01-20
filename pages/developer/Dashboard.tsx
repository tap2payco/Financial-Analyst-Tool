import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { authService, User } from '../../services/authService';

const DevDashboard: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            window.location.href = '/login';
            return;
        }
        setUser(currentUser);
    }, []);

    const handleRequestKey = () => {
        if (user) {
            authService.requestApiKey(user.id);
            // Refresh user data
            setUser(authService.getCurrentUser());
        }
    };

    if (!user) return null;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Developer Console</h1>
                    <p className="text-slate-500">Manage your API keys and integration</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* User Profile Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-2xl font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{user.name}</h3>
                                <p className="text-sm text-slate-500">{user.company}</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-slate-500">Email</span>
                                <span className="font-medium">{user.email}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-slate-500">Phone</span>
                                <span className="font-medium">{user.phone}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-slate-500">Location</span>
                                <span className="font-medium">{user.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/30">
                        <h3 className="text-indigo-200 font-medium mb-1">Total API Calls</h3>
                        <div className="text-4xl font-bold mb-6">0</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <div className="text-xs text-indigo-200 mb-1">Active Keys</div>
                                <div className="text-xl font-bold">
                                    {user.apiKeys.filter(k => k.status === 'active').length}
                                </div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <div className="text-xs text-indigo-200 mb-1">Plan</div>
                                <div className="text-xl font-bold">Free</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col justify-center gap-4">
                        <button 
                            onClick={handleRequestKey}
                            className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            Request New API Key
                        </button>
                        <a href="/docs" className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-xl font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            View Documentation
                        </a>
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-4 px-1">Your API Keys</h3>
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                    {user.apiKeys.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No API keys yet. Click "Request New API Key" to get started.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">API Key</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Created At</th>
                                        <th className="px-6 py-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {user.apiKeys.map((key) => (
                                        <tr key={key.key} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm">
                                                {key.status === 'active' ? key.key : '•'.repeat(20)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${key.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                                                      key.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                    {key.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(key.requestedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-slate-400 hover:text-red-500 transition-colors">
                                                    Revoke
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default DevDashboard;
