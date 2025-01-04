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
      console.log("Starting to send message");
      setIsLoading(true);
      
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();

      const userMessage = createMessage("user", message);
      setMessages(prev => [...prev, userMessage]);
      
      const botMessage = createMessage("assistant", "", true, bot.avatar);
      setMessages(prev => [...prev, botMessage]);

      // Start memory update in the background if enabled
      let memoryUpdatePromise;
      if (bot.memory_enabled === true) {
        memoryUpdatePromise = handleMemoryUpdate([...messages, userMessage]).catch(error => {
          console.error("Background memory update failed:", error);
        });
      }

      let botResponse = "";
      const contextMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      if (bot.memory_enabled === true && userContext) {
        console.log("Adding context to message:", userContext);
        const contextPrompt = {
          role: "system",
          content: `Previous context about the user: ${JSON.stringify(userContext)}\n\nCurrent conversation:`
        };
        contextMessages.unshift(contextPrompt);
      }

      console.log("Sending message to API with context:", contextMessages);

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

      const finalBotMessage = createMessage("assistant", botResponse, false, bot.avatar);
      setMessages(prev => [...prev.slice(0, -1), finalBotMessage]);

      // Wait for memory update to complete if it was started
      if (memoryUpdatePromise) {
        await memoryUpdatePromise;
      }

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
      // Remove the loading message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      console.log("Message handling completed");
    }
  };

  return {
    isLoading,
    sendMessage
  };
};