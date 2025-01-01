import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  onClose,
}: EmbeddedChatHistoryProps) => {
  const [chatHistory, setChatHistory] = useState<any[]>([]);
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

  const getChatTitle = (messages: any[]) => {
    const firstUserMessage = messages.find((msg: any) => msg.role === 'user');
    if (!firstUserMessage) return 'New Chat';
    return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 cursor-pointer" onClick={onClose} />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onNewChat}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
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
              <p className="text-sm text-muted-foreground line-clamp-2">
                {getChatTitle(chat.messages)}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};