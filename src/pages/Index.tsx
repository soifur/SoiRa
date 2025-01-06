import { useEffect, useState } from "react";
import { MainChatHistory } from "@/components/chat/MainChatHistory";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useChat } from "@/hooks/useChat";
import { useBots } from "@/hooks/useBots";
import { useSession } from "@/hooks/useSession";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LimitExceededMessage } from "@/components/chat/LimitExceededMessage";
import { UpgradeModal } from "@/components/modals/UpgradeModal";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedBotId, setSelectedBotId] = useLocalStorage<string | null>("selectedBotId", null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const { sessionToken } = useSession();
  const isMobile = useIsMobile();

  const {
    messages,
    sendMessage: handleSendMessage,
    isLoading,
    isStreaming,
    handleNewChat,
    handleSelectChat,
  } = useChat(selectedBotId, sessionToken);

  const { bots } = useBots();
  const { isExceeded } = useUsageLimit();

  useEffect(() => {
    if (selectedBotId) {
      const bot = bots.find((b) => b.id === selectedBotId);
      if (bot) {
        // No need to setSelectedBot since we're using selectedBotId directly
        console.log("Selected bot:", bot);
      }
    }
  }, [selectedBotId, bots]);

  const onNewChat = () => {
    handleNewChat();
    setCurrentChatId(null);
    if (isMobile) {
      setIsHistoryOpen(false);
    }
  };

  const onSelectChat = (chatId: string) => {
    handleSelectChat(chatId);
    setCurrentChatId(chatId);
    if (isMobile) {
      setIsHistoryOpen(false);
    }
  };

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <MainChatHistory
        sessionToken={sessionToken}
        botId={selectedBotId}
        onSelectChat={onSelectChat}
        onNewChat={onNewChat}
        currentChatId={currentChatId}
        isOpen={isHistoryOpen}
        onClose={toggleHistory}
        setSelectedBotId={setSelectedBotId}
      />
      <div className="flex-1 relative overflow-hidden">
        <div className="w-full h-full relative">
          <ChatContainer
            selectedBot={bots.find(b => b.id === selectedBotId)}
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            sendMessage={handleSendMessage}
            disabled={isExceeded}
            disabledReason={isExceeded ? "Usage limit exceeded" : undefined}
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />
        </div>
        {isExceeded && <LimitExceededMessage />}
      </div>
      
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
};

export default Index;