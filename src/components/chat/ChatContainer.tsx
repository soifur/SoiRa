import { useState } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/types/chatTypes";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ChatContainerProps {
  selectedBot: Bot | undefined;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  sendMessage: (message: string) => void;
  disabled?: boolean;
  disabledReason?: string;
  onUpgradeClick?: () => void;
  showHistory?: boolean;
}

export const ChatContainer = ({
  selectedBot,
  messages,
  isLoading,
  isStreaming,
  sendMessage,
  disabled,
  disabledReason,
  onUpgradeClick,
  showHistory
}: ChatContainerProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "relative flex flex-col h-full",
      "transition-[margin] duration-300 ease-in-out",
      !isMobile && showHistory && "ml-64" // Add margin when sidebar is open and not on mobile
    )}>
      <div className="flex-1 overflow-hidden mt-14">
        {selectedBot ? (
          <MessageList
            messages={messages}
            selectedBot={selectedBot}
            starters={selectedBot.starters || []}
            onStarterClick={disabled ? undefined : sendMessage}
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
      <ChatInput
        onSend={sendMessage}
        disabled={!selectedBot || disabled}
        isLoading={isLoading}
        placeholder={
          disabled ? disabledReason :
          selectedBot ? "Type your message..." : 
          "Select a model to start chatting"
        }
        onUpgradeClick={onUpgradeClick}
      />
    </div>
  );
};