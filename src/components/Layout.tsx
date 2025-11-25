import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { LogOut, MessageSquare, Search } from 'lucide-react';
import ConversationList from './ConversationList';
import UserSearch from './UserSearch';
import Aurora from './Aurora';
import ProfileModal from './ProfileModal';
import { useProfile } from '../hooks/useProfile';

export default function Layout() {
    const { signOut, user } = useAuth();
    const { profile } = useProfile();
    const navigate = useNavigate();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="flex h-screen relative text-white overflow-hidden">
            {/* Aurora Background */}
            <div className="absolute inset-0 z-0">
                <Aurora
                    colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
                    blend={0.5}
                    amplitude={1.0}
                    speed={0.5}
                />
            </div>

            {/* Sidebar */}
            <aside className="w-20 lg:w-80 glass-strong border-r border-white/10 flex flex-col backdrop-blur-xl relative z-10">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary via-accent to-secondary rounded-xl flex items-center justify-center shadow-glow">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold hidden lg:block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                            Chatsy
                        </h1>
                    </div>
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="hidden lg:flex p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-gray-400 hover:text-primary hover:shadow-glow"
                        title="Search users"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Button (Mobile) */}
                <div className="lg:hidden p-4 flex justify-center">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="p-3 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-all duration-300 hover:shadow-glow"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                {/* Conversation List */}
                <ConversationList />

                {/* User Profile & Logout */}
                <div className="p-4 border-t border-white/10 glass">
                    <div
                        onClick={() => setIsProfileOpen(true)}
                        className="flex items-center gap-3 mb-4 hidden lg:flex cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary overflow-hidden border-2 border-primary/50 shadow-glow">
                            <img
                                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email?.split('@')[0]}&background=random`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{profile?.username || user?.email?.split('@')[0]}</p>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow"></div>
                                <p className="text-xs text-gray-400">Online</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all duration-300 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="hidden lg:inline">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative z-10">
                <Outlet />
            </main>

            {/* User Search Modal */}
            <UserSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Profile Modal */}
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </div>
    );
}
