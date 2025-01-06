import { formatDistanceToNow } from "date-fns";
import { Bot, Globe, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot as BotType } from "@/hooks/useBots";
import { ChatRecord } from "./types";
import { cn } from "@/lib/utils";

interface ChatListItemProps {
  record: ChatRecord;
  bot?: BotType;
  onClick: () => void;
  onDelete: () => void;
  showUserInfo?: boolean;
}

export const ChatListItem = ({ 
  record, 
  bot, 
  onClick, 
  onDelete,
  showUserInfo = false 
}: ChatListItemProps) => {
  const firstMessage = record.messages[0]?.content || "Empty chat";
  const timeAgo = formatDistanceToNow(new Date(record.timestamp), { addSuffix: true });

  return (
    <Card 
      className={cn(
        "p-4 hover:bg-accent cursor-pointer transition-colors",
        record.deleted && "opacity-50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="shrink-0 mt-1">
            {bot?.avatar ? (
              <img 
                src={bot.avatar} 
                alt={bot.name} 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <Bot className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">
                {bot?.name || "Unknown Bot"}
              </h3>
              {record.type === 'public' ? (
                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              {record.deleted && (
                <span className="text-xs text-muted-foreground">(Deleted)</span>
              )}
            </div>
            {showUserInfo && (
              <p className="text-sm text-muted-foreground mb-1">
                {record.userName || record.userEmail || 'Unknown User'}
              </p>
            )}
            <p className="text-sm text-muted-foreground truncate">
              {firstMessage}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {timeAgo}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};