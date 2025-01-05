import React, { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageCircle, HelpCircle, Code, BookOpen, Lightbulb, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bot } from "@/hooks/useBots";

export interface Message {
  id: string;
  role: string;
  content: string;
  timestamp?: Date;
  isBot?: boolean;
  avatar?: string;
}

interface MessageListProps {
  messages: Message[];
  selectedBot?: Bot;
  starters?: string[];
  onStarterClick?: (value: string) => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  onClearChat?: () => void;
  disabled?: boolean;
  disabledReason?: string;
  bot?: Bot;
}

export const MessageList = ({ 
  messages = [],
  selectedBot, 
  starters = [], 
  onStarterClick, 
  isLoading,
  isStreaming,
  onClearChat,
  disabled,
  disabledReason,
  bot
}: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastMessageRef.current && !isLoading) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const getStarterIcon = (starter: string) => {
    const lowerStarter = starter.toLowerCase();
    if (lowerStarter.includes('help') || lowerStarter.includes('how')) {
      return HelpCircle;
    }
    if (lowerStarter.includes('code') || lowerStarter.includes('program')) {
      return Code;
    }
    if (lowerStarter.includes('explain') || lowerStarter.includes('learn')) {
      return BookOpen;
    }
    if (lowerStarter.includes('idea') || lowerStarter.includes('suggest')) {
      return Lightbulb;
    }
    return MessageCircle;
  };

  // Add null check for messages
  if (!Array.isArray(messages)) {
    console.warn("Messages prop is not an array:", messages);
    return null;
  }

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className={cn(
          "h-full p-4",
          messages.length === 0 ? "flex flex-col items-center justify-center" : "space-y-4 relative"
        )}>
          {messages.length === 0 && starters && starters.length > 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4">
              {selectedBot && (
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
                  {selectedBot.name}
                </h2>
              )}
              <h1 className="text-2xl md:text-4xl font-bold mb-8 md:mb-12 text-foreground text-center">
                What can I help with?
              </h1>
              <div className="grid grid-cols-1 gap-2 md:gap-3 w-full max-w-xl">
                {starters.map((starter, index) => {
                  const Icon = getStarterIcon(starter);
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className={cn(
                        "flex items-center justify-start gap-2 md:gap-3 p-3 md:p-4 h-auto",
                        "text-sm md:text-base w-full",
                        "rounded-xl md:rounded-2xl hover:bg-accent/50 transition-colors",
                        "bg-background/50 backdrop-blur-sm border-muted-foreground/20",
                        "whitespace-normal text-left",
                        disabled && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !disabled && onStarterClick && onStarterClick(starter)}
                      disabled={disabled}
                      title={disabled ? disabledReason : undefined}
                    >
                      <Icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span className="text-left break-words">{starter}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                  className="relative group"
                >
                  <ChatMessage
                    message={message.content}
                    isBot={message.role === "assistant"}
                    avatar={message.avatar || selectedBot?.avatar}
                    isLoading={index === messages.length - 1 && message.role === "assistant" && isLoading}
                    isStreaming={index === messages.length - 1 && message.role === "assistant" && isStreaming}
                  />
                </div>
              ))}
            </div>
          )}
          {onClearChat && messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearChat}
              className="absolute top-2 right-2 hover:bg-destructive/10"
            >
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};