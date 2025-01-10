import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bot as BotType } from "@/hooks/useBots";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { MainChatHeader } from "@/components/chat/MainChatHeader";
import { MainChatHistory } from "@/components/chat/MainChatHistory";
import { MainChatContainer } from "@/components/chat/MainChatContainer";
import { useSessionToken } from "@/hooks/useSessionToken";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useIsMobile } from "@/hooks/use-mobile";
import { useModalTrigger } from "@/hooks/useModalTrigger";
import { EducationalModal } from "@/components/modals/EducationalModal";

const Index = () => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const { isOpen: showHistory, toggleSidebar: toggleHistory, setIsOpen: setShowHistory } = useSidebarState();
  const navigate = useNavigate();
  const { sessionToken } = useSessionToken();
  const { toast } = useToast();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isMobile = useIsMobile();
  const educationalModal = useModalTrigger();

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
    if (isMobile) {
      setShowHistory(false);
    }
  };

  const handleQuizComplete = async (quizInstructions: string) => {
    if (!selectedBot) return;

    const { data: bot } = await supabase
      .from('bots')
      .select('instructions')
      .eq('id', selectedBot.id)
      .single();

    const combinedInstructions = `${bot?.instructions || ''} ${quizInstructions}`.trim();
    await handleSendMessage("Let's start");
  };

  if (isLoadingUserBots) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col bg-background">
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
              onQuizComplete={handleQuizComplete}
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
            <MainChatContainer
              selectedBot={selectedBot}
              messages={messages}
              isLoading={isLoading}
              isStreaming={isStreaming}
              sendMessage={handleSendMessage}
              isExceeded={isExceeded}
              maxUsage={maxUsage}
              limitType={limitType}
              resetDate={resetDate}
              onUpgradeClick={() => setShowUpgradeModal(true)}
              showHistory={showHistory}
            />
          </div>
        </div>
      </Card>
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
      <EducationalModal
        isOpen={educationalModal.isOpen}
        onClose={educationalModal.closeModal}
        isLoading={educationalModal.isLoading}
        title="Welcome to SoiRa AI"
      >
        <div className="space-y-4">
          <p>Welcome to your AI assistant! Here are some tips to get started:</p>
          <ul className="list-disc pl-4 space-y-2">
            <li>Select a bot from the dropdown menu above</li>
            <li>Type your message in the chat input below</li>
            <li>View your chat history on the left sidebar</li>
          </ul>
        </div>
      </EducationalModal>
    </div>
  );
};

export default Index;
