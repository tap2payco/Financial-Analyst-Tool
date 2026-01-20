import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { authService } from '../../services/authService';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        location: '',
        phone: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            authService.register(formData);
            // Auto login after register
            const user = authService.login(formData.email);
            window.location.href = '/developer';
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
                <div className="w-full max-w-2xl">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 md:p-10 border border-purple-100 dark:border-slate-700 backdrop-blur-xl">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                                Create Developer Account
                            </h2>
                            <p className="text-slate-500 mt-2">Join Finance Guru to build financial AI solutions</p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                                <input 
                                    type="text" required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                    placeholder="John Doe"
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                <input 
                                    type="email" required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                    placeholder="name@company.com"
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                                <input 
                                    type="tel" required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                    placeholder="+1 (555) 000-0000"
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Name</label>
                                <input 
                                    type="text" required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                    placeholder="Acme Financial Corp"
                                    onChange={e => setFormData({...formData, company: e.target.value})}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location/Address</label>
                                <input 
                                    type="text" required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                    placeholder="123 Wall St, New York, NY"
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 mt-4">
                                <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:shadow-xl hover:shadow-purple-500/40 transition-all transform hover:-translate-y-0.5">
                                    Create Account
                                </button>
                                <p className="text-center text-sm text-slate-500 mt-4">
                                    Already have an account? <a href="/login" className="text-purple-600 font-semibold hover:underline">Sign In</a>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Register;
