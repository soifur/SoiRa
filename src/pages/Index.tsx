import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bot as BotType } from "@/hooks/useBots";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { MainChatHeader } from "@/components/chat/MainChatHeader";
import { MainChatHistory } from "@/components/chat/MainChatHistory";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useSessionToken } from "@/hooks/useSessionToken";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/components/ui/use-toast";
import { useTokenUsage } from "@/hooks/useTokenUsage";

const Index = () => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [canSendMessages, setCanSendMessages] = useState(true);
  const navigate = useNavigate();
  const { sessionToken } = useSessionToken();
  const { toast } = useToast();
  const { checkTokenUsage } = useTokenUsage();

  const { data: userBots = [], isLoading: isLoadingUserBots } = useQuery({
    queryKey: ['bots'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated session");

      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      return data.map((bot): BotType => ({
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
    }
  });

  // Effect to check token usage when a bot is selected
  useEffect(() => {
    const checkUsage = async () => {
      if (selectedBotId) {
        const selectedBot = allBots.find(bot => bot.id === selectedBotId);
        if (selectedBot) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            const usageResult = await checkTokenUsage(selectedBot.id, 1);
            setCanSendMessages(usageResult.canProceed);
            
            if (!usageResult.canProceed) {
              toast({
                title: "Usage Limit Reached",
                description: `You've reached your ${usageResult.resetPeriod} limit of ${usageResult.limit} ${usageResult.limitType}`,
                variant: "destructive",
              });
            }
          }
        }
      }
    };

    checkUsage();
  }, [selectedBotId, toast, checkTokenUsage]);

  // Effect to set the default bot on load
  useEffect(() => {
    if (userBots && userBots.length > 0 && !selectedBotId) {
      const defaultBot = userBots.find(bot => bot.default_bot);
      if (defaultBot) {
        setSelectedBotId(defaultBot.id);
      }
    }
  }, [userBots, selectedBotId]);

  const { data: sharedBots = [], isLoading: isLoadingSharedBots } = useQuery({
    queryKey: ['shared-bots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shared_bots')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const allBots = [
    ...(userBots || []),
    ...(sharedBots || []).map(shared => ({
      id: shared.share_key,
      name: `${shared.bot_name} (Shared)`,
      instructions: shared.instructions || "",
      starters: shared.starters || [],
      model: shared.model as BotType['model'],
      apiKey: "",
      openRouterModel: shared.open_router_model,
      avatar: shared.avatar,
      accessType: "public" as const,
      memory_enabled: shared.memory_enabled,
    }))
  ];

  const selectedBot = allBots.find(bot => bot.id === selectedBotId);

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
  } = useChat(selectedBot, sessionToken);

  const handleChatSelect = async (chatId: string) => {
    try {
      const { data: chat, error } = await supabase
        .from('chat_history')
        .select('bot_id')
        .eq('id', chatId)
        .single();

      if (error) throw error;

      if (chat && chat.bot_id) {
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
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Card className="w-full h-[100dvh] overflow-hidden relative">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
            <MainChatHeader
              selectedBotId={selectedBotId}
              setSelectedBotId={setSelectedBotId}
              bots={allBots}
              onNewChat={handleNewChat}
              onSignOut={handleSignOut}
              onToggleHistory={() => setShowHistory(!showHistory)}
              showHistory={showHistory}
            />
            <MainChatHistory
              sessionToken={sessionToken}
              botId={selectedBotId}
              onSelectChat={handleChatSelect}
              onNewChat={handleNewChat}
              currentChatId={currentChatId}
              isOpen={showHistory}
              onClose={() => setShowHistory(false)}
              setSelectedBotId={setSelectedBotId}
            />
            <div className="flex-1 relative overflow-hidden">
              <ChatContainer
                selectedBot={selectedBot}
                messages={messages}
                isLoading={isLoading}
                isStreaming={isStreaming}
                sendMessage={sendMessage}
                disabled={!canSendMessages}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;