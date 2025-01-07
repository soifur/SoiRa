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
    <div className="h-full overflow-hidden relative">
      <div className="h-full overflow-y-auto">
        <MessageList
          messages={messages}
          selectedBot={bot}
          starters={bot.starters}
          onStarterClick={onStarterClick}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};