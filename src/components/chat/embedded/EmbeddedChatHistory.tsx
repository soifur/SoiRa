import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History, X, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ChatHistoryItem {
  id: string;
  messages: any[];
  created_at: string;
  sequence_number: number;
}

interface EmbeddedChatHistoryProps {
  sessionToken: string | null;
  botId: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmbeddedChatHistory = ({
  sessionToken,
  botId,
  onSelectChat,
  onNewChat,
  currentChatId,
  isOpen,
  onClose
}: EmbeddedChatHistoryProps) => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (sessionToken) {
      fetchChatHistory();
    }
  }, [sessionToken, botId]);

  const fetchChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('bot_id', botId)
        .eq('session_token', sessionToken)
        .eq('deleted', 'no')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChatHistory(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLastMessage = (messages: any[]) => {
    if (!messages || messages.length === 0) return 'No messages';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? '...' : '');
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "bg-background border-r",
      isMobile ? "fixed inset-0 z-50" : "w-80 h-full"
    )}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5" />
          <h2 className="font-semibold">Chat History</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            New
          </Button>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <ScrollArea className="h-[calc(100%-4rem)]">
        <div className="p-4 space-y-2">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-colors",
                "hover:bg-accent",
                currentChatId === chat.id ? "bg-accent" : "bg-card"
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  Chat #{chat.sequence_number}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(chat.created_at)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {getLastMessage(chat.messages)}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};