import React, { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageCircle, HelpCircle, Code, BookOpen, Lightbulb } from "lucide-react";
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
}

export const MessageList = ({ messages, selectedBot, starters = [], onStarterClick }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottom = useRef(true);
  const lastUserInteraction = useRef<number>(Date.now());
  const SCROLL_THRESHOLD = 100;

  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (scrollArea && isNearBottom.current) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const timeSinceLastInteraction = Date.now() - lastUserInteraction.current;
    
    if (timeSinceLastInteraction > 1000) {
      isNearBottom.current = 
        target.scrollHeight - target.scrollTop - target.clientHeight < SCROLL_THRESHOLD;
    }
    lastUserInteraction.current = Date.now();
  };

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
    <ScrollArea 
      ref={scrollRef}
      className="flex-1 p-4 pb-32" // Added padding bottom to prevent overlap with input
      onScroll={handleScroll}
    >
      {messages.length === 0 && starters && starters.length > 0 && (
        <div className="h-full flex flex-col items-center justify-center">
          {selectedBot && (
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
              {selectedBot.name}
            </h2>
          )}
          <h1 className="text-4xl font-bold mb-12 text-foreground text-center">
            What can I help with?
          </h1>
          <div className="grid grid-cols-1 gap-3 w-full max-w-2xl">
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
                    "whitespace-normal text-left"
                  )}
                  onClick={() => onStarterClick && onStarterClick(starter)}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-left break-words">{starter}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.content}
            isBot={message.role === "assistant"}
            avatar={message.avatar}
          />
        ))}
      </div>
    </ScrollArea>
  );
};