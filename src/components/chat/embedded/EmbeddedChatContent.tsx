import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/MessageList";

interface EmbeddedChatContentProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string) => void;
  bot: Bot;
  onStarterClick?: (starter: string) => void;
}

export const EmbeddedChatContent = ({
  messages,
  isLoading,
  onSend,
  bot,
  onStarterClick
}: EmbeddedChatContentProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          selectedBot={bot}
          starters={bot.starters}
          onStarterClick={onStarterClick}
          isLoading={isLoading}
        />
      </div>
      <div className="p-4">
        <ChatInput
          onSend={onSend}
          disabled={isLoading}
          isLoading={isLoading}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
};