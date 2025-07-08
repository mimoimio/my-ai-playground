"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { GithubIcon, Menu, MessageCircle } from "lucide-react";

import { Sidebar } from "@/components/Sidebar";

import type { Chat } from "@/types/chat";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import apiService from "@/services/api";
import { useEffect, useState } from "react";

interface HeaderProps {
    chatHistory: Chat[];
    selectedChatId: string | null;
    onChatSelect: (chatId: string) => void;
    onNewChat?: () => void;
    onChatDeleted?: (chatId: string) => void;
    onChatTitleUpdate?: (chatId: string, newTitle: string) => void;
    onModelSelect?: (modelSelection: { name: string, provider: string }) => void; // Optional prop for model selection
    selectedModel?: { name: string, provider: string }; // Optional prop for selected model
}

export function Header({ chatHistory, selectedChatId, onChatSelect, onNewChat, onChatDeleted, onChatTitleUpdate, onModelSelect, selectedModel }: HeaderProps) {
    const [models, setModels] = useState<{ name: string, provider: string }[]>([]);
    function handleSelect(modelSelection: { name: string, provider: string }) {
        onModelSelect?.(modelSelection);
    }

    useEffect(() => {
        async function fetchModels() {
            const models = await apiService.getModels()
            setModels(models);
        }
        fetchModels();

    }, [])


    return (
        <header className="flex items-center justify-between p-4 border-b bg-background/90 backdrop-blur">
            {/* Left side - Mobile menu and title */}
            <div className="flex items-center gap-4">
                {/* Mobile sidebar trigger */}
                <Sheet >
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80 dark">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <Sidebar
                            chatHistory={chatHistory}
                            selectedChatId={selectedChatId}
                            onChatSelect={onChatSelect}
                            onNewChat={onNewChat}
                            onChatDeleted={onChatDeleted}
                            onChatTitleUpdate={onChatTitleUpdate}
                        />
                    </SheetContent>
                </Sheet>

                {/* App title */}
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-semibold hover:bg-linear-90 from-red-700 to-pink-700 hover:animate-pulse transition-all px-4 rounded-full"><Link href={"/"}>MimoAi Chat</Link></h1>
                    <Link
                        href={"https://github.com/mimoimio/yet-another-openai-wrapper"}
                        target="_blank">
                        <GithubIcon className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                    </Link>
                </div>
            </div>



            {/* Right side - User menu */}
            <div className="flex items-center gap-2">
                <DropdownMenu>

                    <DropdownMenuTrigger className="min-w-[100px] max-w-[20dvw] truncate border-b-2 rounded-xl text-start px-4 py-2 hover:animate-pulse hover:shadow-md hover:-translate-y-1 transition-transform">{selectedModel?.name}</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Ai Model</DropdownMenuLabel>
                        <DropdownMenuSeparator />{
                            models.map((modelSelection, index) => (
                                <DropdownMenuItem key={index} onClick={() => { handleSelect(modelSelection) }} className="bg-foreground text-background">
                                    {modelSelection.name}
                                </DropdownMenuItem>
                            ))
                        }
                    </DropdownMenuContent>

                </DropdownMenu>



                {/* <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                </Button>
                <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.jpg" alt="User" />
                    <AvatarFallback>
                        <User className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar> */}
            </div>
        </header>
    );
}
