import { Card } from "@/components/ui/card";
import { MessageSquare, Calendar, Share2, Network, Trash2 } from "lucide-react";
import { Bot } from "@/hooks/useBots";
import { ChatRecord } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ChatListItemProps {
  record: ChatRecord;
  bot?: Bot;
  onClick: () => void;
  onDelete?: () => void;
}

export const ChatListItem = ({ record, bot, onClick, onDelete }: ChatListItemProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isMobile) {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyShareLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!record.shareKey) return;
    
    const shortLink = `${window.location.origin}/embed/${record.shareKey}`;
    navigator.clipboard.writeText(shortLink);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard",
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const lastMessage = record.messages[record.messages.length - 1];

  return (
    <Card 
      className="p-4 hover:bg-accent cursor-pointer transition-colors relative group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold flex items-center gap-2">
            {bot?.name || "Unknown Bot"}
            <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
              Chat #{record.sequence_number}
            </span>
          </span>
          {record.client_id && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Network className="w-3 h-3" />
              {record.client_id.slice(0, 8)}
            </span>
          )}
          {record.shareKey && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={copyShareLink}
            >
              <Share2 className="w-4 h-4" />
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
          {lastMessage?.timestamp ? formatDate(lastMessage.timestamp.toString()) : 'No messages'}
        </span>
      </div>
      {!isMobile && (
        <div className="mt-2 text-sm text-muted-foreground">
          Latest message: {lastMessage?.content ? `${lastMessage.content.slice(0, 100)}...` : 'No messages'}
        </div>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </Card>
  );
};