// Abstract interface for AI providers
export interface AIProvider {
    generateResponse(context: Array<{ role: string, content: string }>, model: string): Promise<string>;
    generateTitle(firstMessage: string, model: string): Promise<string>;
}
const max_tokens = 3000;
// OpenAI implementation
export class OpenAIProvider implements AIProvider {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateResponse(context: Array<{ role: string, content: string }>, model: string): Promise<string> {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: context,
                    max_tokens: max_tokens,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            throw error;
        }
    }

    async generateTitle(firstMessage: string, model: string): Promise<string> {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: 'Generate a short, concise title (maximum 5 words) for a conversation that starts with the following message. Return only the title of the prompted request of the prompted request, no quotes or explanations.'
                        },
                        {
                            role: 'user',
                            content: firstMessage
                        }
                    ],
                    max_tokens: 20,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error generating title with OpenAI:', error);
            // Fallback to truncated message
            return firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage;
        }
    }
}

// Groq implementation
export class GroqProvider implements AIProvider {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateResponse(context: Array<{ role: string, content: string }>, model: string): Promise<string> {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: context,
                    max_tokens: max_tokens,
                })
            });

            if (!response.ok) {
                throw new Error(`GROQ API error: ${response.status}`);
            }

            const data = await response.json();

            // console.log('contexts:', context);
            // check input tokens count
            if (data.usage && data.usage.prompt_tokens) {
                console.warn(`GROQ API prompt tokens: ${data.usage.prompt_tokens}`);
            }


            // check tokens count
            if (data.usage && data.usage.total_tokens) {
                console.warn(`GROQ API response tokens: ${data.usage.total_tokens}`);
            }

            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error calling GROQ API:', error);
            throw error;
        }
    }

    async generateTitle(firstMessage: string, model: string): Promise<string> {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: 'Generate a short, concise title (maximum 5 words) for a conversation that starts with the following message. Return only the title of the prompted request, no quotes or explanations.'
                        },
                        {
                            role: 'user',
                            content: firstMessage
                        }
                    ],
                    max_tokens: 20,
                })
            });

            if (!response.ok) {
                throw new Error(`GROQ API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error generating title with GROQ:', error);
            // Fallback to truncated message
            return firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage;
        }
    }
}

// Mock implementation for development
export class MockAIProvider implements AIProvider {
    private responses = [
        "I understand your question. Let me help you with that...",
        "That's an interesting point. Here's what I think...",
        "Let me break that down for you...",
        "Based on what you've said, I would suggest...",
        "That's a great question! Here's my take on it...",
        "I can help you with that. Let me explain...",
        "Interesting perspective! Here's another way to look at it...",
        "Let me provide you with some insights on that topic...",
    ];

    async generateResponse(context: Array<{ role: string, content: string }>, model: string): Promise<string> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 200));

        // Simple context awareness - respond differently based on recent messages
        const userMessage = context[context.length - 1]?.content.toLowerCase() || '';

        console.log(model)
        if (userMessage.includes('hello') || userMessage.includes('hi')) {
            return "Hello! How can I assist you today?";
        }

        if (userMessage.includes('thank')) {
            return "You're welcome! Is there anything else I can help you with?";
        }

        // Return random response
        const randomIndex = Math.floor(Math.random() * this.responses.length);
        return this.responses[randomIndex];
    }

    async generateTitle(firstMessage: string, model: string): Promise<string> {
        // Simple mock title generation logic
        console.log(model)
        const words = firstMessage.split(' ').slice(0, 5);
        return words.join(' ') + (words.length === 5 ? '...' : '');
    }
}
