import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import BarChart from './charts/BarChart';
import LineChart from './charts/LineChart';
import PieChart from './charts/PieChart';
import { DownloadIcon } from './icons/DownloadIcon';
import { FileDocxIcon } from './icons/FileDocxIcon';
import { FilePdfIcon } from './icons/FilePdfIcon';

declare const html2pdf: any;
declare const htmlToDocx: any;
declare const marked: any;

const AiMessage: React.FC<{ msg: ChatMessage; index: number }> = ({ msg, index }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const hasReport = msg.content.includes("Financial Report Summary") || msg.chartData;

    const handleDownload = async (format: 'docx' | 'pdf') => {
        setIsMenuOpen(false);
        const reportElement = contentRef.current;
        if (!reportElement) return;

        const date = new Date().toISOString().split('T')[0];
        const fileName = `Financial-Report-${date}`;

        if (format === 'pdf') {
            html2pdf(reportElement, {
                margin: 1,
                filename: `${fileName}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            });
        } else if (format === 'docx') {
             const clonedElement = reportElement.cloneNode(true) as HTMLElement;
        
            const canvases = reportElement.querySelectorAll('canvas');
            const clonedCanvases = clonedElement.querySelectorAll('canvas');

            canvases.forEach((canvas, index) => {
                const image = new Image();
                image.src = canvas.toDataURL('image/png');
                image.style.maxWidth = '100%';
                image.style.height = 'auto';
                
                if(clonedCanvases[index].parentNode) {
                    clonedCanvases[index].parentNode!.replaceChild(image, clonedCanvases[index]);
                }
            });
            
            const blob = await htmlToDocx.asBlob(clonedElement.outerHTML);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };
    
    return (
        <div className={`flex items-start gap-4`}>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-500">
                <BotIcon className="w-5 h-5" />
            </div>
            <div className="relative group max-w-3xl w-full">
                 <div ref={contentRef} className={`p-4 rounded-lg shadow bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200`}>
                    <div 
                        className="prose prose-sm dark:prose-invert max-w-none 
                                   prose-table:w-full prose-table:table-auto prose-table:my-4
                                   prose-thead:bg-slate-200 prose-thead:dark:bg-slate-600
                                   prose-th:p-2 prose-th:text-left prose-th:font-semibold
                                   prose-td:p-2 prose-tr:border-b prose-tr:border-slate-200 prose-tr:dark:border-slate-600
                                   prose-p:my-2 prose-headings:my-3"
                        dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} 
                    />
                     {msg.chartData && (
                        <div className="mt-6 bg-white dark:bg-slate-800 p-4 rounded-md">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                                {msg.chartData.expensePieChart && msg.chartData.expensePieChart.labels.length > 0 && (
                                    <div className="flex flex-col items-center">
                                        <h4 className="font-semibold mb-2 text-center text-sm">Expense Proportions</h4>
                                        <PieChart data={msg.chartData.expensePieChart} />
                                    </div>
                                )}
                                {msg.chartData.expenseBreakdown && msg.chartData.expenseBreakdown.labels.length > 0 && (
                                    <div className="flex flex-col items-center">
                                        <h4 className="font-semibold mb-2 text-center text-sm">Expense Breakdown</h4>
                                        <BarChart data={msg.chartData.expenseBreakdown} />
                                    </div>
                                )}
                            </div>
                            {msg.chartData.trendAnalysis && msg.chartData.trendAnalysis.labels.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-2 text-center text-sm">Trend Analysis</h4>
                                    <LineChart data={msg.chartData.trendAnalysis} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {hasReport && (
                    <div className="absolute top-2 right-2">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-1 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-300 dark:hover:bg-slate-500"
                            aria-label="Download report"
                        >
                            <DownloadIcon className="w-4 h-4" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg z-10 border border-slate-200 dark:border-slate-600">
                                <button onClick={() => handleDownload('docx')} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <FileDocxIcon className="w-4 h-4" />
                                    <span>Save as DOCX</span>
                                </button>
                                <button onClick={() => handleDownload('pdf')} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <FilePdfIcon className="w-4 h-4" />
                                    <span>Save as PDF</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


const ChatBox: React.FC<{ messages: ChatMessage[]; isLoading: boolean }> = ({ messages, isLoading }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-inner p-4 overflow-y-auto">
      <div className="space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && <AiMessage msg={msg} index={index} />}
            
            {msg.sender === 'user' && (
              <>
                <div className={`max-w-xl p-4 rounded-lg shadow bg-sky-500 text-white`}>
                  <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                  <UserIcon className="w-5 h-5" />
                </div>
              </>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-500">
              <BotIcon className="w-5 h-5" />
            </div>
            <div className="max-w-xl p-4 rounded-lg shadow bg-slate-100 dark:bg-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">Analyzing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};

export default ChatBox;