import { useState } from "react";
import { Message } from "@/components/chat/types/chatTypes";
import { createMessage } from "@/utils/messageUtils";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/components/chat/types/chatTypes";
import { useToast } from "@/components/ui/use-toast";
import { useMemoryContext } from "./memory/useMemoryContext";

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

      // Process memory if enabled
      if (bot.memory_enabled === true) {
        console.log("Memory enabled, updating context");
        handleMemoryUpdate([userMessage]).catch(error => {
          console.error("Memory update failed:", error);
        });
      }

      // Prepare messages with context if memory is enabled
      const contextMessages = [];
      if (bot.memory_enabled === true && userContext) {
        console.log("Adding memory context to message");
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
        console.error("Bot response error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to get response";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setMessages(newMessages);
        return;
      }

      const finalBotMessage = createMessage("assistant", botResponse, false, bot.avatar);
      setMessages([...newMessages, finalBotMessage]);

    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Request cancelled');
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
  };

  return {
    isLoading,
    sendMessage
  };
};