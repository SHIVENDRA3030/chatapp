
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
                <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center mb-4 shadow-inner-glow animate-float">
                    <MessageSquare className="w-10 h-10 text-primary-400" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">No conversations yet</p>
                <p className="text-xs text-gray-500 mt-1">Search for users to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-2 space-y-1.5">
                {conversations.map((conv, index) => {
                    const otherUser = getOtherParticipant(conv);
                    const isActive = conversationId === conv.id;

                    return (
                        <motion.button
                            key={conv.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => navigate(`/c/${conv.id}`)}
                            className={`w-full p-3 rounded-xl transition-all duration-300 text-left group ${isActive
                                    ? 'bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/40 shadow-glow'
                                    : 'hover:bg-white/5 border border-transparent hover:border-white/10 interactive-lift'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary overflow-hidden relative transition-all duration-300 ${isActive ? 'ring-2 ring-primary shadow-glow-lg' : 'group-hover:ring-2 group-hover:ring-primary/50'
                                        }`}>
                                        {otherUser?.avatar_url ? (
                                            <img
                                                src={otherUser.avatar_url}
                                                alt={otherUser.username}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                                {otherUser?.username?.[0]?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>
                                    {/* Online indicator */}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-dark shadow-lg shadow-green-400/50 animate-pulse-slow"></div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-semibold text-white truncate group-hover:text-primary-300 transition-colors">
                                            {otherUser?.username || 'Unknown User'}
                                        </p>
                                        {conv.lastMessage && (
                                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2 group-hover:text-gray-400 transition-colors">
                                                {formatTime(conv.lastMessage.created_at)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 truncate group-hover:text-gray-300 transition-colors">
                                        {conv.lastMessage ? (
                                            <>
                                                {conv.lastMessage.sender_id === user?.id && <span className="font-medium">You: </span>}
                                                {conv.lastMessage.content}
                                            </>
                                        ) : (
                                            <span className="italic">No messages yet</span>
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
