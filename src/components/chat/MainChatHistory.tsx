import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History, Plus, X, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainChatHistoryProps {
  sessionToken: string | null;
  botId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MainChatHistory = ({
  sessionToken,
  botId,
  onSelectChat,
  onNewChat,
  currentChatId,
  isOpen,
  onClose,
}: MainChatHistoryProps) => {
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (sessionToken || botId) {
      fetchChatHistory();
    }
  }, [sessionToken, botId]);

  const fetchChatHistory = async () => {
    try {
      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('deleted', 'no')
        .order('created_at', { ascending: false });

      // Get user ID if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // If authenticated, get chats by user_id
        query = query.eq('user_id', user.id);
      } else if (sessionToken) {
        // If not authenticated but has session token, get chats by session_token
        query = query.eq('session_token', sessionToken);
      }

      if (botId) {
        query = query.eq('bot_id', botId);
      }

      const { data, error } = await query;

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

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('chat_history')
        .update({ deleted: 'yes' })
        .eq('id', chatId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chat deleted successfully",
      });
      
      fetchChatHistory();
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
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
    <div className={cn(
      "fixed top-0 left-0 h-screen z-40 bg-background/95 dark:bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-zinc-900/60 shadow-lg transition-transform duration-300 ease-in-out border-r",
      isOpen ? "translate-x-0" : "-translate-x-full",
      isMobile ? "w-full" : "w-80"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex-none p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" />
              <span className="font-semibold">Chat History</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onNewChat}
              >
                <Plus className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-colors group relative",
                  "hover:bg-accent",
                  currentChatId === chat.id ? "bg-accent" : "bg-card"
                )}
                onClick={() => onSelectChat(chat.id)}
              >
                <p className="text-sm text-muted-foreground line-clamp-2 pr-8">
                  {getChatTitle(chat.messages)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 right-2 h-6 w-6 transition-opacity",
                    isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => handleDelete(chat.id, e)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};