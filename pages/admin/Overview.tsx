import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { authService, User } from '../../services/authService';

const AdminOverview: React.FC = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalKeys: 0,
        pendingRequests: 0,
        activeKeys: 0
    });

    useEffect(() => {
        const users = authService.getAllUsers();
        let keys = 0;
        let active = 0;
        let pending = 0;

        users.forEach(u => {
            u.apiKeys.forEach(k => {
                keys++;
                if (k.status === 'active') active++;
                if (k.status === 'pending') pending++;
            });
        });

        setStats({
            totalUsers: users.length - 1, // Exclude admin self if singular
            totalKeys: keys,
            activeKeys: active,
            pendingRequests: pending
        });
    }, []);

    return (
        <AdminLayout activePage="overview">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Total Users</div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</div>
                </div>
                 <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Total API Keys</div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalKeys}</div>
                </div>
                 <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium mb-1">Active Keys</div>
                    <div className="text-3xl font-bold text-emerald-600">{stats.activeKeys}</div>
                </div>
                 <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-slate-500 text-sm font-medium mb-1">Pending Requests</div>
                        <div className="text-3xl font-bold text-amber-500">{stats.pendingRequests}</div>
                    </div>
                    {stats.pendingRequests > 0 && (
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-amber-500" />
                    )}
                </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-fuchsia-600 rounded-2xl p-8 text-white shadow-lg">
                <h2 className="text-2xl font-bold mb-2">System Status</h2>
                <p className="text-indigo-100 mb-6">All systems are operational. The Finance Guru API is serving requests with 99.9% uptime.</p>
                <div className="flex gap-4">
                     <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <span className="text-xs uppercase tracking-wider opacity-75">Latency</span>
                        <div className="font-mono font-bold">45ms</div>
                     </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <span className="text-xs uppercase tracking-wider opacity-75">Version</span>
                        <div className="font-mono font-bold">v1.2.0</div>
                     </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminOverview;
