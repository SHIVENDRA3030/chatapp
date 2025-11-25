import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useMessages } from '../hooks/useMessages';
import { getConversationParticipants, type Profile } from '../lib/conversationHelpers';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { MoreVertical, Phone, Video, Loader2, ArrowLeft, FileText, X } from 'lucide-react';
import { sendMessageToGroq } from '../lib/groq';

export default function ChatWindow() {
    const { conversationId } = useParams();
    const { user } = useAuth();
    const { messages, loading, sendMessage } = useMessages(conversationId);
    const [otherUser, setOtherUser] = useState<Profile | null>(null);
    const [loadingParticipants, setLoadingParticipants] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Summarizer State
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    useEffect(() => {
        if (!conversationId) return;

        // Fetch conversation participants
        async function fetchParticipants() {
            setLoadingParticipants(true);
            const { participants } = await getConversationParticipants(conversationId!);
            const other = participants.find(p => p.id !== user?.id);
            setOtherUser(other || null);
            setLoadingParticipants(false);
        }

        fetchParticipants();
    }, [conversationId, user?.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (content: string, file?: File, isViewOnce?: boolean) => {
        if (!user) return;
        await sendMessage(content, user.id, file, isViewOnce);
    };

    const handleSummarize = async () => {
        if (messages.length === 0) return;

        setIsSummarizing(true);
        setSummary(null);
        setShowSummaryModal(true);

        try {
            const conversationText = messages
                .map(m => {
                    const senderName = m.sender_id === user?.id ? 'Me' : (otherUser?.username || 'Other');
                    return `${senderName}: ${m.content}`;
                })
                .join('\n');

            const prompt = `Please provide a concise summary of the following conversation between Me and ${otherUser?.username || 'the other user'}:\n\n${conversationText}`;

            const response = await sendMessageToGroq([
                { role: 'user', content: prompt }
            ]);

            setSummary(response);
        } catch (error) {
            console.error('Failed to summarize:', error);
            setSummary('Failed to generate summary. Please try again.');
        } finally {
            setIsSummarizing(false);
        }
    };

    if (loadingParticipants) {
        return (
            <div className="flex flex-col h-full bg-dark items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-dark relative">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 bg-dark-light/50 backdrop-blur-md flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    {/* Back Button (Mobile Only) */}
                    <button
                        onClick={() => window.history.back()}
                        className="lg:hidden p-2 -ml-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary border border-white/10 relative overflow-hidden">
                        {otherUser?.avatar_url ? (
                            <img
                                src={otherUser.avatar_url}
                                alt={otherUser.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                {otherUser?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{otherUser?.username || 'Unknown User'}</h3>
                        <p className="text-xs text-primary">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <button
                        onClick={handleSummarize}
                        disabled={messages.length === 0 || isSummarizing}
                        className="p-2 hover:text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                        title="Summarize Conversation"
                    >
                        {isSummarizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                    </button>
                    <button className="p-2 hover:text-white hover:bg-white/10 rounded-full transition-colors"><Phone className="w-5 h-5" /></button>
                    <button className="p-2 hover:text-white hover:bg-white/10 rounded-full transition-colors"><Video className="w-5 h-5" /></button>
                    <button className="p-2 hover:text-white hover:bg-white/10 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl">👋</span>
                        </div>
                        <p className="text-lg font-medium">Start the conversation!</p>
                        <p className="text-sm">Send a message to {otherUser?.username}</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isOwn={msg.sender_id === user?.id}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <ChatInput onSend={handleSendMessage} />

            {/* Summary Modal */}
            {showSummaryModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-dark-light border border-white/10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80%] animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Conversation Summary
                            </h3>
                            <button
                                onClick={() => setShowSummaryModal(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {isSummarizing ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-3 text-gray-400">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    <p className="text-sm animate-pulse">Analyzing conversation...</p>
                                </div>
                            ) : (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{summary}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-white/10 bg-white/5 rounded-b-2xl">
                            <button
                                onClick={() => setShowSummaryModal(false)}
                                className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
