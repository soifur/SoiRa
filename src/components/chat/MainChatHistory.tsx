import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatHistoryHeader } from "./history/ChatHistoryHeader";
import { ChatHistoryContent } from "./history/ChatHistoryContent";
import { ProfileSection } from "./ProfileSection";
import { DateGroup, DATE_GROUP_ORDER, getDateGroup } from "@/utils/dateUtils";

interface MainChatHistoryProps {
  sessionToken: string | null;
  botId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId: string | null;
  isOpen: boolean;
  onClose: () => void;
  setSelectedBotId: (botId: string) => void;
}

type ChatsByModelAndDate = {
  [modelName: string]: {
    [K in DateGroup]?: any[];
  };
};

const EXPANDED_GROUPS_KEY = 'chatHistory:expandedGroups';
const EXPANDED_MODELS_KEY = 'chatHistory:expandedModels';

export const MainChatHistory = ({
  sessionToken,
  botId,
  onSelectChat,
  onNewChat,
  currentChatId,
  isOpen,
  onClose,
  setSelectedBotId,
}: MainChatHistoryProps) => {
  const [chatsByModelAndDate, setChatsByModelAndDate] = useState<ChatsByModelAndDate>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const savedGroups = localStorage.getItem(EXPANDED_GROUPS_KEY);
    return savedGroups ? new Set(JSON.parse(savedGroups)) : new Set(DATE_GROUP_ORDER);
  });

  const [expandedModels, setExpandedModels] = useState<Set<string>>(() => {
    const savedModels = localStorage.getItem(EXPANDED_MODELS_KEY);
    return savedModels ? new Set(JSON.parse(savedModels)) : new Set();
  });

  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (sessionToken) {
      fetchChatHistory();
    }
  }, [sessionToken, botId]);

  useEffect(() => {
    localStorage.setItem(EXPANDED_GROUPS_KEY, JSON.stringify(Array.from(expandedGroups)));
  }, [expandedGroups]);

  useEffect(() => {
    localStorage.setItem(EXPANDED_MODELS_KEY, JSON.stringify(Array.from(expandedModels)));
  }, [expandedModels]);

  useEffect(() => {
    const modelNames = Object.keys(chatsByModelAndDate);
    if (modelNames.length > 0) {
      const savedModels = localStorage.getItem(EXPANDED_MODELS_KEY);
      if (!savedModels) {
        setExpandedModels(new Set(modelNames));
      }
    }
  }, [chatsByModelAndDate]);

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

  const handleDelete = async (chatId: string) => {
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

  const handleSelectChat = async (chatId: string) => {
    try {
      const { data: chat, error } = await supabase
        .from('chat_history')
        .select('bot_id')
        .eq('id', chatId)
        .single();

      if (error) throw error;

      if (chat && chat.bot_id) {
        setSelectedBotId(chat.bot_id);
      }

      onSelectChat(chatId);
      
      if (isMobile) {
        onClose();
      }
    } catch (error) {
      console.error('Error selecting chat:', error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn(
      "fixed top-0 left-0 h-screen z-[200] bg-background shadow-lg transition-transform duration-300 ease-in-out border-r",
      "dark:bg-zinc-950",
      "light:bg-white light:border-gray-200",
      isOpen ? "translate-x-0" : "-translate-x-full",
      isMobile ? "w-full" : "w-80"
    )}>
      <div className="flex flex-col h-full">
        <ChatHistoryHeader onNewChat={onNewChat} onClose={onClose} />
        <div className="flex-1 overflow-hidden">
          <ChatHistoryContent
            chatsByModelAndDate={chatsByModelAndDate}
            expandedGroups={expandedGroups}
            expandedModels={expandedModels}
            currentChatId={currentChatId}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDelete}
            onToggleGroup={toggleGroup}
            onToggleModel={toggleModel}
            onClose={onClose}
          />
        </div>
        {isMobile && (
          <div className="flex-none border-t">
            <ProfileSection showViewPlans={true} />
          </div>
        )}
      </div>
    </div>
  );
};