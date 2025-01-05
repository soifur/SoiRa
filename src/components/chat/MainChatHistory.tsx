import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatHistoryHeader } from "./history/ChatHistoryHeader";
import { ChatHistoryGroup } from "./history/ChatHistoryGroup";
import { DateGroup, DATE_GROUP_ORDER, getDateGroup } from "@/utils/dateUtils";

interface MainChatHistoryProps {
  sessionToken: string | null;
  botId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

type ChatsByModelAndDate = {
  [modelName: string]: {
    [K in DateGroup]?: any[];
  };
};

export const MainChatHistory = ({
  sessionToken,
  botId,
  onSelectChat,
  onNewChat,
  currentChatId,
  isOpen,
  onClose,
}: MainChatHistoryProps) => {
  const [chatsByModelAndDate, setChatsByModelAndDate] = useState<ChatsByModelAndDate>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Today", "Yesterday"]));
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());
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

      // Group chats by model and then by date
      const grouped = (data || []).reduce((acc: ChatsByModelAndDate, chat) => {
        const modelName = chat.bot?.name || 'Unknown Model';
        const dateGroup = getDateGroup(chat.created_at);
        
        if (!acc[modelName]) {
          acc[modelName] = {};
        }
        
        if (!acc[modelName][dateGroup]) {
          acc[modelName][dateGroup] = [];
        }
        
        acc[modelName][dateGroup]!.push(chat);
        return acc;
      }, {});

      setChatsByModelAndDate(grouped);
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

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const toggleModel = (modelName: string) => {
    setExpandedModels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelName)) {
        newSet.delete(modelName);
      } else {
        newSet.add(modelName);
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
            {Object.entries(chatsByModelAndDate).map(([modelName, dateGroups]) => (
              <ChatHistoryGroup
                key={modelName}
                label={modelName}
                chats={[]}
                isExpanded={expandedModels.has(modelName)}
                onToggle={() => toggleModel(modelName)}
                currentChatId={currentChatId}
                onSelectChat={onSelectChat}
                onDeleteChat={handleDelete}
                isModelGroup={true}
              >
                {DATE_GROUP_ORDER.map((dateGroup) => {
                  const chats = dateGroups[dateGroup] || [];
                  if (chats.length === 0) return null;
                  
                  return (
                    <ChatHistoryGroup
                      key={`${modelName}-${dateGroup}`}
                      label={dateGroup}
                      chats={chats}
                      isExpanded={expandedGroups.has(dateGroup)}
                      onToggle={() => toggleGroup(dateGroup)}
                      currentChatId={currentChatId}
                      onSelectChat={onSelectChat}
                      onDeleteChat={handleDelete}
                    />
                  );
                })}
              </ChatHistoryGroup>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};