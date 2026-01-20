import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { authService, User } from '../../services/authService';

const AdminRequests: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        setUsers(authService.getAllUsers());
    }, []);

    const handleUpdateStatus = (userId: string, key: string, status: 'active' | 'revoked') => {
        authService.updateApiKeyStatus(userId, key, status);
        setUsers(authService.getAllUsers()); // Refresh list
    };

    // Flatten logic to get list of all keys
    const allKeys = users.flatMap(u => 
        u.apiKeys.map(k => ({ ...k, userId: u.id, userName: u.name, userEmail: u.email }))
    ).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    return (
        <AdminLayout activePage="requests">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">API Key Requests</h1>

            <div className="space-y-4">
                {allKeys.length === 0 ? (
                     <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center text-slate-500">
                         No API key requests found.
                     </div>
                ) : (
                    allKeys.map(key => (
                        <div key={key.key} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                                    ${key.status === 'pending' ? 'bg-amber-500' : 
                                      key.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {key.status === 'pending' ? '?' : key.status === 'active' ? '✓' : '✗'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white">{key.userName}</h3>
                                        <span className="text-slate-400 text-sm">&bull;</span>
                                        <span className="text-slate-500 text-sm">{key.userEmail}</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm">
                                        <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-600 dark:text-slate-400 font-mono">
                                            {key.key}
                                        </code>
                                        <span className="text-slate-400">Requested: {new Date(key.requestedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {key.status === 'pending' && (
                                    <>
                                        <button 
                                            onClick={() => handleUpdateStatus(key.userId, key.key, 'active')}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(key.userId, key.key, 'revoked')}
                                            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 hover:text-red-600 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {key.status === 'active' && (
                                    <button 
                                        onClick={() => handleUpdateStatus(key.userId, key.key, 'revoked')}
                                        className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded-lg transition-colors"
                                    >
                                        Revoke Access
                                    </button>
                                )}
                                {key.status === 'revoked' && (
                                    <span className="px-4 py-2 text-slate-400 text-sm italic">Revoked</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminRequests;
