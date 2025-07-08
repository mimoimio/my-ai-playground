"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { Chat } from "@/types/chat";
import apiService from "@/services/api";

interface ChatHistoryItemProps {
    chat: Chat;
    isSelected?: boolean;
    onSelect?: (chatId: string) => void;
    onDelete?: (chatId: string) => void;
    onChatTitleUpdate?: (chatId: string, newTitle: string) => void; // Local state update for title changes
    onChatDeleted?: (chatId: string) => void; // Local state update for deletion
}

export function ChatHistoryItem({ chat, isSelected, onSelect, onDelete, onChatDeleted, onChatTitleUpdate }: ChatHistoryItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(chat.title);
    const [isLoading, setIsLoading] = useState(false);

    const handleSelect = () => {
        if (!isEditing) {
            onSelect?.(chat.chat_id);
        }
    };

    const handleEditStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditTitle(chat.title);
    };

    const handleEditSave = async (e?: React.MouseEvent) => {
        e?.stopPropagation();

        if (editTitle.trim() === chat.title.trim()) {
            setIsEditing(false);
            return;
        }

        if (!editTitle.trim()) {
            alert('Title cannot be empty');
            return;
        }

        setIsLoading(true);
        try {
            const success = await apiService.updateChat(chat.chat_id, editTitle.trim());
            if (success) {
                // console.log('Chat title updated successfully');
                setIsEditing(false);
                // Update local state immediately without refreshing
                onChatTitleUpdate?.(chat.chat_id, editTitle.trim());
            } else {
                alert('Failed to update chat title. Please try again.');
            }
        } catch (error) {
            console.error('Error updating chat title:', error);
            alert('An error occurred while updating the chat title.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditCancel = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsEditing(false);
        setEditTitle(chat.title);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleEditSave();
        } else if (e.key === 'Escape') {
            handleEditCancel();
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // Confirm deletion
        if (!confirm(`Are you sure you want to delete "${chat.title}"?`)) {
            return;
        }

        try {
            const success = await apiService.deleteChat(chat.chat_id);
            if (success) {
                // console.log('Chat deleted successfully');
                // Call the legacy onDelete callback if provided
                onDelete?.(chat.chat_id);
                // Update local state immediately without refreshing
                onChatDeleted?.(chat.chat_id);
            } else {
                alert('Failed to delete chat. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
            alert('An error occurred while deleting the chat.');
        }
    };

    return (
        <Card
            className={"p-3 cursor-pointer hover:bg-pink-600 transition-all group hover:-translate-0.5  " + (isSelected ? " bg-pink-500" : "")}
            onClick={handleSelect}
        >
            <div className="flex items-start justify-between ">
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="space-y-2">
                            <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={handleKeyPress}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm font-medium h-8"
                                disabled={isLoading}
                                autoFocus
                            />
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{chat.created ? new Date(chat.created).toLocaleDateString() : "Today"}</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-sm font-medium truncate mb-1 w-[200px]">
                                {chat.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground ">
                                <span>{chat.created ? new Date(chat.created).toLocaleDateString() : "Today"}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {isEditing ? (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={handleEditSave}
                                disabled={isLoading}
                            >
                                <Check className="h-3 w-3 text-green-600" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={handleEditCancel}
                                disabled={isLoading}
                            >
                                <X className="h-3 w-3 text-red-600" />
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* opacity-0 group-hover:opacity-100  */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 transition-opacity"
                                onClick={handleEditStart}
                            >
                                <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 transition-opacity"
                                onClick={handleDelete}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
}
