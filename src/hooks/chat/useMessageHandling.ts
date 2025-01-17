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
  const { handleMemoryUpdate } = useMemoryContext(bot, "default-client", null);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);

      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      
      const botMessage = createMessage("assistant", "", true, bot.avatar);
      setMessages([...newMessages, botMessage]);

      if (bot.memory_enabled === true) {
        console.log("Memory is explicitly TRUE, updating context");
        handleMemoryUpdate([userMessage]).catch(error => {
          console.error("Background memory update failed:", error);
        });
      }

      const contextMessages = [];

      if (bot.memory_enabled === true) {
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
        
        const contextPrompt = {
          role: "system" as const,
          content: `Previous context about the user: ${JSON.stringify(contextToSend)}\n\nCurrent conversation:`
        };
        contextMessages.push(contextPrompt);
      }

      contextMessages.push({
        role: "user" as const,
        content: message
      });

      let botResponse = "";
      try {
        if (bot.model === "gemini") {
          botResponse = await ChatService.sendGeminiMessage(contextMessages, bot);
        } else if (bot.model === "openrouter") {
          botResponse = await ChatService.sendOpenRouterMessage(contextMessages, bot);
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
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    sendMessage
  };
};