import { supabase } from './supabase';

export interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
    created_at: string;
}

export interface Conversation {
    id: string;
    created_at: string;
    is_group: boolean;
}

export interface ConversationWithDetails extends Conversation {
    participants: Profile[];
    lastMessage?: {
        content: string;
        created_at: string;
        sender_id: string;
    };
}

/**
 * Get or create a direct conversation between two users
 */
export async function getOrCreateDirectConversation(
    currentUserId: string,
    targetUserId: string
): Promise<{ conversationId: string; error: Error | null }> {
    try {
        // First, check if a conversation already exists between these two users
        const { data: existingConversations, error: fetchError } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', currentUserId);

        if (fetchError) throw fetchError;

        if (existingConversations && existingConversations.length > 0) {
            // Check which of these conversations also includes the target user
            for (const conv of existingConversations) {
                const { data: participants, error: participantError } = await supabase
                    .from('conversation_participants')
                    .select('user_id')
                    .eq('conversation_id', conv.conversation_id);

                if (participantError) continue;

                const userIds = participants?.map(p => p.user_id) || [];

                // If this conversation has exactly 2 participants and includes both users
                if (userIds.length === 2 && userIds.includes(targetUserId)) {
                    return { conversationId: conv.conversation_id, error: null };
                }
            }
        }

        // No existing conversation found, create a new one
        const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert({ is_group: false })
            .select()
            .single();

        if (createError) throw createError;

        // Add both participants
        const { error: participantsError } = await supabase
            .from('conversation_participants')
            .insert([
                { conversation_id: newConversation.id, user_id: currentUserId },
                { conversation_id: newConversation.id, user_id: targetUserId }
            ]);

        if (participantsError) throw participantsError;

        return { conversationId: newConversation.id, error: null };
    } catch (error) {
        console.error('Error in getOrCreateDirectConversation:', error);
        return { conversationId: '', error: error as Error };
    }
}

/**
 * Get all participants for a conversation with their profile details
 */
export async function getConversationParticipants(
    conversationId: string
): Promise<{ participants: Profile[]; error: Error | null }> {
    try {
        // First get user IDs
        const { data: participantData, error: partError } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversationId);

        if (partError) throw partError;

        const userIds = participantData?.map(p => p.user_id) || [];

        if (userIds.length === 0) {
            return { participants: [], error: null };
        }

        // Then get profiles separately
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);

        if (profileError) throw profileError;

        return { participants: profiles || [], error: null };
    } catch (error) {
        console.error('Error fetching conversation participants:', error);
        return { participants: [], error: error as Error };
    }
}

/**
 * Search for users by username
 */
export async function searchUsers(
    query: string,
    currentUserId: string
): Promise<{ users: Profile[]; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', `%${query}%`)
            .neq('id', currentUserId)
            .limit(10);

        if (error) throw error;

        return { users: data || [], error: null };
    } catch (error) {
        console.error('Error searching users:', error);
        return { users: [], error: error as Error };
    }
}

/**
 * Get all conversations for a user with details
 */
export async function getUserConversations(
    userId: string
): Promise<{ conversations: ConversationWithDetails[]; error: Error | null }> {
    try {
        // Get all conversation IDs for this user
        const { data: userConversations, error: convError } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', userId);

        if (convError) throw convError;

        const conversationIds = userConversations?.map(c => c.conversation_id) || [];

        if (conversationIds.length === 0) {
            return { conversations: [], error: null };
        }

        // Get conversation details
        const { data: conversations, error: detailsError } = await supabase
            .from('conversations')
            .select('*')
            .in('id', conversationIds)
            .order('created_at', { ascending: false });

        if (detailsError) throw detailsError;

        // Fetch participants and last message for each conversation
        const conversationsWithDetails = await Promise.all(
            (conversations || []).map(async (conv) => {
                const { participants } = await getConversationParticipants(conv.id);

                // Get last message
                const { data: lastMessageData } = await supabase
                    .from('messages')
                    .select('content, created_at, sender_id')
                    .eq('conversation_id', conv.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                return {
                    ...conv,
                    participants,
                    lastMessage: lastMessageData || undefined
                };
            })
        );

        return { conversations: conversationsWithDetails, error: null };
    } catch (error) {
        console.error('Error fetching user conversations:', error);
        return { conversations: [], error: error as Error };
    }
}
