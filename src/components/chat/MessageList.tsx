import React from "react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";
import { useIsMobile } from "@/hooks/use-mobile";
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";

export interface MessageListProps {
  messages: Message[];
  selectedBot: any;
  starters: string[];
  onStarterClick?: (starter: string) => void;
  isLoading: boolean;
}

export const MessageList = ({ messages, selectedBot, starters, onStarterClick, isLoading }: MessageListProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col h-full">
      {messages.length === 0 && starters && starters.length > 0 && (
        <div className={cn(
          "flex flex-col gap-2 p-4",
          isMobile ? "mt-[10vh]" : "mt-[20vh]"
        )}>
          <p className="text-sm text-muted-foreground mb-2">
            Start a conversation:
          </p>
          <div className="flex flex-col gap-2">
            {starters.map((starter, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left"
                onClick={() => onStarterClick?.(starter)}
              >
                {starter}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message.content}
          isBot={message.role === 'assistant'}
          avatar={message.avatar}
          isLoading={isLoading}
        />
      ))}
      
      {isLoading && (
        <div className="flex items-center gap-2 p-4 text-muted-foreground">
          <div className="typing-indicator">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
        </div>
      )}
    </div>
  );
};