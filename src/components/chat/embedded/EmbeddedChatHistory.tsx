import { ChatHistory } from "../ChatHistory";
import { Bot } from "@/hooks/useBots";
import { Message } from "../MessageList";

interface EmbeddedChatHistoryProps {
  messages: Message[];
  bot: Bot;
  onLoadChat: (messages: Message[]) => void;
  show: boolean;
}

export const EmbeddedChatHistory = ({ messages, bot, onLoadChat, show }: EmbeddedChatHistoryProps) => {
  if (!show) return null;

  return (
    <div className="absolute right-4 top-20 z-10 w-80">
      <ChatHistory
        messages={messages}
        selectedBot={bot}
        onLoadChat={onLoadChat}
      />
    </div>
  );
};