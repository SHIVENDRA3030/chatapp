const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function sendMessageToGroq(messages: AIMessage[]): Promise<string> {
    if (!GROQ_API_KEY) {
        throw new Error('Groq API Key is missing');
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: 'llama-3.1-8b-instant',
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch response from Groq');
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Error calling Groq API:', error);
        throw error;
    }
}
