import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { LogoIcon } from './icons/LogoIcon'; // Reuse existing logo
import { ChatMessage } from '../types'; // Reuse type maybe, or define local

// We need a specific type for the chat history compatible with the API
interface HistoryItem {
    role: 'user' | 'model';
    parts: { text: string }[];
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<HistoryItem[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue;
        setInputValue('');
        setIsLoading(true);

        const newHistory = [
            ...messages,
            { role: 'user' as const, parts: [{ text: userText }] }
        ];
        
        setMessages(newHistory);

        try {
            // We pass the *previous* history to the API, but let's just pass the current state including the new user message?
            // The API implementation I wrote takes history + newMessage. 
            // Better to pass `messages` (which doesn't have the new one yet) and `userText`.
            // Wait, I just updated `newHistory` to include it.
            // Let's call API with `messages` (old) and `userText`.
            // ACTUALLY, my valid implementation of single-turn request takes full `contents`.
            // But `sendChatMessage(history, newMessage)` constructs the array. 
            
            const responseText = await sendChatMessage(messages, userText);
            
            setMessages(prev => [
                ...prev,
                { role: 'model', parts: [{ text: responseText }] }
            ]);
        } catch (error) {
            console.error(error);
             setMessages(prev => [
                ...prev,
                { role: 'model', parts: [{ text: "Sorry, something went wrong. Please try again." }] }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Toggle Button - Enhanced with gradient and glow */}
            <button
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${
                    isOpen 
                    ? 'bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-white backdrop-blur-sm rotate-180 scale-90' 
                    : 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white hover:from-sky-400 hover:to-indigo-500 hover:scale-110 hover:shadow-sky-500/50'
                }`}
                aria-label="Toggle chat"
            >
                {isOpen ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Chat Window - Glassmorphism design */}
            <div
                className={`fixed bottom-24 right-6 w-80 md:w-96 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 transition-all duration-500 origin-bottom-right z-40 flex flex-col overflow-hidden max-h-[calc(100vh-120px)] h-[520px] ${
                    isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'
                }`}
            >
                {/* Header - Gradient with blur */}
                <div className="p-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                            <LogoIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Numbers Assistant</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                <p className="text-xs text-sky-100">Online</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages - Enhanced bubbles */}
                <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50/50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
                    {messages.length === 0 && (
                        <div className="text-center mt-16">
                            <div className="inline-flex p-4 bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/30 dark:to-indigo-900/30 rounded-2xl mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Hi there! 👋</p>
                            <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">How can I help you today?</p>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                    msg.role === 'user'
                                    ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-br-md shadow-lg shadow-sky-500/20'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-100 dark:border-slate-700 rounded-bl-md'
                                }`}
                            >
                                {msg.parts[0].text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start mb-3">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-md px-5 py-3 shadow-md border border-slate-100 dark:border-slate-700">
                                <div className="flex space-x-1.5">
                                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-0"></div>
                                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-150"></div>
                                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-300"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input - Sleeker design */}
                <div className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-2">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-1 resize-none h-11 py-3 px-4 bg-slate-100/80 dark:bg-slate-900/50 border-none rounded-2xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/50 focus:outline-none transition-all"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className="p-3 bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-xl hover:from-sky-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50"
                            aria-label="Send message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatWidget;
