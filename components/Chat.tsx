import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage, generateFinancialReport } from '../services/geminiService';
import { LogoIcon } from './icons/LogoIcon';
import { ChartData } from '../types';
import BarChart from './charts/BarChart';
import PieChart from './charts/PieChart';
import LineChart from './charts/LineChart';
import ApiDocs from './ApiDocs';

declare const XLSX: any;
declare const pdfjsLib: any;
declare const marked: any;

interface ChatMessageItem {
    role: 'user' | 'model';
    content: string;
    chartData?: ChartData;
    isFile?: boolean;
    fileName?: string;
    isReport?: boolean;
}

const PDF_SERVER_URL = 'http://localhost:3001';

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessageItem[]>([
        {
            role: 'model',
            content: "Welcome to Finance Guru. I'm your professional financial analyst. How can I assist you with your financial analysis needs today?"
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState<number | null>(null);
    const [showDocs, setShowDocs] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const downloadPdf = async (content: string, index: number) => {
        setDownloadingPdf(index);
        try {
            // Create a styled container for the PDF
            const container = document.createElement('div');
            container.style.cssText = `
                padding: 40px;
                font-family: 'Segoe UI', system-ui, sans-serif;
                font-size: 11pt;
                line-height: 1.6;
                max-width: 800px;
                background: white;
                color: #1e293b;
            `;
            
            // Add header with branding
            const header = document.createElement('div');
            header.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #6366f1;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">FG</div>
                    <div>
                        <div style="font-size: 18px; font-weight: bold; color: #1e293b;">Finance Guru</div>
                        <div style="font-size: 11px; color: #64748b;">AI Financial Analysis Report</div>
                    </div>
                    <div style="margin-left: auto; font-size: 10px; color: #94a3b8;">Generated: ${new Date().toLocaleDateString()}</div>
                </div>
            `;
            container.appendChild(header);
            
            // Parse and add content
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = marked.parse(content);
            contentDiv.querySelectorAll('h1, h2, h3').forEach((el: any) => {
                el.style.color = '#1e293b';
                el.style.marginTop = '24px';
            });
            contentDiv.querySelectorAll('table').forEach((el: any) => {
                el.style.width = '100%';
                el.style.borderCollapse = 'collapse';
                el.style.marginTop = '16px';
            });
            contentDiv.querySelectorAll('th, td').forEach((el: any) => {
                el.style.border = '1px solid #e2e8f0';
                el.style.padding = '8px 12px';
                el.style.textAlign = 'left';
            });
            contentDiv.querySelectorAll('th').forEach((el: any) => {
                el.style.backgroundColor = '#f1f5f9';
                el.style.fontWeight = '600';
            });
            container.appendChild(contentDiv);
            
            // Temporarily add to DOM for rendering
            document.body.appendChild(container);
            
            // Generate PDF using html2pdf.js
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `Finance_Guru_Report_${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            
            await (window as any).html2pdf().set(opt).from(container).save();
            
            // Cleanup
            document.body.removeChild(container);
        } catch (error) {
            console.error('PDF download error:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloadingPdf(null);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue;
        setInputValue('');
        setIsLoading(true);

        setMessages(prev => [...prev, { role: 'user', content: userText }]);

        try {
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            }));
            
            const responseText = await sendChatMessage(history, userText);
            setMessages(prev => [...prev, { role: 'model', content: responseText }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                content: "I apologize, but I encountered an error. Please try again." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = useCallback(async (file: File) => {
        setIsLoading(true);
        setMessages(prev => [...prev, { 
            role: 'user', 
            content: `Analyzing: ${file.name}`,
            isFile: true,
            fileName: file.name
        }]);

        try {
            let fileContent: string;
            const fileName = file.name.toLowerCase();

            if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                fileContent = XLSX.utils.sheet_to_csv(worksheet);
            } else if (fileName.endsWith('.pdf')) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;
                const data = await file.arrayBuffer();
                const doc = await pdfjsLib.getDocument(data).promise;
                let fullText = '';
                for (let i = 1; i <= doc.numPages; i++) {
                    const page = await doc.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';
                }
                fileContent = fullText;
            } else {
                fileContent = await file.text();
            }

            if (!fileContent.trim()) {
                throw new Error("The uploaded file is empty or could not be read.");
            }

            const result = await generateFinancialReport(fileContent);
            
            setMessages(prev => [...prev, { 
                role: 'model', 
                content: result.reportText,
                chartData: result.chartData,
                isReport: true
            }]);
        } catch (err: any) {
            const errorMessage = err.message || 'An unexpected error occurred while processing the file.';
            setMessages(prev => [...prev, { 
                role: 'model', 
                content: `Error analyzing file: ${errorMessage}` 
            }]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
        e.target.value = '';
    };

    const renderMarkdown = (text: string) => {
        try {
            return { __html: marked.parse(text) };
        } catch {
            return { __html: text };
        }
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                                {msg.role === 'model' && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                            <LogoIcon className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Financial Analyst</span>
                                    </div>
                                )}
                                <div className={`rounded-2xl px-5 py-4 ${
                                    msg.role === 'user'
                                    ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-100 dark:border-slate-700'
                                }`}>
                                    {msg.isFile ? (
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="font-medium">{msg.fileName}</span>
                                        </div>
                                    ) : (
                                        <div 
                                            className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-inherit prose-p:text-inherit"
                                            dangerouslySetInnerHTML={renderMarkdown(msg.content)}
                                        />
                                    )}
                                </div>
                                
                                {/* Charts */}
                                {msg.chartData && (
                                    <div className="mt-4 grid gap-4">
                                        {msg.chartData.expenseBreakdown && (
                                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
                                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Expense Breakdown</h4>
                                                <BarChart data={msg.chartData.expenseBreakdown} />
                                            </div>
                                        )}
                                        {msg.chartData.expensePieChart && (
                                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
                                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Expense Distribution</h4>
                                                <PieChart data={msg.chartData.expensePieChart} />
                                            </div>
                                        )}
                                        {msg.chartData.trendAnalysis && (
                                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-slate-100 dark:border-slate-700">
                                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Trend Analysis</h4>
                                                <LineChart data={msg.chartData.trendAnalysis} />
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Download PDF Button */}
                                {msg.isReport && (
                                    <div className="mt-4">
                                        <button
                                            onClick={() => downloadPdf(msg.content, idx)}
                                            disabled={downloadingPdf === idx}
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 transition-all shadow-md shadow-emerald-500/20"
                                        >
                                            {downloadingPdf === idx ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Generating PDF...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span>Download PDF Report</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl px-5 py-4 shadow-md border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-150"></div>
                                        <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-300"></div>
                                    </div>
                                    <span className="text-sm text-slate-500">Analyzing...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 md:px-6 lg:px-8 py-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl px-4 py-2 border border-slate-200/50 dark:border-slate-700/50">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors"
                            aria-label="Upload file"
                            disabled={isLoading}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={onFileChange}
                            accept=".xlsx,.xls,.csv,.pdf,.txt"
                            className="hidden"
                            title="Upload financial document"
                        />
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about financial analysis, upload statements, or request reports..."
                            className="flex-1 resize-none bg-transparent border-none text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none py-2"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-xl hover:from-sky-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-500/20"
                            aria-label="Send message"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-2">
                        Upload Excel, CSV, or PDF files for detailed financial analysis
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Chat;
