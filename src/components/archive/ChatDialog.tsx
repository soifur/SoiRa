import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Share2 } from "lucide-react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Bot } from "@/hooks/useBots";
import { ChatRecord } from "./types";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatDialogProps {
  chat: ChatRecord | null;
  bot?: Bot;
  onClose: () => void;
}

export const ChatDialog = ({ chat, bot, onClose }: ChatDialogProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  const copyShareLink = () => {
    if (!chat?.shareKey) return;
    
    const shortLink = `${window.location.origin}/embed/${chat.shareKey}`;
    navigator.clipboard.writeText(shortLink);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard",
    });
  };

  if (!chat) return null;

  return (
    <Dialog open={chat !== null} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'w-full h-full max-w-none m-0 rounded-none' : 'max-w-3xl max-h-[80vh]'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{bot?.name || 'Chat History'}</span>
              {chat.shareKey && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyShareLink}
                  className="h-6 px-2"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  {isMobile ? "Share" : "Copy Link"}
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {formatDate(chat.timestamp)}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className={`${isMobile ? 'h-[calc(100vh-8rem)]' : 'h-[60vh]'} mt-4`}>
          <div className="space-y-4">
            {chat.messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message.content}
                isBot={message.role === 'assistant'}
                avatar={bot?.avatar}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};