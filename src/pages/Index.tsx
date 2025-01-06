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
import { useSidebarState } from "@/hooks/useSidebarState";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const { isOpen: showHistory, toggleSidebar: toggleHistory, setIsOpen: setShowHistory } = useSidebarState();
  const navigate = useNavigate();
  const { sessionToken } = useSessionToken();
  const { toast } = useToast();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isMobile = useIsMobile();

  // Query to get all published bots
  const { data: userBots = [], isLoading: isLoadingUserBots } = useQuery({
    queryKey: ['published-bots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bots:', error);
        toast({
          title: "Error",
          description: "Failed to load bots. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

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

  // Effect to set the default bot on load
  useEffect(() => {
    if (userBots && userBots.length > 0 && !selectedBotId) {
      const defaultBot = userBots.find(bot => bot.default_bot);
      if (defaultBot) {
        setSelectedBotId(defaultBot.id);
      } else if (userBots[0]) {
        setSelectedBotId(userBots[0].id);
      }
    }
  }, [userBots, selectedBotId]);

  const selectedBot = userBots.find(bot => bot.id === selectedBotId);

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
    if (!selectedBot) {
      toast({
        title: "No bot selected",
        description: "Please select a bot to start chatting",
        variant: "destructive",
      });
      return;
    }
    await sendMessage(message);
    checkSubscriptionLimits();
  };

  const handleChatSelect = (chatId: string) => {
    handleSelectChat(chatId);
    // Only close sidebar on mobile
    if (isMobile) {
      setShowHistory(false);
    }
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

  if (isLoadingUserBots) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Card className="w-full h-[100dvh] overflow-hidden relative">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
            <MainChatHeader
              selectedBotId={selectedBotId}
              setSelectedBotId={setSelectedBotId}
              bots={userBots}
              onNewChat={handleNewChat}
              onSignOut={handleSignOut}
              onToggleHistory={toggleHistory}
              showHistory={showHistory}
            />
            <MainChatHistory
              sessionToken={sessionToken}
              botId={selectedBotId}
              onSelectChat={handleChatSelect}
              onNewChat={handleNewChat}
              currentChatId={currentChatId}
              isOpen={showHistory}
              onClose={toggleHistory}
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
                showHistory={showHistory}
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