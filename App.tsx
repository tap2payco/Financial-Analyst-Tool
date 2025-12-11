import React, { useState, useCallback } from 'react';
import { ChatMessage } from './types';
import { generateFinancialReport } from './services/geminiService';
import ChatBox from './components/ChatBox';
import UploadBox from './components/UploadBox';
import Simulator from './components/Simulator';
import ChatWidget from './components/ChatWidget';
import { LogoIcon } from './components/icons/LogoIcon';
import { TrashIcon } from './components/icons/TrashIcon';

// These are required for the libraries loaded from the CDN
declare const XLSX: any;
declare const pdfjsLib: any;
declare const Chart: any;
declare const marked: any;
declare const html2pdf: any;
declare const htmlToDocx: any;

const App: React.FC = () => {
  const initialMessage: ChatMessage = {
    sender: 'ai',
    content: 'Welcome to Numbers Consulting! Please upload your Excel, CSV, or PDF financial statement to get started.',
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'simulator'>('chat');

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setMessages(prev => [
        ...prev,
        { sender: 'user', content: `Analyzing file: **${file.name}**` }
    ]);

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
      } else { // CSV, TXT, etc.
        fileContent = await file.text();
      }
      
      if (!fileContent.trim()) {
        throw new Error("The uploaded file is empty or could not be read.");
      }
      
      const result = await generateFinancialReport(fileContent);

      setMessages(prev => [...prev, { 
        sender: 'ai', 
        content: result.reportText,
        chartData: result.chartData 
      }]);

    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred while processing the file.';
      setError(errorMessage);
      setMessages(prev => [...prev, { sender: 'ai', content: `Error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([initialMessage]);
    setError(null);
  }, [initialMessage]);

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center">
          <LogoIcon className="h-8 w-8 text-sky-500" />
          <h1 className="ml-3 text-xl font-bold text-slate-900 dark:text-white">
            Numbers Consulting AI Financial Assistant
          </h1>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={messages.length <= 1 || isLoading}
          aria-label="Clear chat history"
        >
          <TrashIcon className="w-4 h-4" />
          <span>Clear Chat</span>
        </button>
      </header>

      <main className="flex-1 overflow-hidden p-4 md:p-6 lg:p-8">
        <div className="h-full max-w-4xl mx-auto flex flex-col">
            <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                        activeTab === 'chat' 
                        ? 'text-sky-600 dark:text-sky-400' 
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    Report Generator
                    {activeTab === 'chat' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-600 dark:bg-sky-400 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('simulator')}
                    className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                        activeTab === 'simulator' 
                        ? 'text-sky-600 dark:text-sky-400' 
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    Scenario Simulator
                    {activeTab === 'simulator' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-600 dark:bg-sky-400 rounded-t-full" />
                    )}
                </button>
            </div>

          {activeTab === 'chat' ? (
              <>
                <ChatBox messages={messages} isLoading={isLoading} />
                <div className="mt-4">
                    {error && <div className="text-red-500 text-center mb-2 p-2 bg-red-100 dark:bg-red-900/50 rounded-md">{error}</div>}
                    <UploadBox onFileUpload={handleFileUpload} isLoading={isLoading} />
                </div>
              </>
          ) : (
              <div className="h-full overflow-y-auto">
                 <Simulator />
              </div>
          )}
        </div>
      </main>

      <footer className="text-center p-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
        &copy; {new Date().getFullYear()} Numbers Consulting. Simplifying Financial Intelligence.
      </footer>

      <ChatWidget />
    </div>
  );
};

export default App;