import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ChatHistoryHeader } from "./history/ChatHistoryHeader";
import { ProfileSection } from "./ProfileSection";
import { ChatHistoryContent } from "./history/ChatHistoryContent";
import { useChatHistoryState } from "./history/ChatHistoryState";
import { ChatHistoryContainer } from "./history/ChatHistoryContainer";
import { ChatsByModelAndDate, MainChatHistoryProps, Chat } from "./history/types";
import { getDateGroup } from "@/utils/dateUtils";
import { Database } from "@/integrations/supabase/types";
import { useChatHistorySession } from "@/hooks/useChatHistorySession";
import { useSidebarState } from "@/hooks/useSidebarState";

type ChatHistoryRow = Database['public']['Tables']['chat_history']['Row'] & {
  bot: {
    name: string;
    model: string;
  };
};

export const MainChatHistory = ({
  sessionToken: initialSessionToken,
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
  
  // Use our hooks
  const sessionToken = useChatHistorySession(initialSessionToken);
  const { isMobile } = useSidebarState(isOpen, onClose);

  const convertToChat = (row: ChatHistoryRow): Chat => ({
    id: row.id,
    created_at: row.created_at || '',
    updated_at: row.updated_at || '',
    deleted: row.deleted || 'no',
    user_id: row.user_id || '',
    session_token: row.session_token || '',
    bot_id: row.bot_id,
    messages: (typeof row.messages === 'string' ? 
      JSON.parse(row.messages) : row.messages) || []
  });

  const fetchChatHistory = async () => {
    try {
      console.log("Fetching chat history with session token:", sessionToken);
      
      let query = supabase
        .from('chat_history')
        .select(`
          *,
          bot:bot_id (
            name,
            model
          )
        `)
        .eq('deleted', 'no');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log("Fetching for authenticated user:", user.id);
        query = query.eq('user_id', user.id);
      } else if (sessionToken) {
        console.log("Fetching for session token:", sessionToken);
        query = query.eq('session_token', sessionToken);
      }

      if (botId) {
        console.log("Filtering by bot ID:", botId);
        query = query.eq('bot_id', botId);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching chat history:", error);
        throw error;
      }

      console.log("Fetched chat history:", data?.length, "records");

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

  // Fetch chat history when component mounts or when session token changes
  useEffect(() => {
    if (sessionToken) {
      console.log("Session token changed, fetching chat history");
      fetchChatHistory();
    }
  }, [sessionToken, botId]);

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
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

  const handleSelectChat = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const { data: chat, error } = await supabase
        .from('chat_history')
        .select('bot_id')
        .eq('id', chatId)
        .single();

      if (error) throw error;

      if (chat?.bot_id) {
        setSelectedBotId(chat.bot_id);
      }

      onSelectChat(chatId);
      
      // Only close on mobile
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
    <ChatHistoryContainer isOpen={isOpen} onClose={onClose} isMobile={isMobile}>
      <div className="flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
        <ChatHistoryHeader onNewChat={onNewChat} onClose={onClose} />
        
        <ChatHistoryContent
          chatsByModelAndDate={chatsByModelAndDate}
          expandedGroups={expandedGroups}
          expandedModels={expandedModels}
          toggleGroup={toggleGroup}
          toggleModel={toggleModel}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDelete}
          isSuperAdmin={false}
          isAdmin={false}
          onClose={onClose}
        />
        
        <div className="mt-auto border-t border-border">
          <ProfileSection showViewPlans={isMobile} onClose={onClose} />
        </div>
      </div>
    </ChatHistoryContainer>
  );
};