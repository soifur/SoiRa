import { useEffect, useRef, useState } from "react";
import { Bot } from "@/hooks/useBots";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Message } from "./types/chatTypes";

export interface MessageListProps {
  messages: Message[];
  selectedBot: Bot;
  starters?: string[];
  onStarterClick?: (starter: string) => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  onClearChat?: () => void;
  disabled?: boolean;
  disabledReason?: string;
}

export const MessageList = ({ 
  messages, 
  selectedBot, 
  starters = [], 
  onStarterClick, 
  isLoading,
  isStreaming,
  onClearChat,
  disabled,
  disabledReason
}: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (!hasScrolled && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, hasScrolled]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop === clientHeight;
      setHasScrolled(!isAtBottom);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea 
        className="flex-1 p-4"
        onScroll={handleScroll}
        ref={scrollRef}
      >
        {messages.length === 0 && starters && starters.length > 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <h3 className="text-lg font-semibold mb-4">
              Start a conversation with {selectedBot.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {starters.map((starter, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    "text-sm",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !disabled && onStarterClick?.(starter)}
                  disabled={disabled}
                >
                  {starter}
                </Button>
              ))}
            </div>
            {disabled && disabledReason && (
              <p className="text-sm text-destructive mt-4">
                {disabledReason}
              </p>
            )}
          </div>
        )}
        
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          return (
            <div
              key={message.id || index}
              ref={isLastMessage ? lastMessageRef : null}
              className={cn(
                "mb-4 last:mb-0",
                isLastMessage && isStreaming && "animate-pulse"
              )}
            >
              <ChatMessage
                message={message.content}
                isBot={message.role === 'assistant'}
                avatar={selectedBot.avatar}
                isLoading={isLoading && isLastMessage}
                isStreaming={isStreaming && isLastMessage}
              />
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
};