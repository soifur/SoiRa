import { useEffect } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { Bot } from "@/hooks/useBots";
import { useScrollBehavior } from "@/hooks/chat/useScrollBehavior";

interface DedicatedChatMessagesProps {
  messages: Array<{ role: string; content: string; timestamp?: Date; id: string; avatar?: string }>;
  isLoading: boolean;
  isStreaming: boolean;
  bot: Bot;
  onSend: (message: string) => Promise<void>;
  onQuizComplete?: (quizInstructions: string) => Promise<void>;
}

export const DedicatedChatMessages = ({
  messages,
  isLoading,
  isStreaming,
  bot,
  onSend,
  onQuizComplete
}: DedicatedChatMessagesProps) => {
  const { messagesEndRef, isNearBottom, scrollToBottom } = useScrollBehavior();

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages, isNearBottom, scrollToBottom]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <MessageList
        messages={messages}
        selectedBot={bot}
        starters={bot.starters}
        onStarterClick={onSend}
        isLoading={isLoading}
        isStreaming={isStreaming}
        onQuizComplete={onQuizComplete}
      />
      <div ref={messagesEndRef} />
    </div>
  );
};