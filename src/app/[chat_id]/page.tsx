"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ChatDisplay } from "@/components/ChatDisplay";
import { Message } from "@/types/chat";
import apiService from "@/services/api";
import { useChatContext } from "@/components/ChatLayout";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

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
        return (<>
            {/* Main Chat Area Skeleton - matches ChatDisplay */}
            <main className="flex-1 flex flex-col min-h-0 bg-cover bg-center bg-no-repeat relative">
                <Image
                    src="/shroom.png"
                    alt="Background"
                    className="absolute inset-0 object-cover w-full h-full"
                    fill
                />

                <div className="flex flex-col h-full relative z-10 bg-linear-30 from-background/95 to to-foreground/95">
                    {/* Chat Messages Area - matches ScrollArea and message cards */}
                    <div className="flex-1 min-h-0 overflow-auto">
                        <div className="p-4">
                            <div className="space-y-6 max-w-2xl mx-auto">
                                {/* AI Message Skeleton - matches assistant message */}
                                <div className="flex gap-3 group justify-start">
                                    <Skeleton className="h-8 w-8 rounded-full mt-1" />
                                    <Skeleton className="h-64 w-2/3 rounded-2xl mt-1" />
                                </div>

                                {/* User Message Skeleton - matches user message */}
                                <div className="flex gap-3 group justify-end">
                                    <div className="flex flex-col gap-2 max-w-[80%] items-end">
                                        <div className="relative">
                                            <div className="bg-foreground/90 p-4 rounded-lg ml-12 border">
                                                <Skeleton className="h-4 w-48 mb-1" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Another AI Message Skeleton */}
                                <div className="flex gap-3 group justify-start">
                                    <Skeleton className="h-8 w-8 rounded-full mt-1" />
                                    <Skeleton className="h-64 w-2/3 rounded-2xl mt-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Input Area Skeleton - matches ChatDisplay input */}
                    <div className="p-4 border-t bg-background/95 backdrop-blur">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex gap-2 items-end">
                                <div className="flex-1 relative">
                                    <Skeleton className="h-12 w-full rounded-md" /> {/* Textarea */}
                                </div>
                                <Skeleton className="h-12 w-12 rounded-md" /> {/* Send button */}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <Skeleton className="h-3 w-20" /> {/* Character count */}
                                <Skeleton className="h-3 w-16" /> {/* Model info */}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
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
