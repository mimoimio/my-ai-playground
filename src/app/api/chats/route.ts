import { NextRequest, NextResponse } from 'next/server';
import { pocketbaseService } from '@/services/pocketbase';

export async function GET() {
    try {
        const chats = await pocketbaseService.getChats();
        return NextResponse.json(chats);
    } catch (error: unknown) {
        console.error('Failed to fetch chats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chats' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { title } = await request.json();
        const chat = await pocketbaseService.createChat(title);
        return NextResponse.json(chat);
    } catch (error: unknown) {
        console.error('Failed to create chat:', error);
        return NextResponse.json(
            { error: 'Failed to create chat' },
            { status: 500 }
        );
    }
}
