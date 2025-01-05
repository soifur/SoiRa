import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/types/chatTypes";
import { createMessage } from "@/utils/messageUtils";
import { saveChatHistory, handleMessageSend } from "@/utils/chatOperations";
import { supabase } from "@/integrations/supabase/client";
import { useTokenUsage } from "@/hooks/useTokenUsage";

export const useChatOperations = (
  bot: Bot, 
  messages: Message[], 
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();
  const { checkTokenUsage } = useTokenUsage();

  const handleSendMessage = async (message: string, chatId: string) => {
    console.log("🚀 Starting message send process...");
    
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
        return false;
      }

      setIsLoading(true);
      setIsStreaming(true);

      const userMessage = createMessage("user", message);
      setMessages(prev => [...prev, userMessage]);

      console.log("📨 Sending message to bot...");
      const { response, newMessages: updatedMessages } = await handleMessageSend(
        message,
        messages,
        bot,
        (updatedMsgs: Message[]) => setMessages(updatedMsgs),
        (chunk: string) => {
          setMessages((prev) => {
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
      const tokensUsed = usageResult.limitType === 'tokens' ? 1 : 0;
      const messagesUsed = usageResult.limitType === 'messages' ? 1 : 0;

      await saveChatHistory(
        chatId,
        bot.id,
        [...updatedMessages, createMessage("assistant", response, true, bot.avatar)],
        nextSequenceNumber,
        messagesUsed,
        tokensUsed
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