import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bot } from "@/hooks/useBots";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useSessionToken } from "@/hooks/useSessionToken";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";
import { useTokenUsage } from "@/hooks/useTokenUsage";
import { ChatLayout } from "@/components/chat/ChatLayout";

const Index = () => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [canSendMessages, setCanSendMessages] = useState(true);
  const navigate = useNavigate();
  const { sessionToken } = useSessionToken();
  const { toast } = useToast();
  const { checkTokenUsage } = useTokenUsage();

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

  // Check usage limits whenever a bot is selected
  const handleBotSelect = async (botId: string) => {
    try {
      const usageResult = await checkTokenUsage(botId, 1);
      if (!usageResult.canProceed) {
        toast({
          title: "Usage Limit Reached",
          description: `You've reached your ${usageResult.resetPeriod} limit of ${usageResult.limit} ${usageResult.limitType}`,
          variant: "destructive",
        });
        setCanSendMessages(false);
      } else {
        setCanSendMessages(true);
      }
      setSelectedBotId(botId);
    } catch (error) {
      console.error('Error checking usage limits:', error);
      toast({
        title: "Error",
        description: "Failed to check usage limits",
        variant: "destructive",
      });
    }
  };

  // Set default bot on load and check its usage limits
  useEffect(() => {
    if (userBots && userBots.length > 0 && !selectedBotId) {
      const defaultBot = userBots.find(bot => bot.default_bot);
      if (defaultBot) {
        handleBotSelect(defaultBot.id);
      }
    }
  }, [userBots, selectedBotId]);

  const {
    messages,
    isLoading,
    isStreaming,
    currentChatId,
    handleNewChat,
    handleSelectChat,
    sendMessage
  } = useChat(userBots.find(bot => bot.id === selectedBotId), sessionToken);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Card className="w-full h-[100dvh] overflow-hidden relative">
        <div className="flex h-full">
          <ChatLayout
            selectedBotId={selectedBotId}
            setSelectedBotId={handleBotSelect}
            allBots={userBots}
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            currentChatId={currentChatId}
            handleNewChat={handleNewChat}
            handleSelectChat={handleSelectChat}
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