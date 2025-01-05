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
        className="flex-1"
        onScroll={handleScroll}
        ref={scrollRef}
      >
        {messages.length === 0 && starters && starters.length > 0 && (
          <div className="flex flex-col items-center h-full">
            <div className="mt-[30vh]">
              <h2 className="text-2xl font-semibold mb-2">{selectedBot.name}</h2>
              <h3 className="text-lg text-muted-foreground mb-6">What can I help with?</h3>
              <div className="flex flex-col gap-2">
                {starters.map((starter, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={cn(
                      "w-full text-left h-12 px-4 bg-background hover:bg-accent",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !disabled && onStarterClick?.(starter)}
                    disabled={disabled}
                  >
                    <span className="mr-2">💬</span>
                    {starter}
                  </Button>
                ))}
              </div>
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