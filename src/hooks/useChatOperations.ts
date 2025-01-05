import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/types/chatTypes";
import { createMessage } from "@/utils/messageUtils";
import { saveChatHistory, handleMessageSend } from "@/utils/chatOperations";
import { supabase } from "@/integrations/supabase/client";
import { useTokenUsage } from "@/hooks/useTokenUsage";

export const useChatOperations = (bot: Bot, messages: Message[], setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();
  const { checkTokenUsage } = useTokenUsage();

  const handleSendMessage = async (message: string, chatId: string) => {
    console.log("🚀 Starting message send process...");
    console.log("📝 Message:", message);
    console.log("🤖 Bot ID:", bot.id);
    console.log("💬 Chat ID:", chatId);
    console.log("📊 Current messages count:", messages.length);
    
    if (!message.trim() || isLoading || isStreaming) {
      console.log("❌ Message send prevented:", {
        emptyMessage: !message.trim(),
        isLoading,
        isStreaming
      });
      return false;
    }

    try {
      console.log("🔍 Checking token usage limits...");
      const usageResult = await checkTokenUsage(bot.id, 1);
      console.log("📊 Usage check result:", usageResult);
      
      if (!usageResult.canProceed) {
        console.log("❌ Usage limit exceeded - cannot send message");
        console.log("Current usage:", usageResult.currentUsage);
        console.log("Limit:", usageResult.limit);
        console.log("Reset period:", usageResult.resetPeriod);
        
        toast({
          title: "Usage Limit Exceeded",
          description: `You've reached your ${usageResult.resetPeriod} limit of ${usageResult.limit} ${usageResult.limitType}.`,
          variant: "destructive",
        });
        return false;
      }

      console.log("✅ Usage check passed - proceeding with message");
      setIsLoading(true);
      setIsStreaming(true);

      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      console.log("📨 Sending message to bot...");
      const { response, newMessages: updatedMessages } = await handleMessageSend(
        message,
        messages,
        bot,
        (updatedMsgs: Message[]) => setMessages(updatedMsgs),
        (chunk: string) => {
          setMessages((prev: Message[]) => {
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

      console.log("💾 Saving chat history...");
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

      console.log("✅ Message handling completed successfully");
      return true;
    } catch (error) {
      console.error("❌ Error in handleSendMessage:", error);
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