import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { FileText, Download, Eye, X, Bomb } from 'lucide-react';
import { type Message, useMessages } from '../hooks/useMessages';

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    senderName?: string;
}

export default function MessageBubble({ message, isOwn, senderName }: MessageBubbleProps) {
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    // Safe usage of useMessages - only if we're in a real conversation
    // For AI chat, we don't need markAsViewed logic from Supabase
    const { markAsViewed } = useMessages(message.conversation_id === 'ai-chat' ? undefined : message.conversation_id);

    const handleViewOnceOpen = () => {
        if (!message.is_viewed) {
            setIsViewerOpen(true);
        }
    };

    const handleViewOnceClose = () => {
        setIsViewerOpen(false);
        if (message.is_view_once && !isOwn && !message.is_viewed && message.conversation_id !== 'ai-chat') {
            markAsViewed(message);
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                }}
                className={clsx(
                    'flex w-full mb-3',
                    isOwn ? 'justify-end' : 'justify-start'
                )}
            >
                <div className={clsx(
                    'max-w-[70%] rounded-2xl px-4 py-3 shadow-elevation-md transition-all duration-300',
                    isOwn
                        ? 'bg-gradient-to-br from-primary-500 via-accent-500 to-secondary-500 text-white shadow-glow-lg hover:shadow-glow-xl'
                        : 'glass-strong text-gray-800 dark:text-gray-100 border border-white/10 hover:border-white/20 interactive-lift'
                )}>
                    {!isOwn && senderName && (
                        <p className="text-xs font-semibold text-primary-400 mb-1.5">{senderName}</p>
                    )}

                    {/* Attachment Rendering */}
                    {message.attachment_url && (
                        <div className="mb-2.5">
                            {message.is_view_once ? (
                                <div className="flex items-center gap-3 bg-black/25 p-3.5 rounded-xl transition-all duration-300 hover:bg-black/30">
                                    <div className={clsx(
                                        "p-2.5 rounded-full transition-all duration-300",
                                        message.is_viewed ? "bg-gray-500/20 text-gray-400" : "bg-primary/30 text-primary-200 shadow-glow"
                                    )}>
                                        {message.is_viewed ? <Bomb className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={clsx("text-sm font-medium", message.is_viewed && "text-gray-400 italic")}>
                                            {message.is_viewed ? 'Photo Expired' : 'View Once Photo'}
                                        </span>
                                        {!message.is_viewed && (
                                            <button
                                                onClick={handleViewOnceOpen}
                                                className="text-xs text-left hover:underline mt-0.5 font-medium"
                                            >
                                                Click to view
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : message.attachment_type === 'image' ? (
                                <img
                                    src={message.attachment_url}
                                    alt="Attachment"
                                    className="rounded-xl max-h-60 object-cover cursor-pointer transition-all duration-300 hover:opacity-90 hover:scale-[1.02] shadow-elevation-sm"
                                    onClick={() => setIsViewerOpen(true)}
                                />
                            ) : (
                                <a
                                    href={message.attachment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 bg-black/20 p-3.5 rounded-xl hover:bg-black/30 transition-all duration-300 interactive-lift"
                                >
                                    <div className="p-2.5 bg-white/10 rounded-lg">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">Attachment</p>
                                        <p className="text-xs opacity-70">Click to download</p>
                                    </div>
                                    <Download className="w-4 h-4 opacity-70" />
                                </a>
                            )}
                        </div>
                    )}

                    {message.content && (
                        <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    )}

                    <p className={clsx(
                        'text-xs mt-2 font-medium',
                        isOwn ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                    )}>
                        {format(new Date(message.created_at), 'HH:mm')}
                    </p>
                </div>
            </motion.div>

            {/* Full Screen Viewer */}
            <AnimatePresence>
                {isViewerOpen && message.attachment_url && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={handleViewOnceClose}
                    >
                        <button
                            onClick={handleViewOnceClose}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            src={message.attachment_url}
                            alt="Full screen"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        {message.is_view_once && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm flex items-center gap-2">
                                <Bomb className="w-4 h-4 text-red-400" />
                                <span>This photo will disappear after you close it</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
