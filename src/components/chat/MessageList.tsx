import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageStarters } from "./MessageStarters";
import { MessageContainer } from "./MessageContainer";

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

  return (
    <div className="relative flex-1 overflow-hidden">
      <ScrollArea 
        ref={scrollRef}
        className="h-full px-4" 
        onScroll={handleScroll}
      >
        {messages.length === 0 && starters && starters.length > 0 ? (
          <MessageStarters
            selectedBot={selectedBot}
            starters={starters}
            onStarterClick={onStarterClick}
          />
        ) : (
          <MessageContainer messages={messages} />
        )}
      </ScrollArea>
    </div>
  );
};