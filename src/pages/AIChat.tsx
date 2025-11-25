import { useRef, useEffect } from 'react';
import { useAIChat } from '../hooks/useAIChat';
import ChatInput from '../components/ChatInput';
import MessageBubble from '../components/MessageBubble';
import { Bot, Trash2, FileText } from 'lucide-react';
import { type Message } from '../hooks/useMessages';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Vortex } from '../components/ui/vortex';

function AIChatContent() {
    const { messages, isLoading, error, sendMessage, clearChat, summarizeChat } = useAIChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Convert AIMessage to the Message type expected by MessageBubble
    const convertToMessage = (msg: { role: string; content: string }, index: number): Message => ({
        id: `ai-${index}`,
        content: msg.content,
        sender_id: msg.role === 'user' ? 'user' : 'ai',
        created_at: new Date().toISOString(),
        conversation_id: 'ai-chat',
        is_view_once: false,
        is_viewed: true
    });

    return (
        <div className="dark flex flex-col h-full bg-gray-900 relative overflow-hidden">
            <Vortex
                backgroundColor="transparent"
                rangeY={800}
                particleCount={500}
                baseHue={260}
                className="flex flex-col h-full w-full"
                containerClassName="absolute inset-0 z-0 bg-gray-900"
            >
                {/* Header */}
                <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md p-4 shadow-sm flex items-center justify-between z-10 border-b border-gray-200/50 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800 dark:text-white">AI Assistant</h2>
                            <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Online (Llama 3)
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearChat}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            title="Clear Chat"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button
                            onClick={summarizeChat}
                            disabled={messages.length === 0 || isLoading}
                            className="p-2 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Summarize Chat"
                        >
                            <FileText size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 custom-scrollbar">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                            <Bot size={64} className="mb-4" />
                            <p>Ask me anything!</p>
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        if (!msg || !msg.content) return null;
                        return (
                            <MessageBubble
                                key={index}
                                message={convertToMessage(msg, index)}
                                isOwn={msg.role === 'user'}
                                senderName={msg.role === 'user' ? 'You' : 'AI Assistant'}
                            />
                        );
                    })}

                    {isLoading && (
                        <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-white dark:bg-black/40 backdrop-blur-md rounded-2xl rounded-tl-none py-3 px-4 shadow-sm border border-gray-100 dark:border-white/5">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex justify-center">
                            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
                                Error: {error}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/80 dark:bg-black/40 backdrop-blur-md border-t border-gray-100 dark:border-white/5 z-10">
                    <ChatInput
                        onSend={sendMessage}
                        disabled={isLoading}
                        placeholder="Message AI..."
                    />
                </div>
            </Vortex>
        </div>
    );
}

export default function AIChat() {
    return (
        <ErrorBoundary>
            <AIChatContent />
        </ErrorBoundary>
    );
}
