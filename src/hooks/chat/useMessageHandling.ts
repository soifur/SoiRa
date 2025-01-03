import { useState } from "react";
import { Message } from "@/components/chat/types/chatTypes";
import { createMessage } from "@/utils/messageUtils";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/components/chat/types/chatTypes";
import { isValidBotModel } from "@/utils/typeValidation";
import { useToast } from "@/components/ui/use-toast";

export const useMessageHandling = (
  bot: Bot,
  messages: Message[],
  setMessages: (messages: Message[]) => void,
  userContext: any,
  updateUserContext: (newContext: any) => Promise<void>
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = { current: null as AbortController | null };

  const handleMemoryUpdate = async (updatedMessages: Message[], memoryBot: Bot) => {
    if (!bot.memory_enabled || !memoryBot.memory_instructions) return;

    try {
      const contextUpdatePrompt = `
Instructions for context extraction:
${memoryBot.memory_instructions}

Previous context: ${JSON.stringify(userContext || {})}

Conversation to analyze:
${updatedMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Based on the above instructions, analyze this conversation and update the user context.
Return ONLY a valid JSON object with the updated context.`;
      
      let newContextResponse;
      const memoryModel = memoryBot.memory_model || 'openrouter';
      
      if (memoryModel === "gemini") {
        newContextResponse = await ChatService.sendGeminiMessage([{ role: "user", content: contextUpdatePrompt }], {
          ...memoryBot,
          apiKey: memoryBot.memory_api_key,
          model: "gemini"
        });
      } else {
        newContextResponse = await ChatService.sendOpenRouterMessage([{ role: "user", content: contextUpdatePrompt }], {
          ...memoryBot,
          apiKey: memoryBot.memory_api_key,
          model: "openrouter"
        });
      }

      try {
        console.log("Memory bot response:", newContextResponse);
        const newContext = JSON.parse(newContextResponse);
        console.log("New context extracted:", newContext);
        await updateUserContext(newContext);
      } catch (parseError) {
        console.error("Error parsing context response:", parseError);
        toast({
          title: "Error",
          description: "Failed to update memory context. Invalid response format.",
          variant: "destructive",
        });
      }
    } catch (memoryError) {
      console.error("Error updating memory:", memoryError);
      toast({
        title: "Error",
        description: "Failed to update memory. Please check memory bot configuration.",
        variant: "destructive",
      });
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
      
      const loadingMessage = createMessage("assistant", "...", true, bot.avatar);
      setMessages([...newMessages, loadingMessage]);

      let botResponse = "";
      const contextMessages = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      if (bot.memory_enabled && userContext) {
        const contextPrompt = `Previous context about the user: ${JSON.stringify(userContext)}\n\nCurrent conversation:`;
        contextMessages.unshift({
          role: "system",
          content: contextPrompt
        });
      }

      if (bot.model === "gemini") {
        console.log("Sending message to Gemini API with context");
        botResponse = await ChatService.sendGeminiMessage(contextMessages, bot);
      } else if (bot.model === "openrouter") {
        console.log("Sending message to OpenRouter API with context");
        botResponse = await ChatService.sendOpenRouterMessage(
          contextMessages,
          bot,
          abortControllerRef.current.signal
        );
      }

      const botMessage = createMessage("assistant", botResponse, true, bot.avatar);
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

      if (bot.memory_enabled) {
        await handleMemoryUpdate(updatedMessages, bot);
      }

    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to process message",
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