import { Bot } from "@/hooks/useBots";
import { Message } from "./types/chatTypes";
import { ChatMessage } from "./ChatMessage";
import { Button } from "../ui/button";

interface MessageListProps {
  messages: Message[];
  selectedBot?: Bot;
  starters?: string[];
  onStarterClick?: (starter: string) => void;
  isLoading?: boolean;
  isStreaming?: boolean;
}

export const MessageList = ({
  messages,
  selectedBot,
  starters,
  onStarterClick,
  isLoading,
  isStreaming
}: MessageListProps) => {
  const showStartNowButton = messages.length === 0 && selectedBot;

  return (
    <div className="space-y-4">
      {showStartNowButton && (
        <div className="flex flex-col items-center gap-4 p-4">
          <h2 className="text-xl font-semibold">{selectedBot.name}</h2>
          <Button
            onClick={() => onStarterClick?.("Let's start")}
            className="px-8 py-2 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-full transform transition-all duration-200 hover:scale-105"
          >
            Start Now
          </Button>
        </div>
      )}
      
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message}
          isLoading={isLoading}
          isStreaming={isStreaming && index === messages.length - 1}
        />
      ))}
    </div>
  );
};