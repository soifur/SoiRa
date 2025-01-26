import { useState } from "react";
import { Message } from "@/components/chat/types/chatTypes";
import { createMessage } from "@/utils/messageUtils";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/components/chat/types/chatTypes";
import { useToast } from "@/components/ui/use-toast";
import { useMemoryContext } from "./memory/useMemoryContext";
import { supabase } from "@/integrations/supabase/client";

export const useMessageHandling = (
  bot: Bot,
  messages: Message[],
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void,
  userContext: any,
  updateUserContext: (newContext: any) => Promise<void>
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { handleMemoryUpdate } = useMemoryContext(bot, userContext, updateUserContext);
  const abortControllerRef = { current: null as AbortController | null };

  const storeUserContext = async (message: string) => {
    try {
      // Get Memory Bot settings
      const { data: memorySettings } = await supabase
        .from('memory_bot_settings')
        .select('*')
        .maybeSingle();

      if (!memorySettings) {
        console.log("No memory settings found");
        return;
      }

      // Create Memory Bot configuration
      const memoryBot: Bot = {
        id: 'memory-bot',
        name: 'Memory Bot',
        model: memorySettings.model as any,
        apiKey: memorySettings.api_key,
        openRouterModel: memorySettings.open_router_model,
        instructions: memorySettings.instructions || "",
        starters: [], // Required by Bot type
        memory_enabled: false, // Prevent infinite loop
        accessType: "private" // Required by Bot type
      };

      // Send message to Memory Bot for context extraction
      const contextResponse = await ChatService.sendMemoryBotMessage(
        [{ role: "user", content: message }],
        memoryBot
      );

      if (!contextResponse) {
        console.log("No context response from Memory Bot");
        return;
      }

      try {
        const contextData = JSON.parse(contextResponse);
        console.log("Extracted context:", contextData);

        // Get user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No authenticated user found");
          return;
        }

        // Get client IP for session tracking
        const clientIp = await fetch('https://api.ipify.org?format=json')
          .then(response => response.json())
          .then(data => data.ip)
          .catch(() => null);

        // Store context in user_context table
        const { error: contextError } = await supabase
          .from('user_context')
          .upsert({
            client_id: user.id,
            bot_id: bot.id,
            user_id: user.id,
            context: contextData,
            session_token: clientIp,
            last_updated: new Date().toISOString()
          });

        if (contextError) {
          console.error("Error storing context:", contextError);
        }

      } catch (parseError) {
        console.error("Error parsing context response:", parseError);
      }
    } catch (error) {
      console.error("Error in storeUserContext:", error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();

      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      
      const botMessage = createMessage("assistant", "", true, bot.avatar);
      setMessages([...newMessages, botMessage]);

      // If memory is enabled, store context first
      if (bot.memory_enabled === true) {
        console.log("Memory enabled, storing context");
        await storeUserContext(message);
      }

      // Prepare messages with context if memory is enabled
      const contextMessages = [];
      if (bot.memory_enabled === true && userContext) {
        console.log("Adding memory context to message:", userContext);
        const contextPrompt = {
          role: "system",
          content: `Previous context about the user: ${JSON.stringify(userContext)}\n\nCurrent conversation:`
        };
        contextMessages.push(contextPrompt);
      }

      contextMessages.push({
        role: "user",
        content: message
      });

      let botResponse = "";
      try {
        if (bot.model === "gemini") {
          botResponse = await ChatService.sendGeminiMessage(contextMessages, bot);
        } else if (bot.model === "openrouter") {
          botResponse = await ChatService.sendOpenRouterMessage(
            contextMessages,
            bot,
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
        } else {
          throw new Error(`Unsupported model type: ${bot.model}`);
        }

        if (!botResponse || botResponse.trim() === "") {
          throw new Error("Empty response from bot");
        }

      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return "Message cancelled by user.";
        }
        throw error;
      }

      const finalBotMessage = createMessage("assistant", botResponse, false, bot.avatar);
      setMessages([...newMessages, finalBotMessage]);

    } catch (error) {
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
  };

  return {
    isLoading,
    sendMessage
  };
};