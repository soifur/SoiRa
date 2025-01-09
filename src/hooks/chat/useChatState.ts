import { useState, useCallback } from 'react';
import { Bot } from '@/hooks/useBots';
import { Message } from '@/components/chat/types/chatTypes';
import { ChatService } from '@/services/ChatService';
import { useToast } from '@/components/ui/use-toast';

export const useChatState = (selectedBot: Bot | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(async (message: string) => {
    if (!selectedBot || !message.trim()) return;

    try {
      setIsLoading(true);
      setIsStreaming(true);

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      const response = await ChatService.sendOpenRouterMessage(
        [userMessage],
        selectedBot,
        undefined,
        (chunk: string) => {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === "assistant") {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + chunk }
              ];
            }
            return prev;
          });
        }
      );

      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        avatar: selectedBot.avatar
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [selectedBot, toast]);

  return { messages, isLoading, isStreaming, sendMessage };
};