import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatHistoryHeader } from "./history/ChatHistoryHeader";
import { ProfileSection } from "./ProfileSection";
import { ChatHistoryContent } from "./history/ChatHistoryContent";
import { useChatHistoryState } from "./history/ChatHistoryState";
import { ChatHistoryContainer } from "./history/ChatHistoryContainer";
import { ChatsByModelAndDate, MainChatHistoryProps, Chat } from "./history/types";
import { getDateGroup } from "@/utils/dateUtils";
import { Database } from "@/integrations/supabase/types";
import Cookies from 'js-cookie';

type ChatHistoryRow = Database['public']['Tables']['chat_history']['Row'] & {
  bot: {
    name: string;
    model: string;
  };
};

const SIDEBAR_COOKIE_NAME = 'oai-nav-state';
const SESSION_TOKEN_COOKIE = '_chat_session';
const COOKIE_EXPIRES = 365; // Cookie expires in 365 days

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
  const isMobile = useIsMobile();
  const [sessionToken, setSessionToken] = useState<string | null>(initialSessionToken);

  // Initialize session token and sidebar state from cookies on mount
  useEffect(() => {
    const initializeSessionToken = async () => {
      if (typeof window !== 'undefined') {
        // Handle session token for all users
        let token = Cookies.get(SESSION_TOKEN_COOKIE);
        if (!token) {
          const { data: { user } } = await supabase.auth.getUser();
          token = user?.id || initialSessionToken;
          if (token) {
            Cookies.set(SESSION_TOKEN_COOKIE, token, { 
              expires: COOKIE_EXPIRES,
              sameSite: 'Lax',
              secure: false
            });
          }
        }
        setSessionToken(token);

        // Handle sidebar state (desktop only)
        if (!isMobile) {
          const savedState = Cookies.get(SIDEBAR_COOKIE_NAME);
          if (savedState === '1' && !isOpen) {
            onClose(); // Only trigger if it should be open
          }
        }
      }
    };
    initializeSessionToken();
  }, []);

  // Persist sidebar state in cookie for desktop only
  useEffect(() => {
    if (!isMobile && typeof window !== 'undefined') {
      Cookies.set(SIDEBAR_COOKIE_NAME, isOpen ? '1' : '0', { 
        expires: COOKIE_EXPIRES,
        sameSite: 'Lax',
        secure: false
      });
    }
  }, [isOpen, isMobile]);

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
      } 
      
      if (sessionToken) {
        query = user ? 
          query.or(`user_id.eq.${user.id},session_token.eq.${sessionToken}`) :
          query.eq('session_token', sessionToken);
      }

      const { data, error } = await query;

      if (error) throw error;

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

  useEffect(() => {
    fetchChatHistory();
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
