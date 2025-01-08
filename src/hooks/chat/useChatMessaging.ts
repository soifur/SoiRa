import { useCallback } from "react";
import { Message } from "@/components/chat/types/chatTypes";
import { Bot } from "@/hooks/useBots";

export const useChatMessaging = (
  messages: Message[],
  selectedBot: Bot | undefined,
  sendMessage: (message: string) => Promise<void>,
  isExceeded: boolean
) => {
  const handleSendMessage = useCallback(async (message: string) => {
    if (!selectedBot) return;
    await sendMessage(message);
  }, [selectedBot, sendMessage]);

  const isLoading = messages.length > 0 && messages[messages.length - 1].role === "user";
  const isStreaming = false; // This would be set by your streaming implementation

  const disabled = !selectedBot || isExceeded;
  const disabledReason = isExceeded ? "Usage limit exceeded" : !selectedBot ? "Select a model to start chatting" : "";

  return {
    isLoading,
    isStreaming,
    handleSendMessage,
    disabled,
    disabledReason
  };
};