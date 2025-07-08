import { NextRequest, NextResponse } from 'next/server';
import { pocketbaseService } from '@/services/pocketbase';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ msg_id: string }> }
) {
    try {
        const { msg_id } = await params;
        await pocketbaseService.deleteMessage(msg_id);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Failed to delete message:', error);
        return NextResponse.json(
            { error: 'Failed to delete message' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ msg_id: string }> }
) {
    try {
        const { content } = await request.json();
        const { msg_id } = await params;
        const message = await pocketbaseService.updateMessage(msg_id, content);
        return NextResponse.json(message);
    } catch (error: unknown) {
        console.error('Failed to update message:', error);
        return NextResponse.json(
            { error: 'Failed to update message' },
            { status: 500 }
        );
    }
}
