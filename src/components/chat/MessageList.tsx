import React, { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageCircle, HelpCircle, Code, BookOpen, Lightbulb, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  selectedBot?: any;
  starters?: string[];
  onStarterClick?: (value: string) => void;
  isLoading?: boolean;
  onClearChat?: () => void;
}

export const MessageList = ({ 
  messages, 
  selectedBot, 
  starters = [], 
  onStarterClick, 
  isLoading,
  onClearChat 
}: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative flex-1">
      <ScrollArea className="h-[calc(100vh-6.5rem)] px-4">
        {messages.length === 0 && starters && starters.length > 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
            {selectedBot && (
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text animate-fade-in">
                {selectedBot.name}
              </h2>
            )}
            <h1 className="text-4xl font-bold mb-12 text-foreground text-center animate-fade-in">
              What can I help with?
            </h1>
            <div className="grid grid-cols-1 gap-3 w-full max-w-2xl px-4">
              {starters.map((starter, index) => {
                const Icon = getStarterIcon(starter);
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={cn(
                      "flex items-center justify-start gap-3 p-4 h-auto text-base w-full",
                      "rounded-2xl hover:bg-accent/50 transition-colors",
                      "bg-background/50 backdrop-blur-sm border-muted-foreground/20",
                      "whitespace-normal text-left",
                      "animate-fade-in",
                      "hover:scale-[1.02] transition-transform duration-200"
                    )}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                    onClick={() => onStarterClick && onStarterClick(starter)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-left break-words">{starter}</span>
                  </Button>
                );
              })}
            </div>
            {onClearChat && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearChat}
                className="absolute top-4 right-4 hover:bg-destructive/10 animate-fade-in"
              >
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-4 relative">
            {messages.map((message, index) => (
              <div
                key={message.id}
                ref={index === messages.length - 1 ? lastMessageRef : null}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <ChatMessage
                  message={message.content}
                  isBot={message.role === "assistant"}
                  avatar={message.avatar}
                  isLoading={message.role === "assistant" && isLoading}
                />
              </div>
            ))}
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
        )}
      </ScrollArea>
    </div>
  );
};