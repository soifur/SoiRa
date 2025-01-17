import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/types/chatTypes";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { LimitExceededMessage } from "@/components/chat/LimitExceededMessage";

interface MainChatContainerProps {
  selectedBot: Bot | undefined;
  messages: Message[];
  isLoading: boolean;
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
  sendMessage,
  isExceeded,
  maxUsage = 0,
  limitType = "",
  resetDate,
  onUpgradeClick,
  showHistory
}: MainChatContainerProps) => {
  return (
    <div className="flex-1 relative overflow-hidden">
      <ChatContainer
        selectedBot={selectedBot}
        messages={messages}
        isLoading={isLoading}
        sendMessage={sendMessage}
        disabled={isExceeded}
        disabledReason={isExceeded ? "Usage limit exceeded" : undefined}
        onUpgradeClick={onUpgradeClick}
        showHistory={showHistory}
      />
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