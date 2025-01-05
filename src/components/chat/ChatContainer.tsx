import { useState } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/types/chatTypes";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatContainerProps {
  selectedBot: Bot | undefined;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  sendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatContainer = ({
  selectedBot,
  messages,
  isLoading,
  isStreaming,
  sendMessage,
  disabled,
}: ChatContainerProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="relative flex flex-col h-full">
      <div className="flex-1 overflow-hidden mt-14">
        {selectedBot ? (
          <MessageList
            messages={messages}
            selectedBot={selectedBot}
            starters={selectedBot.starters || []}
            onStarterClick={sendMessage}
            isLoading={isLoading}
            isStreaming={isStreaming}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a model to start chatting
          </div>
        )}
      </div>
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={sendMessage}
            disabled={!selectedBot || isLoading || isStreaming || disabled}
            isLoading={isLoading}
            placeholder={
              !selectedBot 
                ? "Select a model to start chatting" 
                : disabled
                ? "Usage limit reached"
                : isLoading || isStreaming 
                  ? "Please wait..." 
                  : "Type your message..."
            }
          />
        </div>
      </div>
    </div>
  );
};