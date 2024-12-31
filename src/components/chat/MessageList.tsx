import React, { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageCircle, HelpCircle, Code, BookOpen, Lightbulb, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

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

  // Map starter types to icons
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
      className="flex-1 p-4 pb-32"
      onScroll={handleScroll}
    >
      {messages.length === 0 && starters && starters.length > 0 && (
        <div className="h-full flex flex-col items-start justify-start px-4 space-y-6">
          <div className="w-full space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Conversation Starters
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Add a conversation starter"
                className="flex-1 bg-background/50"
              />
              <Button>Add</Button>
            </div>
            <div className="space-y-2">
              {starters.map((starter, index) => (
                <div key={index} className="flex items-center justify-between gap-2 group">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-3 text-base font-normal"
                    onClick={() => onStarterClick && onStarterClick(starter)}
                  >
                    {starter}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
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