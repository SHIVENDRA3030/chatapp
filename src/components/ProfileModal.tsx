import { useState, useRef } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileCard from './ProfileCard';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../lib/AuthContext';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { profile, updateProfile, uploadAvatar } = useProfile();
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [newAvatarUrl, setNewAvatarUrl] = useState('');
    const [username, setUsername] = useState('');
    const [updating, setUpdating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSaveProfile = async () => {
        if (!username.trim() && !newAvatarUrl.trim()) return;

        setUpdating(true);
        const updates: any = {};
        if (username.trim()) updates.username = username;
        if (newAvatarUrl.trim()) updates.avatar_url = newAvatarUrl;

        const { error } = await updateProfile(updates);
        setUpdating(false);

        if (!error) {
            setIsEditing(false);
            setNewAvatarUrl('');
        } else {
            alert('Failed to save profile: ' + error.message);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUpdating(true);
        // Optimistic update (optional, but we'll wait for upload here)
        const { error } = await uploadAvatar(file);
        setUpdating(false);

        if (!error) {
            setIsEditing(false);
        } else {
            alert('Failed to update profile: ' + error.message);
        }
    };

    const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.username || user?.email?.split('@')[0]}&background=random`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative z-10 w-full max-w-md"
                    >
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="relative group">
                            <ProfileCard
                                name={profile?.username || user?.email?.split('@')[0]}
                                title="Chatsy User"
                                handle={profile?.username || 'user'}
                                status="Online"
                                avatarUrl={avatarUrl}
                                contactText={isEditing ? "Close" : "Edit Profile"}
                                onContactClick={() => {
                                    if (!isEditing) {
                                        setUsername(profile?.username || '');
                                    }
                                    setIsEditing(!isEditing);
                                }}
                                enableTilt={true}
                                showUserInfo={true}
                            />

                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-24 left-6 right-6 p-4 glass-strong rounded-xl border border-white/10 z-20"
                                >
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-2">Username</label>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="Enter username"
                                                className="w-full bg-dark/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-400 mb-2">Upload Photo</label>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={updating}
                                                className="w-full py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm text-white transition-colors flex items-center justify-center gap-2"
                                            >
                                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                                {updating ? 'Uploading...' : 'Choose File'}
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-white/10"></div>
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-dark px-2 text-gray-500">Or use URL</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-400 mb-2">Image URL</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newAvatarUrl}
                                                    onChange={(e) => setNewAvatarUrl(e.target.value)}
                                                    placeholder="https://example.com/photo.jpg"
                                                    className="flex-1 bg-dark/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                                                />
                                                <button
                                                    onClick={handleSaveProfile}
                                                    disabled={updating || (!newAvatarUrl.trim() && !username.trim())}
                                                    className="p-2 bg-primary rounded-lg text-white disabled:opacity-50 hover:bg-primary/80 transition-colors"
                                                >
                                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
