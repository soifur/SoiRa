import { useState, useCallback } from "react";
import { Message, Bot } from "@/components/chat/types/chatTypes";
import { createMessage } from "@/utils/messageUtils";
import { ChatService } from "@/services/ChatService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface BotSettings {
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  response_format: { type: string; [key: string]: any };
  tool_config: any[];
  system_templates: any[];
  memory_enabled: boolean;
  memory_enabled_model: boolean;
}

export const useChat = (selectedBot: Bot | null, sessionToken: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const { toast } = useToast();

  const parseBotSettings = (sharedBot: any): BotSettings => {
    return {
      temperature: sharedBot.temperature ?? 1,
      top_p: sharedBot.top_p ?? 1,
      frequency_penalty: sharedBot.frequency_penalty ?? 0,
      presence_penalty: sharedBot.presence_penalty ?? 0,
      max_tokens: sharedBot.max_tokens ?? 4096,
      stream: sharedBot.stream ?? true,
      response_format: typeof sharedBot.response_format === 'string' 
        ? JSON.parse(sharedBot.response_format) 
        : sharedBot.response_format || { type: "text" },
      tool_config: typeof sharedBot.tool_config === 'string' 
        ? JSON.parse(sharedBot.tool_config) 
        : sharedBot.tool_config || [],
      system_templates: typeof sharedBot.system_templates === 'string' 
        ? JSON.parse(sharedBot.system_templates) 
        : sharedBot.system_templates || [],
      memory_enabled: sharedBot.memory_enabled ?? false,
      memory_enabled_model: sharedBot.memory_enabled_model ?? false
    };
  };

  const sendMessage = useCallback(async (message: string) => {
    if (!selectedBot) return;
    
    try {
      setIsLoading(true);
      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // Fetch shared bot settings
      const { data: sharedBot, error: settingsError } = await supabase
        .from('shared_bots')
        .select('*')
        .eq('bot_id', selectedBot.id)
        .single();

      if (settingsError || !sharedBot) {
        console.error('Failed to fetch bot settings:', settingsError);
        throw new Error('Failed to fetch bot settings');
      }

      const botSettings = parseBotSettings(sharedBot);
      let response = "";

      if (selectedBot.model === "openrouter") {
        setIsStreaming(true);
        response = await ChatService.sendOpenRouterMessage(
          newMessages,
          {
            ...selectedBot,
            ...botSettings
          },
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
        setIsStreaming(false);
      } else if (selectedBot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(newMessages, {
          ...selectedBot,
          ...botSettings
        });
        const botMessage = createMessage("assistant", response);
        setMessages([...newMessages, botMessage]);
      }

      // Save chat history
      if (currentChatId) {
        const { error: saveError } = await supabase
          .from('chat_history')
          .update({
            messages: messages,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentChatId);

        if (saveError) {
          console.error('Error saving chat history:', saveError);
          throw saveError;
        }
      }

    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [selectedBot, messages, currentChatId, toast]);

  const handleNewChat = async () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      const { data: chatHistory, error } = await supabase
        .from('chat_history')
        .select('messages')
        .eq('id', chatId)
        .single();

      if (error) throw error;

      if (chatHistory?.messages) {
        setMessages(chatHistory.messages as Message[]);
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  return {
    messages,
    isLoading,
    isStreaming,
    currentChatId,
    handleNewChat,
    handleSelectChat,
    sendMessage
  };
};