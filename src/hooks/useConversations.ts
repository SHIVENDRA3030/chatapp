import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getUserConversations, type ConversationWithDetails } from '../lib/conversationHelpers';

export function useConversations(userId: string | undefined) {
    const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        // Initial fetch
        fetchConversations();

        // Subscribe to new messages to update conversation list
        const messagesSubscription = supabase
            .channel('messages_channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                },
                () => {
                    // Refresh conversations when a new message is received
                    fetchConversations();
                }
            )
            .subscribe();

        // Subscribe to new conversations
        const conversationsSubscription = supabase
            .channel('conversations_channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'conversation_participants',
                    filter: `user_id=eq.${userId}`
                },
                () => {
                    // Refresh conversations when user is added to a new conversation
                    fetchConversations();
                }
            )
            .subscribe();

        return () => {
            messagesSubscription.unsubscribe();
            conversationsSubscription.unsubscribe();
        };
    }, [userId]);

    async function fetchConversations() {
        if (!userId) return;

        setLoading(true);
        const { conversations: data, error: err } = await getUserConversations(userId);

        if (err) {
            setError(err);
        } else {
            setConversations(data);
        }
        setLoading(false);
    }

    return { conversations, loading, error, refetch: fetchConversations };
}
