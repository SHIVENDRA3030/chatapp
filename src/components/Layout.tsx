import { useState } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { LogOut, MessageSquare, Search, Bot } from 'lucide-react';
import ConversationList from './ConversationList';
import UserSearch from './UserSearch';
import Aurora from './Aurora';

import { useProfile } from '../hooks/useProfile';
import TiltedCard from './TiltedCard';
import { AnimatePresence } from 'framer-motion';

export default function Layout() {
    const { signOut, user } = useAuth();
    const { profile } = useProfile();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const { conversationId } = useParams();

    // Mobile view logic
    const isAIChat = location.pathname === '/ai-chat';
    const showSidebar = !conversationId && !isAIChat;
    const showChat = !!conversationId || isAIChat;

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
            <aside className={`${showSidebar ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 glass-strong border-r border-white/10 flex-col backdrop-blur-xl relative z-10 h-full`}>
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary via-accent to-secondary rounded-xl flex items-center justify-center shadow-glow">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                            Chatsy
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/ai-chat')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-gray-400 hover:text-primary hover:shadow-glow relative group"
                            title="AI Assistant"
                        >
                            <Bot className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                        </button>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-gray-400 hover:text-primary hover:shadow-glow"
                            title="Search users"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Conversation List */}
                <ConversationList />

                {/* User Profile & Logout */}
                <div className="p-4 border-t border-white/10 glass mt-auto">
                    <div
                        onClick={() => setIsProfileOpen(true)}
                        className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
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
                        <span className="inline">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`${showChat ? 'flex' : 'hidden'} lg:flex flex-1 relative z-10 flex-col h-full`}>
                <Outlet />
            </main>

            {/* User Search Modal */}
            <UserSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Profile Modal */}
            <AnimatePresence>
                {isProfileOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setIsProfileOpen(false)}
                    >
                        <div onClick={(e) => e.stopPropagation()}>
                            <TiltedCard
                                imageSrc={profile?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email?.split('@')[0]}&background=random`}
                                altText="Profile Card"
                                captionText={profile?.username || user?.email?.split('@')[0]}
                                containerHeight="400px"
                                containerWidth="300px"
                                imageHeight="400px"
                                imageWidth="300px"
                                rotateAmplitude={12}
                                scaleOnHover={1.05}
                                showMobileWarning={false}
                                showTooltip={true}
                                displayOverlayContent={true}
                                overlayContent={
                                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                                        <h3 className="text-2xl font-bold">{profile?.username || 'User'}</h3>
                                        <p className="text-white/80">{user?.email}</p>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
