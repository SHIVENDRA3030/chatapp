import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useMessages } from '../hooks/useMessages';
import { getConversationParticipants, type Profile } from '../lib/conversationHelpers';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { MoreVertical, Phone, Video, Loader2 } from 'lucide-react';

export default function ChatWindow() {
    const { conversationId } = useParams();
    const { user } = useAuth();
    const { messages, loading, sendMessage } = useMessages(conversationId);
    const [otherUser, setOtherUser] = useState<Profile | null>(null);
    const [loadingParticipants, setLoadingParticipants] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const handleSendMessage = async (content: string) => {
        if (!user) return;
        await sendMessage(content, user.id);
    };

    if (loadingParticipants) {
        return (
            <div className="flex flex-col h-full bg-dark items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-dark">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 bg-dark-light/50 backdrop-blur-md flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
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
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="hover:text-white transition-colors"><Phone className="w-5 h-5" /></button>
                    <button className="hover:text-white transition-colors"><Video className="w-5 h-5" /></button>
                    <button className="hover:text-white transition-colors"><MoreVertical className="w-5 h-5" /></button>
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
                            content={msg.content}
                            isOwn={msg.sender_id === user?.id}
                            timestamp={msg.created_at}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <ChatInput onSendMessage={handleSendMessage} />
        </div>
    );
}
