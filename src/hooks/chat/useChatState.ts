import { useState, useCallback } from 'react';
import { Bot } from '@/hooks/useBots';
import { Message } from '@/components/chat/MessageList';
import { ChatService } from '@/services/ChatService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Json } from '@/integrations/supabase/types';

export const useChatState = (selectedBot: Bot | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(async (message: string) => {
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
      const userMessage = {
        id: uuidv4(),
        role: "user",
        content: message,
        timestamp: new Date(),
      } as Message;

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      const streamingMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        avatar: selectedBot.avatar,
      } as Message;

      setMessages([...newMessages, streamingMessage]);
      setIsStreaming(true);

      let response: string = "";

      if (selectedBot.model === "openrouter") {
        await ChatService.sendOpenRouterMessage(
          newMessages,
          selectedBot,
          undefined,
          (chunk: string) => {
            response += chunk;
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: response }
                ];
              }
              return prev;
            });
          }
        );
      } else if (selectedBot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(newMessages, selectedBot);
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: response }
            ];
          }
          return prev;
        });
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const messagesForDb = [...newMessages, { ...streamingMessage, content: response }].map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp?.toISOString(),
          id: msg.id,
          avatar: msg.avatar
        }));

        const chatData = {
          bot_id: selectedBot.id,
          messages: messagesForDb as Json,
          user_id: user.id,
          sequence_number: 1,
          updated_at: new Date().toISOString()
        };

        await supabase
          .from('chat_history')
          .insert([chatData]);
      }

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
  }, [messages, selectedBot, toast]);

  return { messages, isLoading, isStreaming, sendMessage };
};