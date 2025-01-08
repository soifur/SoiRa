import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/types/chatTypes";
import { LimitExceededMessage } from "@/components/chat/LimitExceededMessage";
import { useChatLayout } from "@/hooks/chat/useChatLayout";
import { useChatMessaging } from "@/hooks/chat/useChatMessaging";

interface ChatLayoutProps {
  selectedBot: Bot | undefined;
  messages: Message[];
  sendMessage: (message: string) => Promise<void>;
  isExceeded: boolean;
  maxUsage?: number;
  limitType?: string;
  resetDate?: Date;
  onUpgradeClick: () => void;
  showHistory: boolean;
}

export const ChatLayout = ({
  selectedBot,
  messages,
  sendMessage,
  isExceeded,
  maxUsage = 0,
  limitType = "",
  resetDate,
  onUpgradeClick,
  showHistory
}: ChatLayoutProps) => {
  const { layoutClasses } = useChatLayout(showHistory);
  const { isLoading, isStreaming, handleSendMessage, disabled, disabledReason } = 
    useChatMessaging(messages, selectedBot, sendMessage, isExceeded);

  return (
    <div className="fixed top-14 left-0 right-0 bottom-0 overflow-hidden bg-background">
      <div className={`h-full transition-[margin] duration-300 ease-in-out ${showHistory ? 'ml-64' : 'ml-0'}`}>
        <div className="flex-1 overflow-hidden">
          <div className="h-full pt-4 pb-16">
            {selectedBot ? (
              <MessageList
                messages={messages}
                selectedBot={selectedBot}
                starters={selectedBot.starters || []}
                onStarterClick={disabled ? undefined : handleSendMessage}
                isLoading={isLoading}
                isStreaming={isStreaming}
                disabled={disabled}
                disabledReason={disabledReason}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a model to start chatting
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t transition-[margin] duration-300 ease-in-out">
          <div className={`max-w-3xl mx-auto p-4 ${showHistory ? 'ml-64' : 'ml-0'}`}>
            <ChatInput
              onSend={handleSendMessage}
              disabled={disabled}
              isLoading={isLoading}
              placeholder={
                disabled ? disabledReason :
                selectedBot ? "Type your message..." : 
                "Select a model to start chatting"
              }
              onUpgradeClick={onUpgradeClick}
            />
          </div>
        </div>
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