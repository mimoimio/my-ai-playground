import PocketBase, { RecordSubscription } from 'pocketbase';
import { Chat, Message } from '@/types/chat';

// Type for PocketBase errors
interface PocketBaseError {
    status?: number;
    isAbort?: boolean;
    code?: number;
    originalError?: { name?: string };
}

// Type for PocketBase record structures
interface PocketBaseMessage {
    id: string;
    chat_id: string;
    role: string;
    content: string;
    created: string;
    updated: string;
}

interface PocketBaseChat {
    id: string;
    title: string;
    created: string;
    updated: string;
}

// Type guard for PocketBase errors
function isPocketBaseError(error: unknown): error is PocketBaseError {
    return error !== null && typeof error === 'object';
}

class PocketBaseService {
    private pb: PocketBase;
    private isAuthenticated = false;

    constructor() {
        this.pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://mimoi-game.pockethost.io');
        console.log('PocketBase initialized 🥴');
    }

    // Authentication with retry logic
    async authenticate(retryCount = 0): Promise<boolean> {
        if (this.isAuthenticated) return true;

        const maxRetries = 3;
        const retryDelay = 200; // 1 second

        try {
            await this.pb.collection('_superusers').authWithPassword(
                process.env.POCKETBASE_EMAIL || 'jafflewaffle@gmail.com',
                process.env.POCKETBASE_PASSWORD || 'thisisnotmyrealpassword'
            );
            this.isAuthenticated = true;
            // console.log('PocketBase authenticated:', authData);
            return true;
        } catch (error: unknown) {
            console.error(`PocketBase authentication failed (attempt ${retryCount + 1}):`, error);

            // Check if it's the auto-cancellation error
            if (isPocketBaseError(error) && error.status === 0 && retryCount < maxRetries) {
                // console.log(`Retrying authentication in ${retryDelay}ms... (${retryCount + 1}/${maxRetries})`);

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, retryDelay));

                // Retry authentication
                return this.authenticate(retryCount + 1);
            }

            return false;
        }
    }

    // Chat methods
    async getChats(): Promise<Chat[]> {
        await this.authenticate();
        try {
            const records = await this.pb.collection('chats').getFullList({
                sort: '-created',
            });
            return records.map(record => ({
                chat_id: record.id,
                title: record.title,
                created: record.created,
                updated: record.updated,
            }));
        } catch (error: unknown) {
            // Check if this is an auto-cancellation error
            if (isPocketBaseError(error) &&
                (error.isAbort || error.code === 20 || error.originalError?.name === 'AbortError')) {
                // This is an auto-cancellation, which is expected behavior
                // console.log('Request was auto-cancelled (this is normal when navigating quickly)');
                return [];
            }
            console.error('Error fetching chats:', error);
            return [];
        }
    }

    async getChat(chatId: string): Promise<Chat | null> {
        await this.authenticate();
        try {
            const record = await this.pb.collection('chats').getOne(chatId);
            return {
                chat_id: record.id,
                title: record.title,
                created: record.created,
                updated: record.updated,
            };
        } catch (error) {
            console.error('Error fetching chat:', error);
            return null;
        }
    }

    async createChat(title: string): Promise<Chat | null> {
        await this.authenticate();
        try {
            const record = await this.pb.collection('chats').create({
                title,
            });
            return {
                chat_id: record.id,
                title: record.title,
                created: record.created,
                updated: record.updated,
            };
        } catch (error) {
            console.error('Error creating chat:', error);
            return null;
        }
    }

    async updateChat(chatId: string, title: string): Promise<Chat | null> {
        await this.authenticate();
        try {
            const record = await this.pb.collection('chats').update(chatId, {
                title,
            });
            return {
                chat_id: record.id,
                title: record.title,
                created: record.created,
                updated: record.updated,
            };
        } catch (error) {
            console.error('Error updating chat:', error);
            return null;
        }
    }

    async deleteChat(chatId: string): Promise<boolean> {
        await this.authenticate();
        try {
            // First, delete all messages associated with this chat
            const messages = await this.pb.collection('messages').getFullList({
                filter: `chat_id = "${chatId}"`,
            });

            // Delete each message
            for (const message of messages) {
                await this.pb.collection('messages').delete(message.id);
            }

            // Then delete the chat itself
            await this.pb.collection('chats').delete(chatId);
            // console.log(`Chat ${chatId} and ${messages.length} associated messages deleted`);
            return true;
        } catch (error) {
            console.error('Error deleting chat:', error);
            return false;
        }
    }

    // Message methods
    async getMessages(chatId: string): Promise<Message[]> {
        await this.authenticate();
        try {
            const records = await this.pb.collection('messages').getFullList({
                filter: `chat_id = "${chatId}"`,
                sort: 'created',
            });
            return records.map(record => ({
                msg_id: record.id,
                chat_id: record.chat_id,
                role: record.role,
                content: record.content,
                created: record.created,
                updated: record.updated,
            }));
        } catch (error: unknown) {
            // Check if this is an auto-cancellation error
            if (isPocketBaseError(error) &&
                (error.isAbort || error.code === 20 || error.originalError?.name === 'AbortError')) {
                // This is an auto-cancellation, which is expected behavior
                // console.log('Request was auto-cancelled (this is normal when navigating quickly)');
                return [];
            }
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    async createMessage(chatId: string, role: 'user' | 'assistant' | 'system', content: string): Promise<Message | null> {
        await this.authenticate();
        try {
            const record = await this.pb.collection('messages').create({
                chat_id: chatId,
                role,
                content,
            });
            // console.log('Message created 💌:', record.id, record.content);
            return {
                msg_id: record.id,
                chat_id: record.chat_id,
                role: record.role,
                content: record.content,
                created: record.created,
                updated: record.updated,
            };

        } catch (error) {
            console.error('Error creating message:', error);
            return null;
        }
    }

    async updateMessage(messageId: string, content: string): Promise<Message | null> {
        await this.authenticate();
        try {
            const record = await this.pb.collection('messages').update(messageId, {
                content,
            });
            return {
                msg_id: record.id,
                chat_id: record.chat_id,
                role: record.role,
                content: record.content,
                created: record.created,
                updated: record.updated,
            };
        } catch (error) {
            console.error('Error updating message:', error);
            return null;
        }
    }

    async deleteMessage(messageId: string): Promise<boolean> {
        await this.authenticate();
        try {
            await this.pb.collection('messages').delete(messageId);
            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            return false;
        }
    }

    // Get recent messages for context building
    async getRecentMessages(chatId: string, limit: number = 5): Promise<Message[]> {
        await this.authenticate();
        try {
            const records = await this.pb.collection('messages').getList(1, limit, {
                filter: `chat_id = "${chatId}"`,
                sort: '-created', // Most recent first
            });

            // Return in chronological order (oldest first)
            return records.items.reverse().map(record => ({
                msg_id: record.id,
                chat_id: record.chat_id,
                role: record.role,
                content: record.content,
                created: record.created,
                updated: record.updated,
            }));
        } catch (error) {
            console.error('Error fetching recent messages:', error);
            return [];
        }
    }

    // Real-time subscriptions
    async subscribeToChat(chatId: string, callback: (data: RecordSubscription<PocketBaseMessage>) => void) {
        await this.authenticate();
        return this.pb.collection('messages').subscribe(`chat_id = "${chatId}"`, callback);
    }

    async subscribeToChats(callback: (data: RecordSubscription<PocketBaseChat>) => void) {
        await this.authenticate();
        return this.pb.collection('chats').subscribe('*', callback);
    }

    unsubscribe(subscription?: string) {
        if (subscription) {
            this.pb.collection('messages').unsubscribe(subscription);
        }
    }
}

// Export singleton instance
export const pocketbaseService = new PocketBaseService();
export default pocketbaseService;
