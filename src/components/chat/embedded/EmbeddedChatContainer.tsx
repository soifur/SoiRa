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
  const [parentOrigin, setParentOrigin] = useState<string>("");

  // Handle postMessage communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Store the origin of the parent window when receiving the first message
      if (!parentOrigin && event.origin) {
        setParentOrigin(event.origin);
      }

      // Only accept messages from the stored parent origin
      if (event.origin === parentOrigin && event.data?.type === "CHAT_MESSAGE") {
        onSend(event.data.message);
      }
    };

    window.addEventListener("message", handleMessage);

    // Send ready message to parent
    try {
      window.parent.postMessage({ type: "CHAT_READY" }, "*");
    } catch (error) {
      console.error("Failed to send ready message:", error);
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [onSend, parentOrigin]);

  // Send message updates to parent
  useEffect(() => {
    if (parentOrigin) {
      try {
        window.parent.postMessage(
          { 
            type: "CHAT_UPDATE", 
            messages: messages 
          }, 
          parentOrigin
        );
      } catch (error) {
        console.error("Failed to send message update:", error);
      }
    }
  }, [messages, parentOrigin]);

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