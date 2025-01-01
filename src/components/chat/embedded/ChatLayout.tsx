import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatLayoutProps {
  onNewChat: () => void;
  children: {
    messages: React.ReactNode;
    input: React.ReactNode;
  };
}

export const ChatLayout = ({ onNewChat, children }: ChatLayoutProps) => {
  return (
    <div className="flex flex-col h-[100dvh] w-full">
      {/* Header - Fixed 4% height */}
      <div className="h-[4dvh] min-h-[40px] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-50">
        <div className="h-full flex items-center justify-end px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="text-muted-foreground hover:text-primary flex items-center gap-2"
          >
            <MessageSquarePlus className="h-5 w-5" />
            <span className="ml-2">New Chat</span>
          </Button>
        </div>
      </div>

      {/* Messages Container - Flexible height with padding for header and input */}
      <div className={cn(
        "flex-1 overflow-y-auto",
        "mt-[4dvh] mb-[8dvh] min-h-0",
        "w-full max-w-4xl mx-auto"
      )}>
        {children.messages}
      </div>

      {/* Input Container - Fixed 8% height */}
      <div className="h-[8dvh] min-h-[60px] w-full fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <div className="h-full max-w-4xl mx-auto flex items-center">
          {children.input}
        </div>
      </div>
    </div>
  );
};