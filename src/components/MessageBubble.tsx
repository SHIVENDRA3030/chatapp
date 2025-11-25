import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface MessageBubbleProps {
    content: string;
    timestamp: string;
    isOwn: boolean;
    senderName?: string;
}

export default function MessageBubble({ content, timestamp, isOwn, senderName }: MessageBubbleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={clsx(
                'flex w-full mb-3',
                isOwn ? 'justify-end' : 'justify-start'
            )}
        >
            <div className={clsx(
                'max-w-[70%] rounded-2xl px-4 py-3 shadow-lg',
                isOwn
                    ? 'bg-gradient-to-br from-primary via-accent to-secondary text-white shadow-glow'
                    : 'glass-strong text-gray-100'
            )}>
                {!isOwn && senderName && (
                    <p className="text-xs font-semibold text-primary mb-1">{senderName}</p>
                )}
                <p className="text-sm leading-relaxed break-words">{content}</p>
                <p className={clsx(
                    'text-xs mt-1.5',
                    isOwn ? 'text-white/70' : 'text-gray-400'
                )}>
                    {format(new Date(timestamp), 'HH:mm')}
                </p>
            </div>
        </motion.div>
    );
}
