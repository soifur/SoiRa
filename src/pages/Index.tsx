import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MainChatHeader } from "@/components/chat/MainChatHeader";
import { MainChatHistory } from "@/components/chat/MainChatHistory";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useSessionToken } from "@/hooks/useSessionToken";
import { useBotsData } from "@/hooks/useBotsData";
import { useChatState } from "@/hooks/chat/useChatState";

const Index = () => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { sessionToken } = useSessionToken();
  const { allBots, isLoadingBots } = useBotsData();
  const { 
    messages, 
    isLoading, 
    isStreaming, 
    chatId,
    handleNewChat,
    handleSelectChat,
    handleSignOut,
    sendMessage
  } = useChatState(selectedBotId);

  const selectedBot = allBots.find(bot => bot.id === selectedBotId);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Card className="w-full h-[100dvh] overflow-hidden relative">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col h-full relative w-full">
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
              onSelectChat={handleSelectChat}
              onNewChat={handleNewChat}
              currentChatId={chatId}
              isOpen={showHistory}
              onClose={() => setShowHistory(false)}
              setSelectedBotId={setSelectedBotId}
            />
            <ChatContainer
              selectedBot={selectedBot}
              messages={messages}
              isLoading={isLoading}
              isStreaming={isStreaming}
              sendMessage={sendMessage}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;