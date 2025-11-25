import React from 'react';
import TiltedCard from './TiltedCard';

interface ProfileCardProps {
    avatarUrl: string;
    name?: string;
    title?: string;
    handle?: string;
    status?: string;
    contactText?: string;
    showUserInfo?: boolean;
    onContactClick?: () => void;
    // Legacy props to prevent errors
    iconUrl?: string;
    grainUrl?: string;
    innerGradient?: string;
    behindGlowEnabled?: boolean;
    behindGlowColor?: string;
    behindGlowSize?: string;
    className?: string;
    enableTilt?: boolean;
    enableMobileTilt?: boolean;
    mobileTiltSensitivity?: number;
    miniAvatarUrl?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
    avatarUrl,
    name = 'User',
    handle = 'user',
    contactText = 'Contact',
    showUserInfo = true,
    onContactClick
}) => {
    return (
        <div className="w-full flex items-center justify-center py-4">
            <TiltedCard
                imageSrc={avatarUrl}
                altText={name}
                captionText={name}
                containerHeight="400px"
                containerWidth="300px"
                imageHeight="400px"
                imageWidth="300px"
                rotateAmplitude={12}
                scaleOnHover={1.05}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={showUserInfo}
                overlayContent={
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-3 rounded-b-[15px]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-white text-lg leading-tight">{name}</h3>
                                <p className="text-sm text-gray-300 font-medium">@{handle}</p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card tilt interference if needed
                                onContactClick?.();
                            }}
                            className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-sm font-semibold text-white transition-all border border-white/10 hover:border-white/30 shadow-lg active:scale-95"
                        >
                            {contactText}
                        </button>
                    </div>
                }
            />
        </div>
    );
};

export default ProfileCard;
