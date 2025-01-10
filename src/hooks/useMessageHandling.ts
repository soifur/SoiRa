import { useState, useCallback } from "react";
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
  const { handleMemoryUpdate } = useMemoryContext(bot, "default-client", null);
  const abortControllerRef = { current: null as AbortController | null };

  const sendMessage = useCallback(async (message: string) => {
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

      console.log("Current memory_enabled status:", bot.memory_enabled);
      
      if (bot.memory_enabled === true) {
        console.log("Memory is explicitly TRUE, updating context");
        handleMemoryUpdate([userMessage]).catch(error => {
          console.error("Background memory update failed:", error);
        });
      }

      const contextMessages = [];

      if (bot.memory_enabled === true) {
        console.log("Memory is explicitly TRUE, adding context to message");
        
        const contextToSend = userContext ? {
          name: userContext.name || null,
          faith: userContext.faith || null,
          likes: Array.isArray(userContext.likes) ? [...userContext.likes] : [],
          topics: Array.isArray(userContext.topics) ? [...userContext.topics] : [],
          facts: Array.isArray(userContext.facts) ? [...userContext.facts] : []
        } : {
          name: null,
          faith: null,
          likes: [],
          topics: [],
          facts: []
        };
        
        console.log("Using context for message:", contextToSend);
        
        const contextPrompt = {
          role: "system",
          content: `Previous context about the user: ${JSON.stringify(contextToSend)}\n\nCurrent conversation:`
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

      const finalBotMessage = createMessage("assistant", botResponse, false, bot.avatar);
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
  }, [bot, messages, setMessages, userContext, handleMemoryUpdate, toast]);

  return {
    isLoading,
    sendMessage
  };
};