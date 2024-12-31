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
  const [isConnected, setIsConnected] = useState(false);

  // Handle postMessage communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Handle the initial connection message
      if (event.data?.type === "CONNECT_CHAT") {
        setIsConnected(true);
        try {
          window.parent.postMessage({ type: "CHAT_READY" }, event.origin);
        } catch (error) {
          console.error("Failed to send ready message:", error);
        }
        return;
      }

      // Handle chat messages
      if (event.data?.type === "CHAT_MESSAGE") {
        onSend(event.data.message);
      }
    };

    window.addEventListener("message", handleMessage);

    // Send initial connection request
    try {
      window.parent.postMessage({ type: "CHAT_INIT" }, "*");
    } catch (error) {
      console.error("Failed to send init message:", error);
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [onSend]);

  // Send message updates to parent only when connected
  useEffect(() => {
    if (isConnected) {
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
  }, [messages, isConnected]);

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