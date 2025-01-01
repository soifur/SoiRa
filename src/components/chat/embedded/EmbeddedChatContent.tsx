import { MessageList } from "../MessageList";
import { ChatInput } from "../ChatInput";
import { Bot } from "@/hooks/useBots";
import { Message } from "../MessageList";

interface EmbeddedChatContentProps {
  messages: Message[];
  bot: Bot;
  isLoading: boolean;
  hasConsent: boolean | null;
  input: string;
  onInputChange: (value: string) => void;
  onSend: (message: string) => void;
  onStarterClick: (starter: string) => void;
}

export const EmbeddedChatContent = ({
  messages,
  bot,
  isLoading,
  hasConsent,
  input,
  onInputChange,
  onSend,
  onStarterClick,
}: EmbeddedChatContentProps) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1">
        <MessageList
          messages={messages}
          selectedBot={bot}
          starters={bot.starters || []}
          onStarterClick={onStarterClick}
          isLoading={isLoading}
        />
      </div>
      <div className="w-full px-4 pb-4">
        <ChatInput
          onSend={onSend}
          disabled={isLoading || !hasConsent}
          isLoading={isLoading}
          placeholder={hasConsent === null ? "Accepting cookies..." : "Type your message..."}
          onInputChange={onInputChange}
          value={input}
        />
      </div>
    </div>
  );
};