import { useState, useEffect } from "react";
import { Bot } from "@/hooks/useBots";
import { Message } from "@/types/chat";
import { EmbeddedChatHeader } from "./EmbeddedChatHeader";
import { EmbeddedChatMessages } from "./EmbeddedChatMessages";
import { ChatInput } from "../ChatInput";

interface EmbeddedChatContainerProps {
  bot: Bot;
  messages: Message[];
  userScrolled: boolean;
  isLoading?: boolean;
  onScroll: () => void;
  onSend: (message: string) => void;
  onClearChat: () => void;
  onStarterClick: (starter: string) => void;
}

export const EmbeddedChatContainer = ({
  bot,
  messages,
  userScrolled,
  isLoading = false,
  onScroll,
  onSend,
  onClearChat,
  onStarterClick,
}: EmbeddedChatContainerProps) => {
  const [parentOrigin, setParentOrigin] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Store the parent origin on first message
      if (!parentOrigin) {
        setParentOrigin(event.origin);
      }

      // Handle chat messages
      if (event.data?.type === "CHAT_MESSAGE") {
        onSend(event.data.message);
      }
    };

    window.addEventListener("message", handleMessage);

    // Notify parent that chat is ready
    const sendReadyMessage = () => {
      try {
        window.parent.postMessage({ type: "CHAT_READY" }, "*");
      } catch (error) {
        console.error("Failed to send ready message:", error);
      }
    };

    // Send ready message periodically until parent responds
    const readyInterval = setInterval(sendReadyMessage, 1000);
    sendReadyMessage();

    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(readyInterval);
    };
  }, [onSend, parentOrigin]);

  // Send message updates to parent
  useEffect(() => {
    if (messages.length > 0) {
      try {
        window.parent.postMessage(
          { 
            type: "CHAT_UPDATE", 
            messages: messages 
          }, 
          "*"
        );
      } catch (error) {
        console.error("Failed to send message update:", error);
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <EmbeddedChatHeader bot={bot} onClearChat={onClearChat} />
      <EmbeddedChatMessages
        messages={messages}
        bot={bot}
        userScrolled={userScrolled}
        onScroll={onScroll}
        onStarterClick={onStarterClick}
      />
      <ChatInput onSend={onSend} disabled={isLoading} isLoading={isLoading} />
    </div>
  );
};