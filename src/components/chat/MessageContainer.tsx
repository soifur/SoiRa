import { Message } from "./MessageList";
import { ChatMessage } from "./ChatMessage";

interface MessageContainerProps {
  messages: Message[];
}

export const MessageContainer = ({ messages }: MessageContainerProps) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message.content}
          isBot={message.role === "assistant"}
          avatar={message.avatar}
        />
      ))}
    </div>
  );
};