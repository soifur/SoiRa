import { Card } from "@/components/ui/card";
import { MessageSquare, Calendar, Share2 } from "lucide-react";
import { Bot } from "@/hooks/useBots";
import { ChatRecord } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ChatListItemProps {
  record: ChatRecord;
  bot?: Bot;
  onClick: () => void;
}

export const ChatListItem = ({ record, bot, onClick }: ChatListItemProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = isMobile 
      ? {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }
      : {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        };
    
    return new Intl.DateTimeFormat(undefined, options).format(date);
  };

  const copyShareLink = () => {
    if (!record.shareKey) return;
    
    const shortLink = `${window.location.origin}/embed/${record.shareKey}`;
    navigator.clipboard.writeText(shortLink);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard",
    });
  };

  const lastMessage = record.messages[record.messages.length - 1];
  const lastMessageTime = lastMessage?.timestamp || record.timestamp;

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
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={(e) => {
                e.stopPropagation();
                copyShareLink();
              }}
            >
              <Share2 className="w-4 h-4 mr-1" />
              {isMobile ? "Share" : "Copy Link"}
            </Button>
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
          {lastMessageTime ? formatDate(lastMessageTime.toString()) : 'No messages'}
        </span>
      </div>
      {!isMobile && (
        <div className="mt-2 text-sm text-muted-foreground">
          <div>IP: {record.client_id || 'anonymous'}</div>
          <div className="mt-1">
            Latest message: {lastMessage?.content ? `${lastMessage.content.slice(0, 100)}...` : 'No messages'}
          </div>
        </div>
      )}
    </Card>
  );
};