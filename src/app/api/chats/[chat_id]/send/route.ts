import { NextRequest, NextResponse } from 'next/server';
import { pocketbaseService } from '@/services/pocketbase';
import { ServiceContainer } from '@/services/service-container';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ chat_id: string }> }
) {
    try {
        const { content, model } = await request.json();
        // model { name: string, provider: string }
        const { chat_id } = await params;
        const chatId = chat_id;

        // Get services from container
        const container = ServiceContainer.getInstance();
        container.setAIProvider(model.provider)

        const aiProvider = container.getAIProvider();
        const contextManager = container.getContextManager();

        // console.log(`Processing message for chat ${chatId} using ${container.getProviderInfo()}`);

        // Check if this is the first message in the chat (excluding system messages)
        const existingMessages = await pocketbaseService.getMessages(chatId);
        const isFirstUserMessage = existingMessages.filter(m => m.role === 'user').length === 0;

        // Create user message first
        const userMessage = await pocketbaseService.createMessage(chatId, 'user', content);
        if (!userMessage) {
            return NextResponse.json(
                { error: 'Failed to create user message' },
                { status: 500 }
            );
        }

        // Build context with message history (including the new user message)
        const context = await contextManager.buildContext(chatId);

        // Generate AI response and title concurrently if this is the first message
        const promises = [aiProvider.generateResponse(context, model.name)];
        if (isFirstUserMessage) {
            promises.push(aiProvider.generateTitle(content, model.name));
        }

        const results = await Promise.all(promises);
        const aiResponse = results[0];
        const newTitle = results[1]; // Will be undefined if not first message

        // Create AI message
        const aiMessage = await pocketbaseService.createMessage(chatId, 'assistant', aiResponse);
        if (!aiMessage) {
            return NextResponse.json(
                { error: 'Failed to create AI message' },
                { status: 500 }
            );
        }

        // Update chat title if this was the first message
        let updatedChat = null;
        if (newTitle) {
            try {
                updatedChat = await pocketbaseService.updateChat(chatId, newTitle);
                // console.log(`Chat title updated to: ${newTitle}`);
            } catch (error) {
                console.error('Failed to update chat title:', error);
                // Don't fail the request if title update fails
            }
        }

        // console.log(`AI response generated: ${aiResponse.substring(0, 50)}...`);

        // Return both messages and updated chat info
        return NextResponse.json({
            userMessage,
            aiMessage,
            updatedChat
        });
    } catch (error: unknown) {
        console.error('Failed to send message:', error);
        return NextResponse.json(
            { error: 'Failed to send message', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
