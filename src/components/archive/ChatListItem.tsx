import { Card } from "@/components/ui/card";
import { MessageSquare, Calendar } from "lucide-react";
import { Bot } from "@/hooks/useBots";
import { ChatRecord } from "./types";

interface ChatListItemProps {
  record: ChatRecord;
  bot?: Bot;
  onClick: () => void;
}

export const ChatListItem = ({ record, bot, onClick }: ChatListItemProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const lastMessage = record.messages[record.messages.length - 1];

  return (
    <Card 
      className="p-4 hover:bg-accent cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {bot?.name || "Unknown Bot"}
          </span>
          {record.shareKey && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              Public
            </span>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {formatDate(record.timestamp)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          {record.messages.length} messages
        </span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {lastMessage?.timestamp ? formatDate(lastMessage.timestamp.toString()) : 'No messages'}
        </span>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        Latest message: {lastMessage?.content ? `${lastMessage.content.slice(0, 100)}...` : 'No messages'}
      </div>
    </Card>
  );
};