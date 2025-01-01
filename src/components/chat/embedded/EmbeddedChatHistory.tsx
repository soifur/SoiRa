import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History, X, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ChatHistoryItem, ChatHistoryData, Message } from "../types/chatTypes";

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

      const transformedData: ChatHistoryItem[] = (data || []).map((item: ChatHistoryData) => ({
        id: item.id!,
        messages: Array.isArray(item.messages) 
          ? (item.messages as any[]).map((msg: any): Message => ({
              id: msg.id || crypto.randomUUID(),
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
              isBot: msg.isBot,
              avatar: msg.avatar
            }))
          : [],
        created_at: item.created_at || new Date().toISOString(),
        sequence_number: item.sequence_number
      }));

      setChatHistory(transformedData);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('chat_history')
        .update({ deleted: 'yes' })
        .eq('id', chatId)
        .eq('session_token', sessionToken);

      if (error) throw error;

      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      toast({
        title: "Success",
        description: "Chat deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  const getChatTitle = (messages: Message[]) => {
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (!firstUserMessage) return '';
    return firstUserMessage.content;
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
      <ScrollArea className="h-[calc(100%-4rem)]">
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
              <div className="flex items-center justify-between mb-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
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