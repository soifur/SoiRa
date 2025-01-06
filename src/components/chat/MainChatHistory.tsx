import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatHistoryHeader } from "./history/ChatHistoryHeader";
import { ChatHistoryGroup } from "./history/ChatHistoryGroup";
import { DATE_GROUP_ORDER, getDateGroup } from "@/utils/dateUtils";
import { ProfileSection } from "./ProfileSection";
import { useQuery } from "@tanstack/react-query";
import { UserRole } from "@/types/user";
import { MobileNavigation } from "./history/MobileNavigation";
import { ChatsByModelAndDate, MainChatHistoryProps } from "./history/types";

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
    fetchChatHistory();
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
      console.log("Fetching chat history with sessionToken:", sessionToken);
      
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
      console.log("Current user:", user);

      if (user) {
        console.log("Fetching chats for authenticated user:", user.id);
        query = query.eq('user_id', user.id);
      } 
      
      if (sessionToken) {
        console.log("Adding session token condition:", sessionToken);
        // If user is authenticated, this becomes an OR condition
        query = user ? 
          query.or(`user_id.eq.${user.id},session_token.eq.${sessionToken}`) :
          query.eq('session_token', sessionToken);
      }

      const { data, error } = await query;
      console.log("Fetched chat history:", data);

      if (error) {
        console.error("Error in fetchChatHistory:", error);
        throw error;
      }

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

      console.log("Grouped chat history:", grouped);
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
    console.log("Selecting chat:", chatId);
    
    try {
      // Fetch the chat to get its bot_id
      const { data: chat, error } = await supabase
        .from('chat_history')
        .select('bot_id')
        .eq('id', chatId)
        .single();

      if (error) throw error;

      if (chat && chat.bot_id) {
        console.log("Setting selected bot ID:", chat.bot_id);
        setSelectedBotId(chat.bot_id);
      }

      onSelectChat(chatId);
    } catch (error) {
      console.error('Error selecting chat:', error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      });
    }
  };

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const role = userProfile?.role as UserRole;
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin';

  return (
    <div className={cn(
      "fixed top-0 left-0 h-screen z-[200] bg-background shadow-lg transition-transform duration-300 ease-in-out border-r",
      "dark:bg-zinc-950",
      "light:bg-white light:border-gray-200",
      isOpen ? "translate-x-0" : "-translate-x-full",
      isMobile ? "w-full" : "w-64" // Changed from w-80 to w-64 for a smaller width
    )}>
      <div className="flex flex-col h-full">
        <ChatHistoryHeader onNewChat={onNewChat} onClose={onClose} />
        
        <ScrollArea className="flex-1">
          {isMobile && (
            <MobileNavigation 
              isSuperAdmin={isSuperAdmin} 
              isAdmin={isAdmin} 
              onClose={onClose}
            />
          )}
          
          <div className="p-3 space-y-3"> {/* Reduced padding from p-4 space-y-4 to p-3 space-y-3 */}
            {Object.entries(chatsByModelAndDate).map(([modelName, dateGroups]) => (
              <ChatHistoryGroup
                key={modelName}
                label={modelName}
                chats={[]}
                isExpanded={expandedModels.has(modelName)}
                onToggle={() => toggleModel(modelName)}
                currentChatId={currentChatId}
                onSelectChat={handleSelectChat}
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
                      onSelectChat={handleSelectChat}
                      onDeleteChat={handleDelete}
                    />
                  );
                })}
              </ChatHistoryGroup>
            ))}
          </div>
        </ScrollArea>
        
        <div className="mt-auto border-t border-border">
          <ProfileSection showViewPlans={isMobile} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};