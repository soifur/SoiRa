import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/types/chatTypes";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { LimitExceededMessage } from "@/components/chat/LimitExceededMessage";
import { MainChatHeader } from "@/components/chat/MainChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";

interface MainChatContainerProps {
  selectedBot: Bot | undefined;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  sendMessage: (message: string) => Promise<void>;
  isExceeded: boolean;
  maxUsage?: number;
  limitType?: string;
  resetDate?: Date;
  onUpgradeClick: () => void;
  showHistory: boolean;
}

export const MainChatContainer = ({
  selectedBot,
  messages,
  isLoading,
  isStreaming,
  sendMessage,
  isExceeded,
  maxUsage = 0,
  limitType = "",
  resetDate,
  onUpgradeClick,
  showHistory
}: MainChatContainerProps) => {
  return (
    <div className="main-chat-container">
      <div className="header-container">
        <MainChatHeader
          selectedBotId={selectedBot?.id}
          setSelectedBotId={() => {}}
          onNewChat={() => {}}
          onToggleHistory={() => {}}
          showHistory={showHistory}
        />
      </div>
      <div className="messages-container">
        <ChatContainer
          selectedBot={selectedBot}
          messages={messages}
          isLoading={isLoading}
          isStreaming={isStreaming}
          sendMessage={sendMessage}
          disabled={isExceeded}
          disabledReason={isExceeded ? "Usage limit exceeded" : undefined}
          onUpgradeClick={onUpgradeClick}
          showHistory={showHistory}
        />
      </div>
      <div className="input-container">
        <ChatInput
          onSend={sendMessage}
          disabled={!selectedBot || isExceeded}
          isLoading={isLoading}
          placeholder={
            isExceeded ? "Usage limit exceeded" :
            selectedBot ? "Type your message..." : 
            "Select a model to start chatting"
          }
          onUpgradeClick={onUpgradeClick}
        />
      </div>
      {isExceeded && (
        <LimitExceededMessage
          limitType={limitType}
          maxUsage={maxUsage}
          resetDate={resetDate}
          onUpgrade={onUpgradeClick}
        />
      )}
    </div>
  );
};