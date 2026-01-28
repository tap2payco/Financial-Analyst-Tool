import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { authService } from '../../services/authService';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const user = await authService.login(email, password);
            // Store session locally for sync access
            localStorage.setItem('finance_guru_session', JSON.stringify(user));
            
            if (user.role === 'admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/developer';
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 border border-indigo-100 dark:border-slate-700 backdrop-blur-xl">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                Welcome Back
                            </h2>
                            <p className="text-slate-500 mt-2">Sign in to your Finance Guru account</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="name@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder={authService.isSupabaseMode ? "Enter your password" : "Not required (demo mode)"}
                                />
                                {!authService.isSupabaseMode && (
                                    <p className="text-xs text-slate-400 mt-1">Demo mode: Password not required</p>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>

                            <p className="text-center text-sm text-slate-500">
                                Don't have an account? <a href="/register" className="text-indigo-600 font-semibold hover:underline">Create one</a>
                            </p>
                        </form>
                        
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
                            <p className="text-xs text-slate-400">
                                {authService.isSupabaseMode 
                                    ? "Connected to Supabase" 
                                    : "Demo Mode: Use admin@financeguru.com for Admin"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Login;

