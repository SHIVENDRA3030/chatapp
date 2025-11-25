import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    attachment_url?: string;
    attachment_type?: 'image' | 'file';
    is_view_once?: boolean;
    is_viewed?: boolean;
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
                    event: '*', // Listen to all events (INSERT, UPDATE)
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newMessage = payload.new as Message;
                        setMessages((current) => {
                            if (current.some(msg => msg.id === newMessage.id)) {
                                return current;
                            }
                            return [...current, newMessage];
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedMessage = payload.new as Message;
                        setMessages((current) =>
                            current.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
                        );
                    }
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

    async function uploadAttachment(file: File) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${conversationId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('chat-attachments')
                .getPublicUrl(filePath);

            return { url: data.publicUrl, type: file.type.startsWith('image/') ? 'image' : 'file' };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async function sendMessage(content: string, senderId: string, file?: File, isViewOnce: boolean = false) {
        if (!conversationId) return { error: new Error('No conversation ID') };

        try {
            let attachment_url = null;
            let attachment_type = null;

            if (file) {
                const uploadResult = await uploadAttachment(file);
                attachment_url = uploadResult.url;
                attachment_type = uploadResult.type;
            }

            const { data, error: insertError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: senderId,
                    content,
                    attachment_url,
                    attachment_type,
                    is_view_once: isViewOnce,
                    is_viewed: false
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Optimistically add the message to local state
            if (data) {
                setMessages((current) => [...current, data as Message]);
            }

            return { error: null };
        } catch (err) {
            console.error('Error sending message:', err);
            return { error: err as Error };
        }
    }

    async function markAsViewed(message: Message) {
        try {
            // 1. Update DB to set is_viewed = true
            const { error: updateError } = await supabase
                .from('messages')
                .update({ is_viewed: true })
                .eq('id', message.id);

            if (updateError) throw updateError;

            // 2. If it's a view-once message, delete the file from storage
            if (message.is_view_once && message.attachment_url) {
                // Extract path from URL
                // URL format: .../storage/v1/object/public/chat-attachments/conversationId/filename
                const url = new URL(message.attachment_url);
                const pathParts = url.pathname.split('/chat-attachments/');
                if (pathParts.length > 1) {
                    const filePath = pathParts[1];
                    const { error: deleteError } = await supabase.storage
                        .from('chat-attachments')
                        .remove([filePath]);

                    if (deleteError) console.error('Error deleting view-once file:', deleteError);
                }
            }
        } catch (err) {
            console.error('Error marking message as viewed:', err);
        }
    }

    return { messages, loading, error, sendMessage, markAsViewed, refetch: fetchMessages };
}
