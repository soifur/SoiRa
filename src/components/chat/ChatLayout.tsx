import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/types/chatTypes";
import { MainChatHeader } from "@/components/chat/MainChatHeader";
import { MainChatHistory } from "@/components/chat/MainChatHistory";
import { ChatContainer } from "@/components/chat/ChatContainer";

interface ChatLayoutProps {
  selectedBotId: string | null;
  setSelectedBotId: (id: string | null) => void;
  allBots: Bot[];
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  currentChatId: string | null;
  handleNewChat: () => void;
  handleSelectChat: (chatId: string) => void;
  sendMessage: (message: string) => void;
  onSignOut: () => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  canSendMessages: boolean;
}

export const ChatLayout = ({
  selectedBotId,
  setSelectedBotId,
  allBots,
  messages,
  isLoading,
  isStreaming,
  currentChatId,
  handleNewChat,
  handleSelectChat,
  sendMessage,
  onSignOut,
  showHistory,
  setShowHistory,
  canSendMessages,
}: ChatLayoutProps) => {
  const selectedBot = allBots.find(bot => bot.id === selectedBotId);

  return (
    <div className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
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
        sessionToken={null} // We'll handle this in the parent
        botId={selectedBotId}
        onSelectChat={handleSelectChat}
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
  );
};