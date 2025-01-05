import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bot, Archive, Folder, Users, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHistoryGroup } from "./history/ChatHistoryGroup";
import { ChatHistoryHeader } from "./history/ChatHistoryHeader";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainChatHistoryProps {
  sessionToken: string | null;
  botId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId: string | null;
  isOpen: boolean;
  onClose: () => void;
  setSelectedBotId: (id: string) => void;
}

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
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [groupedChats, setGroupedChats] = useState<Record<string, any[]>>({});

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

  const { data: chatHistory = [], isLoading } = useQuery({
    queryKey: ['chatHistory', botId, sessionToken],
    queryFn: async () => {
      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('deleted', 'no')
        .order('created_at', { ascending: false });

      if (botId) {
        query = query.eq('bot_id', botId);
      }
      if (sessionToken) {
        query = query.eq('session_token', sessionToken);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const grouped = chatHistory.reduce((acc: Record<string, any[]>, chat: any) => {
      const date = new Date(chat.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(chat);
      return acc;
    }, {});
    setGroupedChats(grouped);
  }, [chatHistory]);

  const AdminNavigation = () => {
    if (!isSuperAdmin && !isAdmin) return null;

    return (
      <div className="flex flex-col space-y-2 px-4 py-2">
        {(isSuperAdmin || isAdmin) && (
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate('/bots')}
          >
            <Bot className="h-4 w-4 mr-2" />
            Bots
          </Button>
        )}
        
        {isSuperAdmin && (
          <>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/folders')}
            >
              <Folder className="h-4 w-4 mr-2" />
              Folders
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/subscriptions')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Subscriptions
            </Button>
          </>
        )}

        {(isSuperAdmin || isAdmin) && (
          <>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/users')}
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/archive')}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 w-80 bg-muted/50 border-r",
        "transition-transform duration-300 ease-in-out transform",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "z-50"
      )}
    >
      <ChatHistoryHeader onClose={onClose} onNewChat={onNewChat} />
      {isMobile && <AdminNavigation />}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        {Object.entries(groupedChats).map(([date, chats]) => (
          <ChatHistoryGroup
            key={date}
            date={date}
            chats={chats}
            currentChatId={currentChatId}
            onSelectChat={onSelectChat}
            setSelectedBotId={setSelectedBotId}
          />
        ))}
      </ScrollArea>
    </div>
  );
};