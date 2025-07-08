import { AIProvider, OpenAIProvider, MockAIProvider, GroqProvider } from './ai-providers';
import { ChatContextManager } from './context-manager';

// Service container for dependency injection
export class ServiceContainer {
    private static instance: ServiceContainer;
    private aiProvider: AIProvider;
    private contextManager: ChatContextManager;
    private openaiKey = process.env.OPENAI_API_KEY;
    private groqKey = process.env.GROQ_API_KEY;

    private constructor() {
        // Initialize based on environment and available API keys
        this.contextManager = new ChatContextManager();

        const aiProviderType = process.env.AI_PROVIDER || 'mock';

        if (aiProviderType === 'openai' && this.openaiKey) {
            console.log('Using OpenAI provider');
            this.aiProvider = new OpenAIProvider(this.openaiKey);
        } else if (aiProviderType === 'groq' && this.groqKey) {
            console.log('Using Groq provider');
            // Assuming GroqProvider is implemented similarly to OpenAIProvider
            this.aiProvider = new GroqProvider(this.groqKey);
        } else {
            console.log('Using Mock AI provider');
            this.aiProvider = new MockAIProvider();
        }
    }

    static getInstance(): ServiceContainer {
        if (!this.instance) {
            this.instance = new ServiceContainer();
        }
        return this.instance;
    }

    getAIProvider(): AIProvider {
        return this.aiProvider;
    }

    getContextManager(): ChatContextManager {
        return this.contextManager;
    }

    // Method to switch providers (useful for testing)
    setAIProvider(providerName: string): void {
        if (providerName === 'openai' && this.openaiKey) {
            console.log('Using OpenAI provider');
            this.aiProvider = new OpenAIProvider(this.openaiKey);
        } else if (providerName === 'groq' && this.groqKey) {
            console.log('Using Groq provider');
            // Assuming GroqProvider is implemented similarly to OpenAIProvider
            this.aiProvider = new GroqProvider(this.groqKey);
        } else {
            console.log('Using Mock AI provider');
            this.aiProvider = new MockAIProvider();
        }
        console.log('AI provider switched');
    }

    // Method to get provider info
    getProviderInfo(): string {
        return this.aiProvider.constructor.name;
    }
}
