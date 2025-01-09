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
      "transition-all duration-300 ease-in-out",
      !isMobile && showHistory ? "ml-64" : "ml-0" // Add margin when sidebar is open and not on mobile
    )}>
      {/* Message List Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full pt-16 pb-16">
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
      </div>

      {/* Chat Input Container - Fixed at bottom with transition */}
      <div className={cn(
        "fixed bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t",
        "transition-all duration-300 ease-in-out",
        !isMobile && showHistory ? "left-64 right-0" : "left-0 right-0" // Move input container when sidebar is open
      )}>
        <div className="max-w-3xl mx-auto p-4">
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
      </div>
    </div>
  );
};