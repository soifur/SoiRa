import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";
import { Bot } from "@/hooks/useBots";
import { useToast } from "@/components/ui/use-toast";

interface UseEmbeddedChatState {
  messages: Message[];
  isLoading: boolean;
  userScrolled: boolean;
  setUserScrolled: (scrolled: boolean) => void;
  handleSend: (message: string) => Promise<void>;
  handleClearChat: () => Promise<void>;
  handleStarterClick: (starter: string) => void;
}

export const useEmbeddedChatState = (
  bot: Bot,
  shareKey: string | undefined,
  initialMessages: Message[] = []
): UseEmbeddedChatState => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const { toast } = useToast();

  const saveChatHistory = useCallback(async (newMessages: Message[]) => {
    if (!shareKey || !bot) return;

    try {
      const messageData = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp?.toISOString()
      }));

      const { data: existingChat } = await supabase
        .from('chat_history')
        .select('id')
        .eq('share_key', shareKey)
        .single();

      if (existingChat) {
        await supabase
          .from('chat_history')
          .update({ 
            messages: messageData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingChat.id);
      } else {
        await supabase
          .from('chat_history')
          .insert({
            bot_id: bot.id,
            share_key: shareKey,
            messages: messageData
          });
      }
    } catch (error) {
      console.error('Error saving chat history:', error);
      toast({
        title: "Error",
        description: "Failed to save chat history",
        variant: "destructive",
      });
    }
  }, [shareKey, bot, toast]);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    const newMessage = { role: "user", content: message, timestamp: new Date() };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    await saveChatHistory(updatedMessages);

    try {
      setIsLoading(true);
      let response: string;
      switch (bot.model) {
        case "gemini":
          response = await sendGeminiMessage(updatedMessages, bot);
          break;
        case "claude":
          response = await sendClaudeMessage(updatedMessages, bot);
          break;
        case "openai":
          response = await sendOpenAIMessage(updatedMessages, bot);
          break;
        case "openrouter":
          response = await sendOpenRouterMessage(updatedMessages, bot);
          break;
        default:
          throw new Error("Invalid model selected");
      }

      const botResponse = { role: "assistant", content: response, timestamp: new Date() };
      const newMessages = [...updatedMessages, botResponse];
      setMessages(newMessages);
      await saveChatHistory(newMessages);
      setUserScrolled(false);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    setMessages([]);
    await saveChatHistory([]);
  };

  const handleStarterClick = (starter: string) => {
    handleSend(starter);
  };

  return {
    messages,
    isLoading,
    userScrolled,
    setUserScrolled,
    handleSend,
    handleClearChat,
    handleStarterClick,
  };
};
