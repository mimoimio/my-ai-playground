"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ChatDisplay } from "@/components/ChatDisplay";
import { Message } from "@/types/chat";
import apiService from "@/services/api";
import { useChatContext } from "@/components/ChatLayout";

export default function ChatPage() {
    const { chat_id } = useParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const { updateChatTitle, selectedModel } = useChatContext();
    // const { refreshChats, updateChatTitle } = useChatContext();
    const loadingRef = useRef(false);

    useEffect(() => {
        if (chat_id) {
            loadMessages();
        }
        // Reset messages when chat changes
        return () => {
            setMessages([]);
        };
    }, [chat_id]);

    const loadMessages = async () => {
        if (!chat_id || typeof chat_id !== 'string') return;

        // Prevent multiple concurrent requests
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        try {
            const fetchedMessages = await apiService.getMessages(chat_id);
            // Only update state if we're still loading the same chat
            if (loadingRef.current) {
                setMessages(fetchedMessages);
            }
        } catch (error) {
            console.error("Failed to load messages:", error);
        } finally {
            if (loadingRef.current) {
                setLoading(false);
            }
            loadingRef.current = false;
        }
    };

    const handleSendMessage = async (content: string, model: { name: string, provider: string }) => {
        if (!chat_id || typeof chat_id !== 'string') return;

        // Send message and get AI response from API
        const result = await apiService.sendMessage(chat_id, content, model);
        if (result) {
            setMessages(prev => [...prev, result.userMessage, result.aiMessage]);

            // Update chat title if this was the first message
            if (result.updatedChat) {
                updateChatTitle(chat_id, result.updatedChat.title);
            }

            // console.log('Message sent and AI responded');
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        const success = await apiService.deleteMessage(messageId);
        if (success) {
            // Remove message from local state immediately
            setMessages(prev => prev.filter(msg => msg.msg_id !== messageId));
        } else {
            alert('Failed to delete message. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-linear-30 from-background/95 to to-foreground/95">
                <div className="animate-spin text-9xl p-4 rounded-full border-4 flex flex-col text-center ">😂<span className="text-lg">loading</span></div>
            </div>
        );
    }

    if (!chat_id) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-lg text-muted-foreground">Select a chat to start messaging</div>
            </div>
        );
    }

    return (
        <ChatDisplay
            messages={messages}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            selectedModel={selectedModel}
        />
    );
}
