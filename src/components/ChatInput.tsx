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
        <form onSubmit={handleSubmit} className="p-4 glass-frosted border-t border-white/10 backdrop-blur-xl shadow-elevation-lg">
            {selectedFile && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-3.5 glass-strong rounded-xl border border-white/10 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
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
                            <span className="text-sm text-white truncate max-w-[200px] font-medium">{selectedFile.name}</span>
                            <span className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedFile.type.startsWith('image/') && (
                            <button
                                type="button"
                                onClick={() => setIsViewOnce(!isViewOnce)}
                                className={`p-2.5 rounded-full transition-all duration-300 hover:scale-110 ${isViewOnce
                                        ? 'bg-gradient-to-br from-primary to-accent text-white shadow-glow'
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
                            className="p-2.5 hover:bg-red-500/20 rounded-full text-gray-400 hover:text-red-400 transition-all duration-300 hover:rotate-90 hover:scale-110"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
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
                    className="p-3 rounded-xl hover:bg-white/10 text-gray-400 hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95 group"
                >
                    <Paperclip className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>

                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={placeholder || "Type a message..."}
                        disabled={disabled}
                        className="w-full px-4 py-3 glass-strong border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                <button
                    type="button"
                    disabled={disabled}
                    className="p-3 rounded-xl hover:bg-white/10 text-gray-400 hover:text-secondary transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <Smile className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>

                <AnimatePresence>
                    {(message.trim() || selectedFile) && (
                        <motion.button
                            initial={{ scale: 0, rotate: -180, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ scale: 0, rotate: 180, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            type="submit"
                            disabled={disabled}
                            className="p-3.5 rounded-xl bg-gradient-to-br from-primary-500 via-accent-500 to-secondary-500 text-white shadow-glow-lg hover:shadow-glow-xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            <Send className="w-5 h-5 relative z-10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </form>
    );
}
