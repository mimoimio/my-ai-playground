"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Chat } from "@/types/chat";
import apiService from "@/services/api";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Context for chat data
interface ChatContextType {
    chats: Chat[];
    selectedChatId: string | null;
    selectedModel: { name: string, provider: string }; // Model selection state
    loading: boolean;
    refreshChats: () => Promise<void>;
    createNewChat: () => Promise<void>;
    updateChatTitle: (chatId: string, newTitle: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within ChatProvider');
    }
    return context;
};

interface ChatLayoutProps {
    children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const [selectedModel, setSelectedModel] = useState<{ name: string, provider: string }>({ name: "gpt-4.1", provider: "openai" }); // Default model, can be changed later
    // Extract chat_id from pathname
    const selectedChatId = pathname === "/" ? null : pathname.split("/")[1];

    const refreshChats = async () => {
        setLoading(true);
        try {
            const fetchedChats = await apiService.getChats();
            setChats(fetchedChats);

            // If no chat is selected and we have chats, redirect to first chat
            if (!selectedChatId && fetchedChats.length > 0) {
                router.push(`/${fetchedChats[0].chat_id}`);
            }
        } catch (error) {
            console.error("Failed to load chats:", error);
        } finally {
            setLoading(false);
        }
    };

    const createNewChat = async () => {
        const newChat = await apiService.createChat("New Chat");
        if (newChat) {
            await refreshChats();
            router.push(`/${newChat.chat_id}`);
        }
    };

    const handleChatTitleUpdate = (chatId: string, newTitle: string) => {
        setChats(prevChats =>
            prevChats.map(chat =>
                chat.chat_id === chatId
                    ? { ...chat, title: newTitle }
                    : chat
            )
        );
    };

    const handleChatDelete = (chatId: string) => {
        setChats(prevChats => prevChats.filter(chat => chat.chat_id !== chatId));

        // Only redirect if the currently viewed chat is being deleted
        if (selectedChatId === chatId) {
            // Redirect to first remaining chat or home
            const remainingChats = chats.filter(chat => chat.chat_id !== chatId);
            if (remainingChats.length > 0) {
                router.push(`/${remainingChats[0].chat_id}`);
            } else {
                router.push('/');
            }
        }
    };

    const handleModelSelect = (modelSelection: { name: string, provider: string }) => {
        // Handle model selection logic here
        setSelectedModel(modelSelection)
        // You can also pass this to a context or state if needed
    };

    // useEffect(() => {
    //     refreshChats();
    // }, []);
    useEffect(() => {
        async function fetchChats() {
            setLoading(true);
            try {
                const fetchedChats = await apiService.getChats();
                setChats(fetchedChats);
            } catch (error) {
                console.error("Failed to load chats:", error);
            } finally {
                setLoading(false);
            }
        }
        async function fetchModels() {
            try {
                const models = await apiService.getModels();
                setSelectedModel(models[0]); // Set default model to first available
            } catch (error) {
                console.error("Failed to load models:", error);
            }
        }
        fetchModels();
        fetchChats();
    }, []);

    const handleChatSelect = (chatId: string) => {
        // console.log('Selecting chat:', chatId);
        router.push(`/${chatId}`);
    };

    const contextValue: ChatContextType = {
        chats,
        selectedChatId,
        loading,
        selectedModel,
        refreshChats,
        createNewChat,
        updateChatTitle: handleChatTitleUpdate,
    };

    if (loading) {
        return (
            <div className="h-[100dvh] flex flex-col bg-background dark text-foreground">
                {/* Header Skeleton - matches Header component */}
                <div className="border-b p-4 bg-background/95 backdrop-blur">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-md md:hidden" /> {/* Mobile menu button */}
                            <Skeleton className="h-6 w-40" /> {/* Chat title */}
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-32 rounded-md" /> {/* Model selector */}
                            <Skeleton className="h-8 w-8 rounded-full" /> {/* User avatar */}
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Skeleton - matches Sidebar component */}
                    <aside className="hidden md:flex w-80 border-r overflow-hidden">
                        <div className="flex flex-col h-full w-full bg-background">
                            {/* New Chat Button - matches Button styles */}
                            <div className="p-4">
                                <Skeleton className="h-9 w-full rounded-md" />
                            </div>

                            <Separator />

                            {/* Chat History List - matches ChatHistoryItem */}
                            <div className="flex-1 overflow-y-auto p-2">
                                <div className="space-y-2">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="group relative">
                                            <div className="rounded-lg border bg-card hover:bg-accent/50 transition-colors p-3 cursor-pointer">
                                                <Skeleton className="h-4 w-full mb-2" /> {/* Chat title */}
                                                <Skeleton className="h-3 w-3/4 opacity-70" /> {/* Last message preview */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Footer */}
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-4 w-24" /> {/* Footer text */}
                                <Skeleton className="h-3 w-32 opacity-70" /> {/* Version or info */}
                            </div>
                        </div>
                    </aside>

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
                </div>
            </div>
        );
    }

    return (
        <ChatContext.Provider value={contextValue}>
            <div className="h-[100dvh] flex flex-col dark text-foreground">
                <Header
                    chatHistory={chats}
                    selectedChatId={selectedChatId}
                    onChatSelect={handleChatSelect}
                    onNewChat={createNewChat}
                    onChatDeleted={handleChatDelete}
                    onChatTitleUpdate={handleChatTitleUpdate}
                    onModelSelect={handleModelSelect}
                    selectedModel={selectedModel}
                />
                <div className="flex-1 flex overflow-hidden">
                    <aside className="hidden lg:flex w-80 overflow-hidden">
                        <Sidebar
                            chatHistory={chats}
                            selectedChatId={selectedChatId}
                            onChatSelect={handleChatSelect}
                            onNewChat={createNewChat}
                            onChatDeleted={handleChatDelete}
                            onChatTitleUpdate={handleChatTitleUpdate}
                        />
                    </aside>
                    <main className="flex-1 flex flex-col min-h-0 relative">
                        <Image
                            src="/shroom.png" // Replace with your background image path
                            alt="Background"
                            className="absolute inset-0 object-cover w-full h-full -z-10"
                            layout="fill"
                        />
                        {children}
                    </main>
                </div>
            </div>
        </ChatContext.Provider>
    );
}
