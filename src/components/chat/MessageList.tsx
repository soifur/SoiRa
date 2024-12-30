import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot } from "@/hooks/useBots";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";

interface MessageListProps {
  messages: Array<{ role: string; content: string }>;
  selectedBot?: Bot;
  onStarterClick?: (starter: string) => void;
}

export const MessageList = ({ messages, selectedBot, onStarterClick }: MessageListProps) => {
  return (
    <ScrollArea className="flex-1 rounded-lg border p-4">
      {selectedBot && selectedBot.starters.length > 0 && messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedBot.starters.map((starter, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => onStarterClick?.(starter)}
            >
              {starter}
            </Button>
          ))}
        </div>
      )}
      <div className="space-y-4">
        {messages.map((message, i) => (
          <ChatMessage
            key={i}
            role={message.role}
            content={message.content}
            selectedBot={selectedBot}
          />
        ))}
      </div>
    </ScrollArea>
  );
};