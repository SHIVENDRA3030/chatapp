import { useState, useRef } from 'react';
import { Send, Smile, Paperclip, X, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
    onSend: (message: string, file?: File, isViewOnce?: boolean) => void;
    disabled?: boolean;
    placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isViewOnce, setIsViewOnce] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() || selectedFile) {
            onSend(message, selectedFile || undefined, isViewOnce);
            setMessage('');
            setSelectedFile(null);
            setIsViewOnce(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-t border-gray-200 dark:border-white/5">
            {selectedFile && (
                <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                            {selectedFile.type.startsWith('image/') ? (
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Paperclip className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-white truncate max-w-[200px]">{selectedFile.name}</span>
                            <span className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedFile.type.startsWith('image/') && (
                            <button
                                type="button"
                                onClick={() => setIsViewOnce(!isViewOnce)}
                                className={`p-2 rounded-full transition-all ${isViewOnce
                                    ? 'bg-primary text-white'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                    }`}
                                title="View Once"
                            >
                                {isViewOnce ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedFile(null);
                                setIsViewOnce(false);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-primary transition-all duration-300 hover:scale-110"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={placeholder || "Type a message..."}
                        disabled={disabled}
                        className="w-full px-4 py-3 bg-dark-lighter/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                <button
                    type="button"
                    disabled={disabled}
                    className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-secondary transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Smile className="w-5 h-5" />
                </button>

                <AnimatePresence>
                    {(message.trim() || selectedFile) && (
                        <motion.button
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            type="submit"
                            disabled={disabled}
                            className="p-3 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary text-white shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </form>
    );
}
