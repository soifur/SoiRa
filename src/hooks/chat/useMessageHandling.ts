import { useState } from "react";
import { Message } from "@/components/chat/types/chatTypes";
import { createMessage } from "@/utils/messageUtils";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/components/chat/types/chatTypes";
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

  const handleMemoryUpdate = async (updatedMessages: Message[]) => {
    if (bot.memory_enabled !== true || !bot.memory_instructions) {
      console.log("Memory not enabled or no instructions provided for bot:", bot.id);
      return;
    }

    try {
      console.log("Updating memory with context:", userContext);
      console.log("Using memory instructions:", bot.memory_instructions);
      console.log("Using memory model:", bot.memory_model);
      
      const contextUpdatePrompt = `
Instructions for context extraction:
${bot.memory_instructions}

Previous context: ${JSON.stringify(userContext || {})}

Conversation to analyze:
${updatedMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Based on the above instructions, analyze this conversation and update the user context.
IMPORTANT: Merge any new information with the existing context, don't replace it unless explicitly contradicted.
Return ONLY a valid JSON object with the merged context.`;

      let newContextResponse;
      
      if (bot.memory_model === "gemini") {
        newContextResponse = await ChatService.sendGeminiMessage([{ role: "user", content: contextUpdatePrompt }], {
          ...bot,
          apiKey: bot.memory_api_key || bot.apiKey,
          model: "gemini"
        });
      } else if (bot.model === "openrouter") {
        // For OpenRouter models, use the specific model ID from memory_model
        newContextResponse = await ChatService.sendOpenRouterMessage([{ role: "user", content: contextUpdatePrompt }], {
          ...bot,
          apiKey: bot.memory_api_key || bot.apiKey,
          model: "openrouter",
          openRouterModel: bot.memory_model
        });
      } else {
        console.log("Unsupported memory model configuration");
        return;
      }

      try {
        console.log("Memory bot raw response:", newContextResponse);
        const jsonMatch = newContextResponse.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : newContextResponse;
        const newContext = JSON.parse(jsonStr);
        
        // Merge new context with existing context
        const mergedContext = {
          ...(userContext || {}),
          ...newContext
        };
        
        console.log("New context extracted:", newContext);
        console.log("Merged context:", mergedContext);
        await updateUserContext(mergedContext);
      } catch (parseError) {
        console.error("Error parsing context response:", parseError);
        console.log("Failed to parse response:", newContextResponse);
      }
    } catch (memoryError) {
      console.error("Error updating memory:", memoryError);
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
          abortControllerRef.current.signal
        );
      }

      const botMessage = createMessage("assistant", botResponse, false, bot.avatar);
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

      if (bot.memory_enabled === true) {
        console.log("Updating memory after bot response");
        await handleMemoryUpdate(updatedMessages);
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