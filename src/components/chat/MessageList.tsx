import React, { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Image, Gift, Lightbulb, List } from "lucide-react";

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

  const starterButtons = [
    { text: "Create image", icon: Image },
    { text: "Surprise me", icon: Gift },
    { text: "Get advice", icon: Lightbulb },
    { text: "Make a plan", icon: List },
  ];

  return (
    <ScrollArea 
      ref={scrollRef}
      className="flex-1 p-4 pb-32"
      onScroll={handleScroll}
    >
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-12">What can I help with?</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl px-4">
            {starterButtons.map((button, index) => (
              <Button
                key={index}
                variant="outline"
                className="flex items-center justify-start gap-2 p-4 h-auto text-base rounded-2xl hover:bg-accent/50 transition-colors"
                onClick={() => onStarterClick && onStarterClick(button.text)}
              >
                <button.icon className="h-5 w-5" />
                {button.text}
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