import { NextRequest, NextResponse } from 'next/server';
import { pocketbaseService } from '@/services/pocketbase';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ chat_id: string }> }
) {
    try {
        const { chat_id } = await params;
        await pocketbaseService.deleteChat(chat_id);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Failed to delete chat:', error);
        return NextResponse.json(
            { error: 'Failed to delete chat' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ chat_id: string }> }
) {
    try {
        const { title } = await request.json();
        const { chat_id } = await params;
        const chat = await pocketbaseService.updateChat(chat_id, title);
        return NextResponse.json(chat);
    } catch (error: unknown) {
        console.error('Failed to update chat:', error);
        return NextResponse.json(
            { error: 'Failed to update chat' },
            { status: 500 }
        );
    }
}
