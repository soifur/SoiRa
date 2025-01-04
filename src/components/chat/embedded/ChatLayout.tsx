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
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header - Fixed height */}
      <div className="w-full h-[60px] min-h-[60px] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
        <div className="flex-1" /> {/* Spacer */}
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

      {/* Messages Container - Flexible height */}
      <div className={cn(
        "flex-1 overflow-y-auto",
        "w-full max-w-4xl mx-auto"
      )}>
        {children.messages}
      </div>

      {/* Input Container - Fixed height */}
      <div className="w-full h-[80px] min-h-[80px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <div className="h-full max-w-4xl mx-auto flex items-center px-4">
          {children.input}
        </div>
      </div>
    </div>
  );
};