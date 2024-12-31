import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Bot } from "@/hooks/useBots";
import { ChatRecord } from "./types";

interface ChatDialogProps {
  chat: ChatRecord | null;
  bot?: Bot;
  onClose: () => void;
}

export const ChatDialog = ({ chat, bot, onClose }: ChatDialogProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!chat) return null;

  return (
    <Dialog open={chat !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{bot?.name || 'Chat History'}</span>
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
        <ScrollArea className="h-[60vh] mt-4">
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