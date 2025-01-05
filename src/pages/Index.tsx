import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bot } from "@/hooks/useBots";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useSessionToken } from "@/hooks/useSessionToken";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/components/ui/use-toast";
import { useTokenUsage } from "@/hooks/useTokenUsage";
import { ChatLayout } from "@/components/chat/ChatLayout";

const Index = () => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [canSendMessages, setCanSendMessages] = useState(true);
  const navigate = useNavigate();
  const { sessionToken } = useSessionToken();
  const { toast } = useToast();

  // Fetch bots with error handling
  const { data: userBots = [], isLoading: isLoadingUserBots } = useQuery({
    queryKey: ['bots'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return [];

        const { data, error } = await supabase
          .from('bots')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;

        return data.map((bot): Bot => ({
          id: bot.id,
          name: bot.name,
          instructions: bot.instructions || "",
          starters: bot.starters || [],
          model: bot.model,
          apiKey: bot.api_key,
          openRouterModel: bot.open_router_model,
          avatar: bot.avatar,
          accessType: "private",
          memory_enabled: bot.memory_enabled,
          published: bot.published,
          default_bot: bot.default_bot,
        }));
      } catch (error) {
        console.error('Error fetching bots:', error);
        return [];
      }
    },
    retry: false,
  });

  // Fetch shared bots with error handling
  const { data: sharedBots = [] } = useQuery({
    queryKey: ['shared-bots'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('shared_bots')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching shared bots:', error);
        return [];
      }
    },
    retry: false,
  });

  const allBots = [
    ...(userBots || []),
    ...(sharedBots || []).map(shared => ({
      id: shared.share_key,
      name: `${shared.bot_name} (Shared)`,
      instructions: shared.instructions || "",
      starters: shared.starters || [],
      model: shared.model as Bot['model'],
      apiKey: "",
      openRouterModel: shared.open_router_model,
      avatar: shared.avatar,
      accessType: "public" as const,
      memory_enabled: shared.memory_enabled,
    }))
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const {
    messages,
    isLoading,
    isStreaming,
    currentChatId,
    handleNewChat,
    handleSelectChat,
    sendMessage
  } = useChat(allBots.find(bot => bot.id === selectedBotId), sessionToken);

  // Set default bot on load
  useState(() => {
    if (userBots && userBots.length > 0 && !selectedBotId) {
      const defaultBot = userBots.find(bot => bot.default_bot);
      if (defaultBot) {
        setSelectedBotId(defaultBot.id);
      }
    }
  });

  const handleChatSelect = async (chatId: string) => {
    try {
      const { data: chat } = await supabase
        .from('chat_history')
        .select('bot_id')
        .eq('id', chatId)
        .maybeSingle();

      if (chat?.bot_id) {
        const botExists = allBots.some(bot => bot.id === chat.bot_id);
        if (!botExists) {
          toast({
            title: "Bot not available",
            description: "The bot associated with this chat is not currently available.",
            variant: "destructive",
          });
          return;
        }
        
        setSelectedBotId(chat.bot_id);
        handleSelectChat(chatId);
      }
    } catch (error) {
      console.error('Error selecting chat:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Card className="w-full h-[100dvh] overflow-hidden relative">
        <div className="flex h-full">
          <ChatLayout
            selectedBotId={selectedBotId}
            setSelectedBotId={setSelectedBotId}
            allBots={allBots}
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            currentChatId={currentChatId}
            handleNewChat={handleNewChat}
            handleSelectChat={handleChatSelect}
            sendMessage={sendMessage}
            onSignOut={handleSignOut}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            canSendMessages={canSendMessages}
          />
        </div>
      </Card>
    </div>
  );
};

export default Index;