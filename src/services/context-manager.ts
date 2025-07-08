import { pocketbaseService } from './pocketbase';

export class ChatContextManager {
    private readonly MAX_MESSAGES = 10;
    private readonly SYSTEM_MESSAGE = {
        role: 'system',
        content: 'You are a helpful AI assistant. Be concise, friendly, and provide useful information. Keep your responses focused and relevant to the conversation.'
    };

    async buildContext(chatId: string): Promise<Array<{ role: string, content: string }>> {
        try {
            // Get all messages for this chat
            const messages = await pocketbaseService.getMessages(chatId);

            // Take only the last MAX_MESSAGES messages
            const recentMessages = messages.slice(-this.MAX_MESSAGES);

            // Build context array: [system_message, ...recent_messages]
            const context = [
                this.SYSTEM_MESSAGE,
                ...recentMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            ];

            // console.log(`Built context with ${context.length - 1} messages for chat ${chatId}`);
            return context;
        } catch (error) {
            console.error('Error building context:', error);
            // Return just system message if there's an error
            return [this.SYSTEM_MESSAGE];
        }
    }

    // Token counting for more precise context management
    private countTokens(text: string): number {
        // Rough estimation: 1 token ≈ 4 characters
        return Math.ceil(text.length / 4);
    }

    async buildContextWithTokenLimit(chatId: string, maxTokens: number = 4000): Promise<Array<{ role: string, content: string }>> {
        try {
            const messages = await pocketbaseService.getMessages(chatId);
            const context = [this.SYSTEM_MESSAGE];
            let tokenCount = this.countTokens(this.SYSTEM_MESSAGE.content);

            // Add messages from newest to oldest until token limit or message limit
            for (let i = messages.length - 1; i >= 0 && context.length <= this.MAX_MESSAGES + 1; i--) {
                const messageTokens = this.countTokens(messages[i].content);
                if (tokenCount + messageTokens > maxTokens) {
                    console.log(`Token limit reached at ${tokenCount} tokens`);
                    break;
                }

                context.splice(1, 0, {
                    role: messages[i].role,
                    content: messages[i].content
                });
                tokenCount += messageTokens;
            }

            console.log(`Built context with ${context.length - 1} messages, ~${tokenCount} tokens`);
            return context;
        } catch (error) {
            console.error('Error building context with token limit:', error);
            return [this.SYSTEM_MESSAGE];
        }
    }
}
