import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/types/chatTypes";
import { MainChatHeader } from "@/components/chat/MainChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";
import { LimitExceededMessage } from "@/components/chat/LimitExceededMessage";

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
    <div className="main-layout">
      <div className="header-container">
        <MainChatHeader
          selectedBot={selectedBot}
          messages={messages}
          isLoading={isLoading}
          showHistory={showHistory}
        />
      </div>

      <div className="messages-container">
        <MessageList
          messages={messages}
          selectedBot={selectedBot}
          starters={selectedBot?.starters || []}
          onStarterClick={!isExceeded ? sendMessage : undefined}
          isLoading={isLoading}
          isStreaming={isStreaming}
          disabled={isExceeded}
          disabledReason={isExceeded ? "Usage limit exceeded" : undefined}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <LimitExceededMessage
            limitType={limitType}
            maxUsage={maxUsage}
            resetDate={resetDate}
            onUpgrade={onUpgradeClick}
          />
        </div>
      )}
    </div>
  );
};