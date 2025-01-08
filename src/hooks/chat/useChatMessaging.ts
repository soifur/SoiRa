import { useState } from "react";
import { Message } from "@/components/chat/types/chatTypes";
import { Bot } from "@/hooks/useBots";
import { useToast } from "@/components/ui/use-toast";

export const useChatMessaging = (
  messages: Message[],
  selectedBot: Bot | undefined,
  sendMessage: (message: string) => Promise<void>,
  isExceeded: boolean,
  disabledReason?: string
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (message: string) => {
    if (!selectedBot) {
      toast({
        title: "No bot selected",
        description: "Please select a bot to start chatting",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setIsStreaming(true);
      await sendMessage(message);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return {
    isLoading,
    isStreaming,
    handleSendMessage,
    disabled: !selectedBot || isExceeded,
    disabledReason: isExceeded ? "Usage limit exceeded" : disabledReason
  };
};