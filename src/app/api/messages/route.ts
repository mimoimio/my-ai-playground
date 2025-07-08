import { NextRequest, NextResponse } from 'next/server';
import { pocketbaseService } from '@/services/pocketbase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const chatId = searchParams.get('chat_id');

        if (!chatId) {
            return NextResponse.json(
                { error: 'chat_id parameter is required' },
                { status: 400 }
            );
        }

        const messages = await pocketbaseService.getMessages(chatId);
        return NextResponse.json(messages);
    } catch (error: unknown) {
        console.error('Failed to fetch messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    console.log('POST request received for /api/messages');
    try {
        const { chat_id, role, content } = await request.json();
        const message = await pocketbaseService.createMessage(chat_id, role, content);
        return NextResponse.json(message);
    } catch (error: unknown) {
        console.error('Failed to create message:', error);
        return NextResponse.json(
            { error: 'Failed to create message' },
            { status: 500 }
        );
    }
}
