import { useRef, useEffect } from "react";
import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/types/chatTypes";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";

interface ChatContainerProps {
  selectedBot?: Bot;
  messages: Message[];
  isLoading: boolean;
  isStreaming?: boolean;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          isStreaming={isStreaming}
          bot={selectedBot}
        />
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ChatInput
          onSend={sendMessage}
          disabled={disabled}
          isLoading={isLoading}
          placeholder={disabledReason || "Type your message..."}
          onUpgradeClick={onUpgradeClick}
        />
      </div>
    </div>
  );
};