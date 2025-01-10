import { useState, useCallback } from "react";
import { Message, Bot } from "@/components/chat/types/chatTypes";
import { createMessage } from "@/utils/messageUtils";
import { ChatService } from "@/services/ChatService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Json } from "@/integrations/supabase/types";
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

// Helper function to convert Message[] to Json
const messagesToJson = (messages: Message[]): Json => {
  return messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp?.toISOString()
  })) as Json;
};

// Helper function to convert Json to Message[]
const jsonToMessages = (json: Json): Message[] => {
  if (!Array.isArray(json)) return [];
  return json.map(msg => ({
    id: msg.id as string || uuidv4(),
    role: msg.role as "user" | "assistant",
    content: msg.content as string,
    timestamp: msg.timestamp ? new Date(msg.timestamp as string) : undefined
  }));
};

export const useChat = (selectedBot: Bot | null, sessionToken: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = { current: null as AbortController | null };

  const sendMessage = useCallback(async (message: string) => {
    if (!selectedBot) return;
    
    try {
      setIsLoading(true);
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();

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

      // Save chat history with proper type conversion
      if (currentChatId) {
        const { error: saveError } = await supabase
          .from('chat_history')
          .update({
            messages: messagesToJson(messages),
            updated_at: new Date().toISOString()
          })
          .eq('id', currentChatId);

        if (saveError) {
          console.error('Error saving chat history:', saveError);
          throw saveError;
        }
      }

      let botResponse = "";
      try {
        if (selectedBot.model === "gemini") {
          botResponse = await ChatService.sendGeminiMessage(newMessages, {
            ...selectedBot,
            ...botSettings
          });
        } else if (selectedBot.model === "openrouter") {
          botResponse = await ChatService.sendOpenRouterMessage(
            newMessages,
            {
              ...selectedBot,
              ...botSettings
            },
            abortControllerRef.current.signal,
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
        }

        if (!botResponse || botResponse.trim() === "") {
          throw new Error("The bot returned an empty response. Please try again or check your API configuration.");
        }

      } catch (error) {
        console.error("Error getting bot response:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to get response from the bot. Please try again.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setMessages(newMessages);
        return;
      }

      const finalBotMessage = createMessage("assistant", botResponse, false, selectedBot.avatar);
      setMessages([...newMessages, finalBotMessage]);

    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [selectedBot, messages, currentChatId, toast]);

  return {
    messages,
    isLoading,
    sendMessage
  };
};