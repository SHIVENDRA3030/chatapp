import { useState, useEffect, useCallback } from 'react';
import { sendMessageToGroq, type AIMessage } from '../lib/groq';

const STORAGE_KEY = 'chatsy_ai_chat_history';

export function useAIChat() {
    const [messages, setMessages] = useState<AIMessage[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to parse chat history', e);
            return [];
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch (e) {
            console.error('Failed to save chat history', e);
            // Optional: Handle quota exceeded error specifically if needed
        }
    }, [messages]);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        const userMessage: AIMessage = { role: 'user', content };

        // Optimistically add user message
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            // Prepare context (last 10 messages to keep context window manageable)
            const contextMessages = [...messages, userMessage].slice(-10);

            const aiResponseContent = await sendMessageToGroq(contextMessages);

            const aiMessage: AIMessage = { role: 'assistant', content: aiResponseContent };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            setError((err as Error).message);
            // Optionally remove the user message if it failed, but usually better to keep it and show error
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    const clearChat = useCallback(() => {
        setMessages([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const summarizeChat = useCallback(async () => {
        if (messages.length === 0) return;

        setIsLoading(true);
        setError(null);

        try {
            // Create a context string from the messages
            const conversationText = messages
                .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
                .join('\n');

            const prompt = `Please provide a concise summary of the following conversation:\n\n${conversationText}`;

            // Send as a single prompt to get the summary
            // We don't necessarily need the whole history context for this specific request, 
            // but keeping it consistent with the API is fine. 
            // Actually, for summarization, we just want to send the prompt.
            // But sendMessageToGroq expects an array.
            const summaryResponse = await sendMessageToGroq([
                { role: 'user', content: prompt }
            ]);

            const summaryMessage: AIMessage = {
                role: 'assistant',
                content: `📝 **Chat Summary**:\n\n${summaryResponse}`
            };

            setMessages(prev => [...prev, summaryMessage]);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearChat,
        summarizeChat
    };
}
