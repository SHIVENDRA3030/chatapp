import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
            <div className="p-4 border-b border-white/10 glass-frosted backdrop-blur-xl flex items-center justify-between z-10 shadow-elevation-sm">
                <div className="flex items-center gap-3">
                    {/* Back Button (Mobile Only) */}
                    <button
                        onClick={() => window.history.back()}
                        className="lg:hidden p-2.5 -ml-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary via-accent to-secondary border border-white/20 relative overflow-hidden shadow-glow">
                            {otherUser?.avatar_url ? (
                                <img
                                    src={otherUser.avatar_url}
                                    alt={otherUser.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                    {otherUser?.username?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-dark shadow-lg shadow-green-400/50 animate-pulse-slow"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{otherUser?.username || 'Unknown User'}</h3>
                        <p className="text-xs text-primary-400 font-medium">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                    <button
                        onClick={handleSummarize}
                        disabled={messages.length === 0 || isSummarizing}
                        className="p-2.5 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 disabled:opacity-50 hover:scale-110 active:scale-95 group"
                        title="Summarize Conversation"
                    >
                        {isSummarizing ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <FileText className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                    </button>
                    <button className="p-2.5 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"><Phone className="w-5 h-5" /></button>
                    <button className="p-2.5 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"><Video className="w-5 h-5" /></button>
                    <button className="p-2.5 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"><MoreVertical className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm text-gray-400 animate-pulse">Loading messages...</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center mb-4 shadow-inner-glow animate-float">
                            <span className="text-5xl">👋</span>
                        </div>
                        <p className="text-lg font-semibold text-white">Start the conversation!</p>
                        <p className="text-sm mt-1">Send a message to {otherUser?.username}</p>
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
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-frosted rounded-3xl shadow-elevation-xl w-full max-w-md flex flex-col max-h-[80%] overflow-hidden border border-white/20"
                    >
                        <div className="p-5 border-b border-white/10 flex items-center justify-between backdrop-blur-md bg-gradient-to-r from-primary/10 to-accent/10">
                            <h3 className="font-display font-bold text-white flex items-center gap-2.5">
                                <FileText className="w-5 h-5 text-primary-400" />
                                Conversation Summary
                            </h3>
                            <button
                                onClick={() => setShowSummaryModal(false)}
                                className="text-gray-400 hover:text-white transition-all duration-300 hover:rotate-90 hover:scale-110"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            {isSummarizing ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4 text-gray-400">
                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                    <p className="text-sm animate-pulse font-medium">Analyzing conversation...</p>
                                </div>
                            ) : (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{summary}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-white/10 bg-gradient-to-t from-white/5 to-transparent backdrop-blur-md">
                            <button
                                onClick={() => setShowSummaryModal(false)}
                                className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl font-semibold transition-all duration-300 shadow-glow hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
