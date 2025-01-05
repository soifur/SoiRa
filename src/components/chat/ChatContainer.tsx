import React from "react";
import { Bot as BotType } from "@/hooks/useBots";
import { Message } from "@/hooks/useChat";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";

interface ChatContainerProps {
  selectedBot: BotType | undefined;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  sendMessage: (message: string) => void;
  disabled?: boolean;
  disabledReason?: string;
  onUpgradeClick?: () => void;
}

export const ChatContainer = ({
  selectedBot,
  messages,
  isLoading,
  isStreaming,
  sendMessage,
  disabled,
  disabledReason,
  onUpgradeClick
}: ChatContainerProps) => {
  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <MessageList
        messages={messages}
        isLoading={isLoading}
        isStreaming={isStreaming}
      />
      <div className="p-4 md:p-6">
        <ChatInput
          onSend={sendMessage}
          disabled={disabled || !selectedBot}
          placeholder={disabledReason || (!selectedBot ? "Select a bot to start chatting" : undefined)}
          isLoading={isLoading}
          onUpgradeClick={onUpgradeClick}
        />
      </div>
    </div>
  );
};
