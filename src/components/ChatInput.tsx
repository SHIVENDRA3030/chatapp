import { useState } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
    onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSend(message);
            setMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 glass-strong border-t border-white/10">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-primary transition-all duration-300 hover:scale-110"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full px-4 py-3 bg-dark-lighter/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:shadow-glow transition-all duration-300"
                    />
                </div>

                <button
                    type="button"
                    className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-secondary transition-all duration-300 hover:scale-110"
                >
                    <Smile className="w-5 h-5" />
                </button>

                <AnimatePresence>
                    {message.trim() && (
                        <motion.button
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            type="submit"
                            className="p-3 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary text-white shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-105"
                        >
                            <Send className="w-5 h-5" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </form>
    );
}
