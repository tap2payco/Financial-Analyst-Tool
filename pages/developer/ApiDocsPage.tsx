import React, { useState } from 'react';
import Layout from '../../components/Layout';
import ApiDocs from '../../components/ApiDocs'; // Reusing component but wrapping in page layout

const ApiDocsPage: React.FC = () => {
    // We modify ApiDocs to be embedded or just use it as is but remove the "modal" feel if needed.
    // For now, let's just reuse the content of ApiDocs but wrapped in Layout
    // Since ApiDocs component was built as a Modal, we might want to refactor it or just re-render similar content here.
    // Let's create a dedicated page view that reuses the logic.
    
    // Simplification: Since ApiDocs was a modal controlled by state, let's just recreate the view for the full page 
    // to match the "Page not popup" requirement perfectly.
    
    const [activeTab, setActiveTab] = useState<'getting-started' | 'api-reference'>('getting-started');
    const CodeBlock = ({ children, language = 'javascript' }: { children: string; language?: string }) => (
        <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm font-mono my-4">
            <code>{children}</code>
        </pre>
    );

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 mb-4">
                        Finance Guru API Documentation
                    </h1>
                    <p className="text-xl text-slate-500">
                        Build powerful financial AI solutions with our easy-to-use API
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                        <button
                            onClick={() => setActiveTab('getting-started')}
                            className={`flex-1 px-6 py-4 font-bold text-center transition-colors border-b-2 ${
                                activeTab === 'getting-started'
                                    ? 'text-indigo-600 border-indigo-600 bg-white dark:bg-slate-800'
                                    : 'text-slate-500 border-transparent hover:text-slate-700'
                            }`}
                        >
                            🚀 Getting Started
                        </button>
                        <button
                            onClick={() => setActiveTab('api-reference')}
                            className={`flex-1 px-6 py-4 font-bold text-center transition-colors border-b-2 ${
                                activeTab === 'api-reference'
                                    ? 'text-indigo-600 border-indigo-600 bg-white dark:bg-slate-800'
                                    : 'text-slate-500 border-transparent hover:text-slate-700'
                            }`}
                        >
                            📖 API Reference
                        </button>
                    </div>

                    <div className="p-8 md:p-12">
                         {activeTab === 'getting-started' && (
                        <div className="max-w-3xl mx-auto space-y-10">
                            <section>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                    Introduction
                                </h3>
                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                    Integrate Finance Guru's powerful AI-driven financial analysis into your own applications. 
                                    Our API enables you to create chat interfaces, perform deep financial document analysis, and generate branded PDF reports programmatically.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                    Quick Start Guide
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center font-bold text-lg">1</div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Create an Account</h4>
                                            <p className="text-slate-600 dark:text-slate-400">
                                                Register for a <a href="/register" className="text-indigo-600 underline">Developer Account</a> to get access to the dashboard.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center font-bold text-lg">2</div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Request API Key</h4>
                                            <p className="text-slate-600 dark:text-slate-400">
                                                Go to your <a href="/developer" className="text-indigo-600 underline">Developer Console</a> and request a new API Key. 
                                                New keys require Admin approval for security.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center font-bold text-lg">3</div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Start Building</h4>
                                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                                Once approved, use your key to authenticate requests.
                                            </p>
                                            <CodeBlock>{`const response = await fetch('https://api.financeguru.com/api/chat', {
  headers: {
    'Authorization': 'Bearer fg_your_api_key_here',
    'Content-Type': 'application/json'
  },
  // ...
});`}</CodeBlock>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'api-reference' && (
                        <div className="max-w-3xl mx-auto space-y-12">
                             {/* Chat Endpoint */}
                             <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-green-500/30">POST</span>
                                    <code className="text-xl font-mono font-bold text-slate-900 dark:text-white">/api/chat</code>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mb-6">
                                    Send a message to the AI financial consultant. Supports conversation history for context.
                                </p>
                                
                                <h5 className="font-bold text-slate-900 dark:text-white mb-2">Request Body</h5>
                                <CodeBlock language="json">{`{
  "message": "What is the EBITDA margin?",
  "history": [
    { "role": "user", "content": "Analyzing Q3 report..." },
    { "role": "model", "content": "Revenue was $5M..." }
  ]
}`}</CodeBlock>

                                <h5 className="font-bold text-slate-900 dark:text-white mb-2 mt-6">Response</h5>
                                <CodeBlock language="json">{`{
  "success": true,
  "reply": "The EBITDA margin is 25%, calculated by..."
}`}</CodeBlock>
                            </section>

                            <hr className="border-slate-100 dark:border-slate-700" />

                            {/* Analyze Endpoint */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-green-500/30">POST</span>
                                    <code className="text-xl font-mono font-bold text-slate-900 dark:text-white">/api/analyze</code>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mb-6">
                                    Analyze raw financial data (CSV/Text) and generate a Markdown report + chart data.
                                </p>
                                
                                <h5 className="font-bold text-slate-900 dark:text-white mb-2">Request Body</h5>
                                <CodeBlock language="json">{`{
  "content": "Revenue,Cost\\n100,50\\n200,80",
  "type": "csv"
}`}</CodeBlock>

                                <h5 className="font-bold text-slate-900 dark:text-white mb-2 mt-6">Response</h5>
                                <CodeBlock language="json">{`{
  "success": true,
  "report": "# Analysis Report\\n\\nBased on the data...",
  "chartData": { ... }
}`}</CodeBlock>
                            </section>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ApiDocsPage;
