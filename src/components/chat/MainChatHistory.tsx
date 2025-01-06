import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatHistoryHeader } from "./history/ChatHistoryHeader";
import { ChatHistoryGroup } from "./history/ChatHistoryGroup";
import { getDateGroup, DATE_GROUP_ORDER } from "@/utils/dateUtils";
import { ProfileSection } from "./ProfileSection";
import { useQuery } from "@tanstack/react-query";
import { UserRole } from "@/types/user";
import { MobileNavigation } from "./history/MobileNavigation";
import { ChatsByModelAndDate, MainChatHistoryProps, Chat, Message } from "./history/types";
import { Database } from "@/integrations/supabase/types";
import { useChatHistoryState } from "./history/ChatHistoryState";

type ChatHistoryRow = Database['public']['Tables']['chat_history']['Row'] & {
  bot: {
    name: string;
    model: string;
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
  setSelectedBotId,
}: MainChatHistoryProps) => {
  const [chatsByModelAndDate, setChatsByModelAndDate] = useState<ChatsByModelAndDate>({});
  const { expandedGroups, expandedModels, toggleGroup, toggleModel } = useChatHistoryState(chatsByModelAndDate);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const convertToChat = (row: ChatHistoryRow): Chat => {
    const messages = (typeof row.messages === 'string' ? 
      JSON.parse(row.messages) : row.messages) as Message[];
    
    return {
      id: row.id,
      created_at: row.created_at || '',
      updated_at: row.updated_at || '',
      deleted: row.deleted || 'no',
      user_id: row.user_id || '',
      session_token: row.session_token || '',
      bot_id: row.bot_id,
      messages: Array.isArray(messages) ? messages : []
    };
  };

  useEffect(() => {
    fetchChatHistory();
  }, [sessionToken, botId]);

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

      const grouped = (data || []).reduce((acc: ChatsByModelAndDate, row: ChatHistoryRow) => {
        const modelName = row.bot?.name || 'Unknown Model';
        const dateGroup = getDateGroup(row.created_at);
        
        if (!acc[modelName]) {
          acc[modelName] = {};
        }
        
        if (!acc[modelName][dateGroup]) {
          acc[modelName][dateGroup] = [];
        }
        
        acc[modelName][dateGroup]!.push(convertToChat(row));
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

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
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

  const handleSelectChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    console.log("Selecting chat:", chatId);
    
    try {
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
    <div 
      className={cn(
        "fixed top-0 left-0 h-screen z-[200] bg-background shadow-lg transition-transform duration-300 ease-in-out border-r",
        "dark:bg-zinc-950",
        "light:bg-white light:border-gray-200",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isMobile ? "w-full" : "w-80"
      )}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the sidebar
    >
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
          
          <div className="p-4 space-y-4">
            {Object.entries(chatsByModelAndDate).map(([modelName, dateGroups]) => (
              <ChatHistoryGroup
                key={modelName}
                label={modelName}
                chats={[]}
                isExpanded={expandedModels.has(modelName)}
                onToggle={() => toggleModel(modelName)}
                currentChatId={currentChatId}
                onSelectChat={(chatId) => handleSelectChat(chatId)}
                onDeleteChat={(chatId, e) => handleDelete(chatId, e)}
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
                      onSelectChat={(chatId) => handleSelectChat(chatId)}
                      onDeleteChat={(chatId, e) => handleDelete(chatId, e)}
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