import { useEffect, useRef } from "react";
import { Bot } from "@/hooks/useBots";
import { ChatMessage } from "./ChatMessage";
import { Message } from "./types/chatTypes";

export interface MessageListProps {
  messages: Message[];
  selectedBot: Bot | null;
  isLoading?: boolean;
  isStreaming?: boolean;
  starters?: string[];
  onStarterClick?: (starter: string) => void;
  disabled?: boolean;
  disabledReason?: string;
}

export const MessageList = ({
  messages,
  selectedBot,
  isLoading = false,
  isStreaming = false,
  starters = [],
  onStarterClick,
  disabled = false,
  disabledReason = ""
}: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isStreaming]);

  if (messages.length === 0 && starters.length > 0 && onStarterClick) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full space-y-4">
          <h2 className="text-lg font-semibold text-center mb-6">
            Get started with some example questions
          </h2>
          <div className="grid gap-2">
            {starters.map((starter, index) => (
              <button
                key={index}
                onClick={() => onStarterClick(starter)}
                disabled={disabled}
                className="w-full p-4 text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={disabled ? disabledReason : undefined}
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message.content}
          isBot={message.role === "assistant"}
          avatar={selectedBot?.avatar}
          isLoading={isLoading && index === messages.length - 1}
          isStreaming={isStreaming && index === messages.length - 1}
          botName={selectedBot?.name}
          showQuizButton={false}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};