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
    if (!bot.memory_enabled) return;

    try {
      const contextUpdatePrompt = `Previous context: ${JSON.stringify(userContext || {})}\n\nConversation to analyze:\n${updatedMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\nExtract and update the user context based on this conversation. Return ONLY a JSON object with the updated context.`;
      
      let newContextResponse;
      const validatedModel = isValidBotModel(memoryBot.model) ? memoryBot.model : 'openrouter';
      
      if (validatedModel === "gemini") {
        newContextResponse = await ChatService.sendGeminiMessage([{ role: "user", content: contextUpdatePrompt }], memoryBot);
      } else {
        newContextResponse = await ChatService.sendOpenRouterMessage([{ role: "user", content: contextUpdatePrompt }], memoryBot);
      }

      try {
        const newContext = JSON.parse(newContextResponse);
        console.log("New context extracted:", newContext);
        await updateUserContext(newContext);
      } catch (parseError) {
        console.error("Error parsing context response:", parseError);
        toast({
          title: "Error",
          description: "Failed to update memory context",
          variant: "destructive",
        });
      }
    } catch (memoryError) {
      console.error("Error updating memory:", memoryError);
      toast({
        title: "Error",
        description: "Failed to update memory",
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
        const memoryBot: Bot = {
          id: bot.id,
          name: bot.name,
          instructions: bot.memory_instructions || "You are a context extraction bot. Extract and update the user context based on the conversation. Return ONLY a JSON object with the updated context.",
          starters: bot.starters,
          model: isValidBotModel(bot.memory_model || "") ? bot.memory_model as Bot["model"] : "openrouter",
          apiKey: bot.memory_api_key || "",
          avatar: bot.avatar,
          accessType: bot.accessType,
          memory_enabled: bot.memory_enabled,
          memory_instructions: bot.memory_instructions,
          memory_model: bot.memory_model,
          memory_api_key: bot.memory_api_key
        };
        await handleMemoryUpdate(updatedMessages, memoryBot);
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