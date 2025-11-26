import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, MessageSquare } from 'lucide-react';
import { searchUsers, getOrCreateDirectConversation, type Profile } from '../lib/conversationHelpers';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserSearch({ isOpen, onClose }: UserSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!query.trim() || !user) {
            setResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setLoading(true);
            const { users } = await searchUsers(query, user.id);
            setResults(users);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, user]);

    const handleStartConversation = async (targetUser: Profile) => {
        if (!user) return;

        setCreating(targetUser.id);
        const { conversationId, error } = await getOrCreateDirectConversation(targetUser.id);

        if (error) {
            console.error('Error creating conversation:', error);
            setCreating(null);
            return;
        }

        setCreating(null);
        onClose();
        navigate(`/c/${conversationId}`);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="bg-dark-light border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Search Users</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="p-4 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by username..."
                                autoFocus
                                className="w-full bg-dark/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder-gray-500"
                            />
                            {loading && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {query.trim() === '' ? (
                            <div className="p-8 text-center text-gray-400">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Start typing to search for users</p>
                            </div>
                        ) : results.length === 0 && !loading ? (
                            <div className="p-8 text-center text-gray-400">
                                <p>No users found matching "{query}"</p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {results.map((profile) => (
                                    <motion.button
                                        key={profile.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => handleStartConversation(profile)}
                                        disabled={creating === profile.id}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left disabled:opacity-50"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0 overflow-hidden">
                                            {profile.avatar_url ? (
                                                <img
                                                    src={profile.avatar_url}
                                                    alt={profile.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                                    {profile.username[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">{profile.username}</p>
                                            <p className="text-sm text-gray-400">Click to start chatting</p>
                                        </div>
                                        {creating === profile.id ? (
                                            <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                                        ) : (
                                            <MessageSquare className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
