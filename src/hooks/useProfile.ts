import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
    created_at: string;
}

export function useProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        async function fetchProfile() {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user!.id)
                    .single();

                if (error) throw error;
                setProfile(data);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [user]);

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            setProfile((prev) => prev ? { ...prev, ...updates } : null);
            return { error: null };
        } catch (err) {
            console.error('Error updating profile:', err);
            return { error: err as Error };
        }
    };

    const uploadAvatar = async (file: File) => {
        if (!user) return { error: new Error('No user') };

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            // Update profile with new URL
            const { error: updateError } = await updateProfile({ avatar_url: data.publicUrl });
            if (updateError) throw updateError;

            return { data: data.publicUrl, error: null };
        } catch (error) {
            console.error('Error uploading avatar:', error);
            return { error: error as Error };
        }
    };

    return { profile, loading, error, updateProfile, uploadAvatar };
}
