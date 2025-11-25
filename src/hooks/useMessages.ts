import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

export function useMessages(conversationId: string | undefined) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!conversationId) {
            setLoading(false);
            return;
        }

        // Initial fetch
        fetchMessages();

        // Subscribe to new messages in this conversation
        const subscription = supabase
            .channel(`messages_${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    // Add new message to the list if it doesn't exist
                    const newMessage = payload.new as Message;
                    setMessages((current) => {
                        if (current.some(msg => msg.id === newMessage.id)) {
                            return current;
                        }
                        return [...current, newMessage];
                    });
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [conversationId]);

    async function fetchMessages() {
        if (!conversationId) return;

        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;

            setMessages(data || []);
            setError(null);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    }

    async function sendMessage(content: string, senderId: string) {
        if (!conversationId) return { error: new Error('No conversation ID') };

        try {
            const { data, error: insertError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: senderId,
                    content
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Optimistically add the message to local state
            // This makes it appear immediately for the sender
            if (data) {
                setMessages((current) => [...current, data as Message]);
            }

            return { error: null };
        } catch (err) {
            console.error('Error sending message:', err);
            return { error: err as Error };
        }
    }

    return { messages, loading, error, sendMessage, refetch: fetchMessages };
}
