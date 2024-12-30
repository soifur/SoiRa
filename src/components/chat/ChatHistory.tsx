import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Bot } from "@/hooks/useBots";
import { Button } from "@/components/ui/button";
import { Clock, MessageSquare } from "lucide-react";

interface ChatHistoryProps {
  messages: Array<{ role: string; content: string; timestamp?: Date }>;
  selectedBot?: Bot;
  onLoadChat: (messages: Array<{ role: string; content: string }>) => void;
}

export const ChatHistory = ({ messages, selectedBot, onLoadChat }: ChatHistoryProps) => {
  // Group messages by conversation (when there's a gap of more than 5 minutes)
  const conversations = messages.reduce((acc: any[], message, index) => {
    const currentTime = message.timestamp || new Date();
    const prevTime = messages[index - 1]?.timestamp || new Date();
    
    if (index === 0 || currentTime.getTime() - prevTime.getTime() > 5 * 60 * 1000) {
      acc.push([message]);
    } else {
      acc[acc.length - 1].push(message);
    }
    return acc;
  }, []);

  return (
    <Card className="p-4">
      <h2 className="font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Chat History
      </h2>
      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {conversations.map((conversation, i) => (
            <Card
              key={i}
              className="p-3 hover:bg-accent cursor-pointer"
              onClick={() => onLoadChat(conversation)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {conversation[0].timestamp?.toLocaleDateString()}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {conversation.length} messages
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {conversation[0].content}
              </p>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};