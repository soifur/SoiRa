import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/types/chatTypes";
import { ChatContainer } from "@/components/chat/ChatContainer";
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
    // 1) Use min-h-screen so it can grow beyond one viewport if needed
    <div className="relative flex flex-col min-h-screen">
      {/* 2) ChatContainer handles pinned .chat-input internally */}
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

      {/* 3) If user has exceeded limit, overlay the limit message on top */}
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