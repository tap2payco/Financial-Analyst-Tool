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
            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
                    isOpen 
                    ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white rotate-90' 
                    : 'bg-sky-600 text-white hover:bg-sky-700 hover:scale-105'
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

            {/* Chat Window */}
            <div
                className={`fixed bottom-24 right-6 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 origin-bottom-right z-40 flex flex-col overflow-hidden max-h-[calc(100vh-120px)] h-[500px] ${
                    isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'
                }`}
            >
                {/* Header */}
                <div className="p-4 bg-sky-600 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1 bg-white/20 rounded-lg">
                            <LogoIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Numbers Assistant</h3>
                            <p className="text-xs text-sky-100">Online</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-500 dark:text-slate-400 mt-10 text-sm">
                            <p>👋 Hi! How can I help you today?</p>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                                    msg.role === 'user'
                                    ? 'bg-sky-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-600 rounded-bl-none'
                                }`}
                            >
                                {msg.parts[0].text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-600">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-0"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-1 resize-none h-10 py-2 px-3 bg-slate-100 dark:bg-slate-900 border-none rounded-full text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className="p-2 bg-sky-600 text-white rounded-full hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Send message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
