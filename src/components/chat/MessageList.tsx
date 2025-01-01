import { Bot } from "@/hooks/useBots";
import { ChatMessage } from "./ChatMessage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MessageListProps {
  messages: Array<{ role: string; content: string; timestamp?: Date; id: string; avatar?: string }>;
  selectedBot: Bot;
  starters?: string[];
  onStarterClick?: (starter: string) => void;
  isLoading?: boolean;
}

export const MessageList = ({ 
  messages, 
  selectedBot, 
  starters = [], 
  onStarterClick,
  isLoading = false 
}: MessageListProps) => {
  return (
    <div className="space-y-4 px-4">
      {messages.length === 0 && starters.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Suggested messages:</h3>
          <div className="flex flex-wrap gap-2">
            {starters.map((starter, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onStarterClick?.(starter)}
                className="text-xs"
              >
                {starter}
              </Button>
            ))}
          </div>
        </Card>
      )}
      
      {messages.map((message, index) => {
        // Only show loading state for the last assistant message if isLoading is true
        const isLastMessage = index === messages.length - 1;
        const showLoading = isLoading && isLastMessage && message.role === "assistant";
        
        return (
          <ChatMessage
            key={message.id}
            message={message}
            bot={selectedBot}
            isLoading={showLoading}
          />
        );
      })}
    </div>
  );
};