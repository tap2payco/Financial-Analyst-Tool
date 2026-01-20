import React, { useState, useEffect } from 'react';
import DevLayout from './DevLayout';
import { authService, User } from '../../services/authService';

const DevSettings: React.FC = () => {
   const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    if (!user) return null;

    return (
        <DevLayout activePage="settings">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Settings</h1>
            
            <div className="max-w-3xl">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white">Profile Information</h2>
                        <p className="text-sm text-slate-500">Your personal details and contact info.</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                                <input 
                                    aria-label="Full Name"
                                    type="text" 
                                    value={user.name} 
                                    readOnly 
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Name</label>
                                <input 
                                    aria-label="Company Name"
                                    type="text" 
                                    value={user.company} 
                                    readOnly 
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                <input 
                                    aria-label="Email Address"
                                    type="email" 
                                    value={user.email} 
                                    readOnly 
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                                <input 
                                    aria-label="Phone Number"
                                    type="text" 
                                    value={user.phone} 
                                    readOnly 
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 p-6">
                    <h3 className="text-red-800 dark:text-red-400 font-bold text-lg mb-2">Danger Zone</h3>
                    <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button className="px-4 py-2 bg-white border border-red-200 text-red-600 font-medium rounded-lg text-sm hover:bg-red-50 transition-colors">
                        Delete Account
                    </button>
                </div>
            </div>
        </DevLayout>
    );
};

export default DevSettings;
