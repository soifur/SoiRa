import { useState, useCallback } from "react";
import { Message, MessageJson } from "@/components/chat/types/chatTypes";
import { createMessage } from "@/utils/messageUtils";
import { ChatService } from "@/services/ChatService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Json } from "@/integrations/supabase/types";
import { v4 as uuidv4 } from 'uuid';
import { Bot } from "@/hooks/useBots";

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
  console.log('Parsing bot settings from:', sharedBot);
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

const messagesToJson = (messages: Message[]): Json => {
  console.log('Converting messages to JSON:', messages);
  const jsonMessages = messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp?.toISOString()
  }));
  console.log('Converted JSON messages:', jsonMessages);
  return jsonMessages as unknown as Json;
};

const jsonToMessages = (json: Json): Message[] => {
  console.log('Converting JSON to messages:', json);
  if (!Array.isArray(json)) {
    console.warn('Invalid JSON format for messages:', json);
    return [];
  }
  
  const messages = json.map(msg => {
    if (typeof msg === 'object' && msg !== null) {
      const messageJson = msg as MessageJson;
      return {
        id: messageJson.id || uuidv4(),
        role: messageJson.role,
        content: messageJson.content || "",
        timestamp: messageJson.timestamp ? new Date(messageJson.timestamp) : undefined
      } as Message;
    }
    console.warn('Invalid message format:', msg);
    return null;
  }).filter((msg): msg is Message => msg !== null);
  
  console.log('Converted messages:', messages);
  return messages;
};

export const useChat = (selectedBot: Bot | null, sessionToken: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleNewChat = useCallback(async () => {
    console.log('Creating new chat');
    setMessages([]);
    setCurrentChatId(null);
    return null;
  }, []);

  const handleSelectChat = useCallback(async (chatId: string) => {
    console.log('Selecting chat:', chatId);
    try {
      const { data: chatData, error } = await supabase
        .from('chat_history')
        .select('messages')
        .eq('id', chatId)
        .single();

      if (error) throw error;

      if (chatData?.messages) {
        console.log('Loading chat messages:', chatData.messages);
        setMessages(jsonToMessages(chatData.messages));
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  }, [toast]);

  const sendMessage = useCallback(async (message: string) => {
    if (!selectedBot) {
      console.warn('No bot selected');
      return;
    }
    
    try {
      console.log('Sending message:', message);
      setIsLoading(true);
      
      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // Fetch shared bot settings
      console.log('Fetching bot settings for:', selectedBot.id);
      const { data: sharedBot, error: settingsError } = await supabase
        .from('shared_bots')
        .select('*')
        .eq('bot_id', selectedBot.id)
        .single();

      if (settingsError) {
        console.error('Failed to fetch bot settings:', settingsError);
        throw new Error('Failed to fetch bot settings');
      }

      console.log('Retrieved shared bot settings:', sharedBot);
      const botSettings = parseBotSettings(sharedBot);

      // Create a merged bot configuration
      const mergedBot = {
        ...selectedBot,
        ...botSettings,
        instructions: sharedBot.instructions || selectedBot.instructions,
        starters: sharedBot.starters || selectedBot.starters,
      };

      let botResponse = "";
      try {
        console.log('Processing message with model:', mergedBot.model);
        if (mergedBot.model === "gemini") {
          botResponse = await ChatService.sendGeminiMessage(newMessages, mergedBot);
        } else if (mergedBot.model === "openrouter") {
          botResponse = await ChatService.sendOpenRouterMessage(
            newMessages,
            mergedBot
          );
        } else {
          throw new Error(`Unsupported model type: ${mergedBot.model}`);
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
      const updatedMessages = [...newMessages, finalBotMessage];
      console.log('Final messages:', updatedMessages);
      setMessages(updatedMessages);

      if (currentChatId) {
        console.log('Updating existing chat:', currentChatId);
        const { error: saveError } = await supabase
          .from('chat_history')
          .update({
            messages: messagesToJson(updatedMessages),
            updated_at: new Date().toISOString()
          })
          .eq('id', currentChatId);

        if (saveError) {
          console.error('Error saving chat history:', saveError);
          throw saveError;
        }
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
    }
  }, [selectedBot, messages, currentChatId, toast]);

  return {
    messages,
    isLoading,
    currentChatId,
    handleNewChat,
    handleSelectChat,
    sendMessage
  };
};
