import React, { useState, useEffect } from 'react';
import DevLayout from './DevLayout';
import { authService, User } from '../../services/authService';
import { sendChatMessage } from '../../services/geminiService'; // Reusing service for demo

const DevPlayground: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [apiKey, setApiKey] = useState('');
    const [prompt, setPrompt] = useState('Analyze the ROI for a coffee shop startup with $50k initial investment.');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [jsonMode, setJsonMode] = useState(false);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            // Auto-fill with first active key if available
            const activeKey = currentUser.apiKeys.find(k => k.status === 'active');
            if (activeKey) {
                setApiKey(activeKey.key);
            }
        }
    }, []);

    const handleRunRequest = async () => {
        if (!prompt) return;
        setLoading(true);
        setResponse('');
        
        try {
            // Simulation of using the key 
            // In a real app we would pass the key to the backend
            
            // Artificial delay to feel like a real request
            await new Promise(resolve => setTimeout(resolve, 800));

            const result = await sendChatMessage([], prompt);
            
            if (jsonMode) {
                // Mocking a JSON response structure wrapper
                const mockJson = {
                    status: "success",
                    data: {
                        analysis: result,
                        tokens_used: Math.floor(result.length / 4),
                        model: "finance-guru-v1"
                    }
                };
                setResponse(JSON.stringify(mockJson, null, 2));
            } else {
                setResponse(result);
            }

        } catch (error) {
            setResponse(JSON.stringify({ error: "Request failed" }, null, 2));
        } finally {
            setLoading(false);
        }
    };

    return (
        <DevLayout activePage="playground">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">API Playground</h1>
            <p className="text-slate-500 mb-8">Test your prompts and see the AI's responses in real-time.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-250px)]">
                {/* Input Column */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Authentication</label>
                        <select 
                            aria-label="Select API Key"
                            value={apiKey} 
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono"
                        >
                            <option value="" disabled>Select an API Key</option>
                            {user?.apiKeys.filter(k => k.status === 'active').map(k => (
                                <option key={k.key} value={k.key}>{k.key} (Active)</option>
                            ))}
                            {user?.apiKeys.filter(k => k.status !== 'active').length === 0 && !user?.apiKeys.find(k => k.status === 'active') && (
                                <option value="" disabled>No active keys available</option>
                            )}
                        </select>
                    </div>

                    <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                             <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Request Body (JSON)</label>
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Mode:</span>
                                <button 
                                    onClick={() => setJsonMode(!jsonMode)}
                                    className={`px-2 py-1 text-xs font-bold rounded ${jsonMode ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}
                                >
                                    JSON
                                </button>
                             </div>
                        </div>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Enter your prompt here..."
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleRunRequest}
                                disabled={loading || !apiKey}
                                className={`px-6 py-2.5 rounded-lg font-bold text-white transition-all
                                    ${loading || !apiKey 
                                        ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' 
                                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30'}`}
                            >
                                {loading ? 'Processing...' : 'Send Request'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Column */}
                <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
                    <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Response</span>
                        {response && (
                            <span className="text-xs text-emerald-400 font-mono">200 OK</span>
                        )}
                    </div>
                    <div className="flex-1 p-4 overflow-auto custom-scrollbar">
                        {response ? (
                            <pre className="text-slate-300 font-mono text-sm whitespace-pre-wrap">{response}</pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <p>Run a request to see the output</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DevLayout>
    );
};

export default DevPlayground;
