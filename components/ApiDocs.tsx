import React, { useState } from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface ApiDocsProps {
    onClose: () => void;
}

const ApiDocs: React.FC<ApiDocsProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'getting-started' | 'api-reference'>('getting-started');

    const CodeBlock = ({ children, language = 'javascript' }: { children: string; language?: string }) => (
        <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm font-mono">
            <code>{children}</code>
        </pre>
    );

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <LogoIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">API Documentation</h2>
                            <p className="text-sky-100 text-sm">Numbers Consulting Financial Analysis API</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        aria-label="Close documentation"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('getting-started')}
                        className={`px-6 py-3 font-medium text-sm transition-colors ${
                            activeTab === 'getting-started'
                                ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50 dark:bg-sky-900/20'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                    >
                        🚀 Getting Started
                    </button>
                    <button
                        onClick={() => setActiveTab('api-reference')}
                        className={`px-6 py-3 font-medium text-sm transition-colors ${
                            activeTab === 'api-reference'
                                ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50 dark:bg-sky-900/20'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                    >
                        📖 API Reference
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'getting-started' && (
                        <div className="max-w-3xl mx-auto space-y-8">
                            <section>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                    Welcome to Numbers Consulting API
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 mb-4">
                                    Integrate powerful AI-driven financial analysis into your applications. 
                                    Our API enables you to chat with a professional financial consultant, 
                                    analyze financial data, and generate branded PDF reports.
                                </p>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-900/20 dark:to-indigo-900/20 rounded-xl border border-sky-100 dark:border-sky-800">
                                        <div className="text-2xl mb-2">💬</div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white">Chat API</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">AI financial consultant</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                        <div className="text-2xl mb-2">📊</div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white">Analysis API</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Data analysis & reports</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                                        <div className="text-2xl mb-2">📄</div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white">PDF API</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Branded PDF reports</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                    Quick Start
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 flex items-center justify-center font-bold text-sm">1</div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">Get Your API Key</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Contact Numbers Consulting to obtain your API credentials.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 flex items-center justify-center font-bold text-sm">2</div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">Base URL</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">All API requests should be made to:</p>
                                            <code className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded text-sm font-mono">
                                                https://api.numbersconsulting.com/api
                                            </code>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 flex items-center justify-center font-bold text-sm">3</div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">Make Your First Request</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Try the chat endpoint:</p>
                                            <CodeBlock>{`fetch('https://api.numbersconsulting.com/api/chat', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
        message: "What financial ratios should I track?"
    })
})
.then(res => res.json())
.then(data => console.log(data.reply));`}</CodeBlock>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                <div className="flex gap-3">
                                    <span className="text-amber-500 text-xl">⚠️</span>
                                    <div>
                                        <h4 className="font-semibold text-amber-900 dark:text-amber-200">Rate Limits</h4>
                                        <p className="text-sm text-amber-800 dark:text-amber-300">
                                            API requests are limited to 100 requests per minute. Contact us for higher limits.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'api-reference' && (
                        <div className="max-w-3xl mx-auto space-y-8">
                            {/* Chat Endpoint */}
                            <section className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 flex items-center gap-3">
                                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">POST</span>
                                    <code className="font-mono text-sm text-slate-900 dark:text-white">/api/chat</code>
                                </div>
                                <div className="p-4 space-y-4">
                                    <p className="text-slate-600 dark:text-slate-300">
                                        Send a message to the AI financial consultant and receive expert advice.
                                    </p>
                                    <div>
                                        <h5 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">Request Body</h5>
                                        <CodeBlock language="json">{`{
    "message": "string (required)",
    "history": [
        { "role": "user", "content": "Previous message" },
        { "role": "model", "content": "AI response" }
    ]
}`}</CodeBlock>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">Response</h5>
                                        <CodeBlock language="json">{`{
    "success": true,
    "reply": "Based on your question about financial ratios..."
}`}</CodeBlock>
                                    </div>
                                </div>
                            </section>

                            {/* Analyze Endpoint */}
                            <section className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 flex items-center gap-3">
                                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">POST</span>
                                    <code className="font-mono text-sm text-slate-900 dark:text-white">/api/analyze</code>
                                </div>
                                <div className="p-4 space-y-4">
                                    <p className="text-slate-600 dark:text-slate-300">
                                        Analyze financial data and generate comprehensive reports with charts.
                                    </p>
                                    <div>
                                        <h5 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">Request Body</h5>
                                        <CodeBlock language="json">{`{
    "content": "Revenue: 500000, Expenses: 350000...",
    "type": "csv" | "text" | "json"
}`}</CodeBlock>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">Response</h5>
                                        <CodeBlock language="json">{`{
    "success": true,
    "report": "# Financial Analysis Report\\n\\n## Executive Summary...",
    "chartData": {
        "expenseBreakdown": { "labels": [...], "values": [...] },
        "trendAnalysis": { "labels": [...], "values": [...] }
    }
}`}</CodeBlock>
                                    </div>
                                </div>
                            </section>

                            {/* PDF Endpoint */}
                            <section className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 flex items-center gap-3">
                                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">POST</span>
                                    <code className="font-mono text-sm text-slate-900 dark:text-white">/api/generate-pdf</code>
                                </div>
                                <div className="p-4 space-y-4">
                                    <p className="text-slate-600 dark:text-slate-300">
                                        Generate a branded, watermarked PDF report from HTML content.
                                    </p>
                                    <div>
                                        <h5 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">Request Body</h5>
                                        <CodeBlock language="json">{`{
    "html": "<h1>Report Title</h1><p>Content...</p>",
    "title": "Q4 Financial Report"
}`}</CodeBlock>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">Response</h5>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Returns <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">application/pdf</code> binary data with branded Numbers Consulting styling and watermark.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Health Endpoint */}
                            <section className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 flex items-center gap-3">
                                    <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">GET</span>
                                    <code className="font-mono text-sm text-slate-900 dark:text-white">/health</code>
                                </div>
                                <div className="p-4">
                                    <p className="text-slate-600 dark:text-slate-300 mb-3">
                                        Check API health status.
                                    </p>
                                    <CodeBlock language="json">{`{ "status": "ok", "timestamp": "2026-01-20T06:15:00.000Z" }`}</CodeBlock>
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Need help? Contact <a href="mailto:api@numbersconsulting.com" className="text-sky-600 hover:underline">api@numbersconsulting.com</a>
                        </p>
                        <span className="text-xs text-slate-400">API Version 1.0.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiDocs;
