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
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";

const Index = () => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const { sessionToken } = useSessionToken();
  const { toast } = useToast();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Fetch user's own bots and published shared bots
  const { data: allBots = [], isLoading: isLoadingBots } = useQuery({
    queryKey: ['bots-and-shared'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      
      // First get user's own bots if authenticated
      let userBots: BotType[] = [];
      if (session.session) {
        const { data: ownBots, error: ownBotsError } = await supabase
          .from('bots')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });
        
        if (ownBotsError) throw ownBotsError;
        
        userBots = ownBots.map((bot): BotType => ({
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

      // Then get published shared bots
      const { data: sharedBots, error: sharedBotsError } = await supabase
        .from('shared_bots')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (sharedBotsError) throw sharedBotsError;

      const transformedSharedBots: BotType[] = sharedBots.map(shared => ({
        id: shared.share_key,
        name: shared.bot_name,
        instructions: shared.instructions || "",
        starters: shared.starters || [],
        model: shared.model as BotType['model'],
        apiKey: "",
        openRouterModel: shared.open_router_model,
        avatar: shared.avatar,
        accessType: "public",
        memory_enabled: shared.memory_enabled,
        published: shared.published,
      }));

      // Combine and return both sets of bots
      return [...userBots, ...transformedSharedBots];
    },
  });

  // Effect to set the default bot on load
  useEffect(() => {
    if (allBots && allBots.length > 0 && !selectedBotId) {
      const defaultBot = allBots.find(bot => bot.default_bot);
      if (defaultBot) {
        setSelectedBotId(defaultBot.id);
      } else {
        // If no default bot, select the first available bot
        setSelectedBotId(allBots[0].id);
      }
    }
  }, [allBots, selectedBotId]);

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

  const {
    isExceeded,
    resetDate,
    currentUsage,
    maxUsage,
    limitType,
    checkSubscriptionLimits
  } = useSubscriptionLimits(selectedBotId);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
    checkSubscriptionLimits();
  };

  const handleChatSelect = (chatId: string) => {
    handleSelectChat(chatId);
    setShowHistory(false);
  };

  const LimitExceededMessage = () => (
    <div className="fixed bottom-24 left-0 right-0 p-4 bg-destructive/10 backdrop-blur">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <p className="text-sm text-destructive">
          You have exceeded your {limitType} limit of {maxUsage}.
          {resetDate && ` Access will be restored on ${resetDate.toLocaleDateString()}`}
        </p>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => setShowUpgradeModal(true)}
        >
          Upgrade Now
        </Button>
      </div>
    </div>
  );

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
                sendMessage={handleSendMessage}
                disabled={isExceeded}
                disabledReason={isExceeded ? "Usage limit exceeded" : undefined}
                onUpgradeClick={() => setShowUpgradeModal(true)}
              />
              {isExceeded && <LimitExceededMessage />}
            </div>
          </div>
        </div>
      </Card>
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
};

export default Index;