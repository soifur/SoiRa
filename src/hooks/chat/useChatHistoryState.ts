import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DateGroup, getDateGroup } from "@/utils/dateUtils";

export type ChatsByModelAndDate = {
  [modelName: string]: Partial<Record<DateGroup, any[]>>;
};

const EXPANDED_GROUPS_KEY = 'chatHistory:expandedGroups';
const EXPANDED_MODELS_KEY = 'chatHistory:expandedModels';

export const useChatHistoryState = (sessionToken: string | null, botId: string | null) => {
  const [chatsByModelAndDate, setChatsByModelAndDate] = useState<ChatsByModelAndDate>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const savedGroups = localStorage.getItem(EXPANDED_GROUPS_KEY);
    return savedGroups ? new Set(JSON.parse(savedGroups)) : new Set([]);
  });

  const [expandedModels, setExpandedModels] = useState<Set<string>>(() => {
    const savedModels = localStorage.getItem(EXPANDED_MODELS_KEY);
    return savedModels ? new Set(JSON.parse(savedModels)) : new Set();
  });

  const { toast } = useToast();

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

  return {
    chatsByModelAndDate,
    expandedGroups,
    expandedModels,
    handleDelete,
    toggleGroup,
    toggleModel,
    fetchChatHistory
  };
};
