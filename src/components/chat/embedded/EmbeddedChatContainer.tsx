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
  // Handle postMessage communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Accept messages from any origin for public embeds
      if (event.data?.type === "CHAT_MESSAGE") {
        onSend(event.data.message);
      }
    };

    window.addEventListener("message", handleMessage);

    // Send ready message to parent
    window.parent.postMessage({ type: "CHAT_READY" }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, [onSend]);

  // Send message updates to parent
  useEffect(() => {
    window.parent.postMessage(
      { 
        type: "CHAT_UPDATE", 
        messages: messages 
      }, 
      "*"
    );
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