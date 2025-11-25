
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useConversations } from '../hooks/useConversations';
import { useAuth } from '../lib/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';
import { Loader2, MessageSquare } from 'lucide-react';

export default function ConversationList() {
    const { user } = useAuth();
    const { conversations, loading } = useConversations(user?.id);
    const navigate = useNavigate();
    const { conversationId } = useParams();

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        if (isToday(date)) {
            return format(date, 'HH:mm');
        } else if (isYesterday(date)) {
            return 'Yesterday';
        } else {
            return format(date, 'MMM dd');
        }
    };

    const getOtherParticipant = (conv: any) => {
        return conv.participants.find((p: any) => p.id !== user?.id);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3">
                    <MessageSquare className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-sm text-gray-400">No conversations yet</p>
                <p className="text-xs text-gray-500 mt-1">Search for users to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-2 space-y-1">
                {conversations.map((conv) => {
                    const otherUser = getOtherParticipant(conv);
                    const isActive = conversationId === conv.id;

                    return (
                        <motion.button
                            key={conv.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => navigate(`/c/${conv.id}`)}
                            className={`w-full p-3 rounded-lg transition-colors text-left ${isActive
                                ? 'bg-primary/20 border border-primary/30'
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0 overflow-hidden relative">
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
                                    {/* Online indicator - can be enhanced with real presence */}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-light"></div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium text-white truncate">
                                            {otherUser?.username || 'Unknown User'}
                                        </p>
                                        {conv.lastMessage && (
                                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                                {formatTime(conv.lastMessage.created_at)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">
                                        {conv.lastMessage ? (
                                            <>
                                                {conv.lastMessage.sender_id === user?.id && 'You: '}
                                                {conv.lastMessage.content}
                                            </>
                                        ) : (
                                            'No messages yet'
                                        )}
                                    </p>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
