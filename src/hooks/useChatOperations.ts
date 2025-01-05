import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/types/chatTypes";
import { createMessage } from "@/utils/messageUtils";
import { saveChatHistory, handleMessageSend } from "@/utils/chatOperations";
import { supabase } from "@/integrations/supabase/client";
import { useTokenUsage } from "@/hooks/useTokenUsage";

export const useChatOperations = (bot: Bot, messages: Message[], setMessages: (messages: Message[]) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();
  const { checkTokenUsage } = useTokenUsage();

  const handleSendMessage = async (message: string, chatId: string) => {
    console.log("📨 Attempting to send message...");
    console.log("Message:", message);
    console.log("Bot ID:", bot.id);
    console.log("Chat ID:", chatId);
    
    if (!message.trim() || isLoading || isStreaming) {
      console.log("❌ Preventing message send due to loading state:", { 
        isEmpty: !message.trim(), 
        isLoading, 
        isStreaming
      });
      return;
    }

    try {
      console.log("🔍 Checking token usage before sending message");
      const usageResult = await checkTokenUsage(bot.id, 1);
      console.log("📊 Usage check result:", usageResult);
      
      if (!usageResult.canProceed) {
        console.log("❌ Token usage check failed - cannot proceed");
        toast({
          title: "Usage Limit Exceeded",
          description: `You've reached your ${usageResult.resetPeriod} limit of ${usageResult.limit} ${usageResult.limitType}.`,
          variant: "destructive",
        });
        return false;
      }

      setIsLoading(true);
      setIsStreaming(true);

      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      const { response, newMessages: updatedMessages } = await handleMessageSend(
        message,
        messages,
        bot,
        setMessages,
        (chunk: string) => {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === "assistant") {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: chunk }
              ];
            }
            return prev;
          });
        }
      );

      const { data: nextSequence } = await supabase
        .from('chat_history')
        .select('sequence_number')
        .eq('bot_id', bot.id)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .single();

      const nextSequenceNumber = (nextSequence?.sequence_number || 0) + 1;

      await saveChatHistory(
        chatId,
        bot.id,
        [...updatedMessages, createMessage("assistant", response, true, bot.avatar)],
        nextSequenceNumber,
        1
      );

      return true;
    } catch (error) {
      console.error("❌ Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response from AI",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return {
    isLoading,
    isStreaming,
    handleSendMessage
  };
};