"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Bot, History } from "lucide-react";
import { ChatHistoryItem } from "@/components/ChatHistoryItem";
import { Chat } from "@/types/chat";

interface SidebarProps {
    chatHistory: Chat[];
    selectedChatId: string | null;
    onChatSelect: (chatId: string) => void;
    onNewChat?: () => void;
    onChatDeleted?: (chatId: string) => void;
    onChatTitleUpdate?: (chatId: string, newTitle: string) => void;
}

export function Sidebar({ chatHistory, selectedChatId, onChatSelect, onNewChat, onChatDeleted, onChatTitleUpdate }: SidebarProps) {
    return (
        <div className="flex flex-col h-full w-full bg-background">
            {/* Header */}
            <div className="p-4">
                <Button
                    className="w-full justify-start gap-2"
                    size="sm"
                    onClick={onNewChat}
                >
                    <Plus className="h-4 w-4" />
                    New Chat
                </Button>
            </div>

            <Separator />

            {/* Chat History */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="p-4 pb-2">
                    <div className="flex items-center gap-2 mb-3">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Recent Chats</span>
                    </div>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="px-4 pb-4">
                        <div className="space-y-2">
                            {chatHistory.length > 0 ? (
                                chatHistory.map((chat) => (
                                    <ChatHistoryItem
                                        key={chat.chat_id}
                                        chat={chat}
                                        isSelected={selectedChatId === chat.chat_id}
                                        onSelect={onChatSelect}
                                        onDelete={() => { }}
                                        onChatDeleted={onChatDeleted}
                                        onChatTitleUpdate={onChatTitleUpdate}
                                    />
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground text-sm py-8">
                                    No chat history yet
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </div>

            <Separator />

            {/* Footer */}
            <div className="p-4 space-y-2">
                {/* <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    size="sm"
                    onClick={() => { }}
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Button> */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Bot className="h-3 w-3" />
                    <span>🥴😭🥳😂✌️😾</span>
                </div>
            </div>
        </div>
    );
}
