import { useState, useEffect } from "react";
import { Bot } from "@/hooks/useBots";
import { useSessionToken } from "@/hooks/useSessionToken";
import { useChat } from "@/hooks/useChat";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { MainChatHeader } from "@/components/chat/MainChatHeader";
import { MainChatHistory } from "@/components/chat/MainChatHistory";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";

interface MainChatProps {
  allBots: Bot[];
  isLoadingBots: boolean;
  onSignOut: () => void;
}

export const MainChat = ({ allBots, isLoadingBots, onSignOut }: MainChatProps) => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { sessionToken } = useSessionToken();

  // Effect to set the default bot on load
  useEffect(() => {
    if (allBots && allBots.length > 0 && !selectedBotId) {
      const defaultBot = allBots.find(bot => bot.default_bot);
      if (defaultBot) {
        setSelectedBotId(defaultBot.id);
      } else {
        setSelectedBotId(allBots[0].id);
      }
    }
  }, [allBots, selectedBotId]);

  const selectedBot = allBots.find(bot => bot.id === selectedBotId);

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
    <>
      <MainChatHeader
        selectedBotId={selectedBotId}
        setSelectedBotId={setSelectedBotId}
        bots={allBots}
        onNewChat={handleNewChat}
        onSignOut={onSignOut}
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
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  );
};