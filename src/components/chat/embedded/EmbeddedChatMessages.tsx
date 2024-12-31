import { useRef, useEffect } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { Bot } from "@/hooks/useBots";
import { formatMessages } from "@/utils/messageUtils";

interface EmbeddedChatMessagesProps {
  messages: Array<{ role: string; content: string; timestamp?: Date }>;
  bot: Bot;
  userScrolled: boolean;
  onScroll: () => void;
}

export const EmbeddedChatMessages = ({ 
  messages, 
  bot, 
  userScrolled, 
  onScroll 
}: EmbeddedChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userScrolled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, userScrolled]);

  return (
    <div 
      className="flex-1 overflow-y-auto" 
      ref={chatContainerRef}
      onScroll={onScroll}
    >
      <MessageList
        messages={formatMessages(messages)}
        selectedBot={bot}
      />
      <div ref={messagesEndRef} />
    </div>
  );
};