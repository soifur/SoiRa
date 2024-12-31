import React, { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

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

export const MessageList = ({ messages, selectedBot, starters, onStarterClick }: MessageListProps) => {
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

  return (
    <ScrollArea 
      ref={scrollRef}
      className="flex-1 p-4"
      onScroll={handleScroll}
    >
      {messages.length === 0 && starters && starters.length > 0 && (
        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-medium">Conversation Starters:</h3>
          <div className="flex flex-col gap-2">
            {starters.map((starter: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                className="text-left"
                onClick={() => onStarterClick && onStarterClick(starter)}
              >
                {starter}
              </Button>
            ))}
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