"use client";

import { useChatContext } from "@/components/ChatLayout";
import { Button } from "@/components/ui/button";
import { GithubIcon, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { createNewChat } = useChatContext();

  return (
    <div className="flex-1 flex items-center justify-center bg-linear-30 from-background/95 to to-foreground/95">
      <div className="text-center max-w-md">
        <MessageCircle className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
        <h1 className="text-3xl font-semibold mb-4">Welcome to MimoAi Chat</h1>
        <p className="text-muted-foreground mb-8">
          {"Skibidi Gyatt Rizzler Gurt: Sybau "}
        </p>
        <div className="flex gap-4 justify-center items-center">
          <Button onClick={createNewChat} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Start New Chat
          </Button>
          <Link
            className="rounded-full bg-background/90 flex items-center justify-center p-4 hover:bg-background/80 transition-colors"
            href={"https://github.com/mimoimio/yet-another-openai-wrapper"}
            target="_blank">
            <GithubIcon className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
