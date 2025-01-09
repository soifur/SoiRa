import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bot } from "@/hooks/useBots";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { MainChatHeader } from "@/components/chat/MainChatHeader";
import { MainChatHistory } from "@/components/chat/MainChatHistory";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { LimitExceededMessage } from "@/components/chat/LimitExceededMessage";
import { useSessionToken } from "@/hooks/useSessionToken";
import { useChatState } from "@/hooks/chat/useChatState";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
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

  const { data: userBots = [], isLoading: isLoadingUserBots } = useQuery({
    queryKey: ['published-bots'],
    queryFn: async () => {
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
    }
  });

  const selectedBot = userBots.find(bot => bot.id === selectedBotId);
  const { messages, isLoading, isStreaming, sendMessage } = useChatState(selectedBot);
  const {
    isExceeded,
    resetDate,
    maxUsage,
    limitType,
    checkSubscriptionLimits
  } = useSubscriptionLimits(selectedBotId);

  useEffect(() => {
    if (userBots && userBots.length > 0 && !selectedBotId) {
      const defaultBot = userBots.find(bot => bot.default_bot);
      setSelectedBotId(defaultBot?.id || userBots[0].id);
    }
  }, [userBots, selectedBotId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

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
    if (isMobile) {
      setShowHistory(false);
    }
  };

  if (isLoadingUserBots) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col bg-background">
      <Card className="w-full h-[100dvh] overflow-hidden relative">
        <div className="h-full">
          <div className="relative w-full overflow-hidden">
            <MainChatHeader
              selectedBotId={selectedBotId}
              setSelectedBotId={setSelectedBotId}
              bots={userBots}
              onNewChat={() => {}}
              onSignOut={handleSignOut}
              onToggleHistory={toggleHistory}
              showHistory={showHistory}
            />
            <MainChatHistory
              sessionToken={sessionToken}
              botId={selectedBotId}
              onSelectChat={handleChatSelect}
              onNewChat={() => {}}
              currentChatId={null}
              isOpen={showHistory}
              onClose={toggleHistory}
              setSelectedBotId={setSelectedBotId}
            />
            <div className="h-full pt-16 pb-16">
              <MessageList
                messages={messages}
                selectedBot={selectedBot}
                starters={selectedBot?.starters || []}
                onStarterClick={handleSendMessage}
                isLoading={isLoading}
                isStreaming={isStreaming}
              />
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
              <div className="max-w-3xl mx-auto p-4">
                <ChatInput
                  onSend={handleSendMessage}
                  disabled={!selectedBot || isExceeded}
                  isLoading={isLoading}
                  placeholder={
                    isExceeded ? "Usage limit exceeded" :
                    selectedBot ? "Type your message..." : 
                    "Select a model to start chatting"
                  }
                  onUpgradeClick={() => setShowUpgradeModal(true)}
                />
              </div>
            </div>
            {isExceeded && (
              <LimitExceededMessage
                limitType={limitType}
                maxUsage={maxUsage}
                resetDate={resetDate}
                onUpgrade={() => setShowUpgradeModal(true)}
              />
            )}
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