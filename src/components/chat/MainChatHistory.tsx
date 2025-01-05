import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatHistoryHeader } from "./history/ChatHistoryHeader";
import { ChatHistoryGroup } from "./history/ChatHistoryGroup";

interface MainChatHistoryProps {
  sessionToken: string | null;
  botId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatGroup {
  botId: string;
  botName: string;
  model: string;
  chats: any[];
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
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (sessionToken) {
      fetchChatHistory();
    }
  }, [sessionToken, botId]);

  const fetchChatHistory = async () => {
    try {
      let query = supabase
        .from('chat_history')
        .select(`
          *,
          bot:bot_id (
            name,
            model
          )
        `)
        .eq('deleted', 'no')
        .order('created_at', { ascending: false });

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        query = query.eq('user_id', user.id);
      } else if (sessionToken) {
        query = query.eq('session_token', sessionToken);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group chats by bot
      const groups = (data || []).reduce((acc: ChatGroup[], chat) => {
        const botInfo = chat.bot || { name: 'Unknown Bot', model: 'unknown' };
        
        const existingGroup = acc.find(g => g.botId === chat.bot_id);
        
        if (existingGroup) {
          existingGroup.chats.push(chat);
        } else {
          acc.push({
            botId: chat.bot_id,
            botName: botInfo.name,
            model: botInfo.model,
            chats: [chat]
          });
        }
        return acc;
      }, []);

      setChatGroups(groups);
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

  const toggleGroup = (botId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(botId)) {
        newSet.delete(botId);
      } else {
        newSet.add(botId);
      }
      return newSet;
    });
  };

  return (
    <div className={cn(
      "fixed top-0 left-0 h-screen z-[200] bg-zinc-950 dark:bg-zinc-950 shadow-lg transition-transform duration-300 ease-in-out border-r",
      isOpen ? "translate-x-0" : "-translate-x-full",
      isMobile ? "w-full" : "w-80"
    )}>
      <div className="flex flex-col h-full">
        <ChatHistoryHeader onNewChat={onNewChat} onClose={onClose} />
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {chatGroups.map((group) => (
              <ChatHistoryGroup
                key={group.botId}
                {...group}
                isExpanded={expandedGroups.has(group.botId)}
                onToggle={() => toggleGroup(group.botId)}
                currentChatId={currentChatId}
                onSelectChat={onSelectChat}
                onDeleteChat={handleDelete}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};