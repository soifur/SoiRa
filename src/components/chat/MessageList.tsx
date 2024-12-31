import React, { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  isBot?: boolean;
  avatar?: string;
}

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottom = useRef(true);

  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (scrollArea && isNearBottom.current) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const threshold = 100; // pixels from bottom
    isNearBottom.current = 
      target.scrollHeight - target.scrollTop - target.clientHeight < threshold;
  };

  return (
    <ScrollArea 
      ref={scrollRef}
      className="flex-1 p-4"
      onScroll={handleScroll}
    >
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.content}
            isBot={message.isBot}
            avatar={message.avatar}
          />
        ))}
      </div>
    </ScrollArea>
  );
};