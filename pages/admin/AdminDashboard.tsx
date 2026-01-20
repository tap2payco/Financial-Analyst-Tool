import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { authService, User } from '../../services/authService';

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user || user.role !== 'admin') {
            window.location.href = '/login';
            return;
        }
        setCurrentUser(user);
        setUsers(authService.getAllUsers());
    }, []);

    const handleUpdateStatus = (userId: string, key: string, status: 'active' | 'revoked') => {
        authService.updateApiKeyStatus(userId, key, status);
        setUsers(authService.getAllUsers()); // Refresh list
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Admin Panel</h1>
                        <p className="text-slate-500">Manage users and approve API requests</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium">User Profile</th>
                                    <th className="px-6 py-4 font-medium">Company / Location</th>
                                    <th className="px-6 py-4 font-medium">API Keys</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {users.filter(u => u.role !== 'admin').map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                                                    <div className="text-sm text-slate-500">{user.email}</div>
                                                    <div className="text-sm text-slate-500">{user.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">{user.company}</div>
                                            <div className="text-sm text-slate-500">{user.location}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.apiKeys.length === 0 ? (
                                                <span className="text-xs text-slate-400 italic">No keys requested</span>
                                            ) : (
                                                <div className="space-y-2">
                                                    {user.apiKeys.map(key => (
                                                        <div key={key.key} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg border border-slate-100 dark:border-slate-600">
                                                            <div className="flex-1">
                                                                <div className="text-xs font-mono truncate w-32">{key.key}</div>
                                                                <span className={`text-[10px] font-bold uppercase tracking-wider
                                                                    ${key.status === 'active' ? 'text-green-600' : 
                                                                      key.status === 'pending' ? 'text-amber-600' : 'text-red-600'}`}>
                                                                    {key.status}
                                                                </span>
                                                            </div>
                                                            {key.status === 'pending' && (
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(user.id, key.key, 'active')}
                                                                    className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 transition-colors"
                                                                >
                                                                    Approve
                                                                </button>
                                                            )}
                                                            {key.status === 'active' && (
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(user.id, key.key, 'revoked')}
                                                                    className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded hover:bg-red-200 transition-colors"
                                                                >
                                                                    Revoke
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.filter(u => u.role !== 'admin').length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                            No developers registered yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
