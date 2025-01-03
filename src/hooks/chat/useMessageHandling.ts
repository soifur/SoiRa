import { useState } from "react";
import { Message } from "@/components/chat/types/chatTypes";
import { createMessage } from "@/utils/messageUtils";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/components/chat/types/chatTypes";
import { useToast } from "@/components/ui/use-toast";
import { useMemoryBotSettings } from "@/hooks/useMemoryBotSettings";

export const useMessageHandling = (
  bot: Bot,
  messages: Message[],
  setMessages: (messages: Message[]) => void,
  userContext: any,
  updateUserContext: (newContext: any) => Promise<void>
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { settings: memorySettings } = useMemoryBotSettings();
  const { toast } = useToast();
  const abortControllerRef = { current: null as AbortController | null };

  const handleMemoryUpdate = async (updatedMessages: Message[]) => {
    if (!bot.memory_enabled || !memorySettings?.instructions) {
      console.log("Memory not enabled or no instructions available");
      return;
    }

    try {
      console.log("Updating memory with context:", userContext);
      console.log("Using memory instructions:", memorySettings.instructions);
      console.log("Using memory model:", memorySettings.model);
      
      const contextUpdatePrompt = `
Instructions for context extraction:
${memorySettings.instructions}

Previous context: ${JSON.stringify(userContext || {})}

Conversation to analyze:
${updatedMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Based on the above instructions, analyze this conversation and update the user context.
IMPORTANT: Merge any new information with the existing context, don't replace it unless explicitly contradicted.
Return ONLY a valid JSON object with the merged context.`;

      let newContextResponse;

      // Create a memory-specific bot configuration
      const memoryBot: Bot = {
        id: bot.id,
        name: bot.name,
        instructions: memorySettings.instructions,
        starters: [],
        model: memorySettings.model,
        apiKey: memorySettings.api_key,
        openRouterModel: memorySettings.open_router_model,
        avatar: bot.avatar,
        memory_enabled: true
      };

      if (!memorySettings.api_key) {
        console.error("No memory API key provided");
        return;
      }

      if (memoryBot.model === "gemini") {
        newContextResponse = await ChatService.sendGeminiMessage(
          [{ role: "user", content: contextUpdatePrompt }],
          memoryBot
        );
      } else {
        newContextResponse = await ChatService.sendOpenRouterMessage(
          [{ role: "user", content: contextUpdatePrompt }],
          memoryBot
        );
      }

      try {
        console.log("Memory bot raw response:", newContextResponse);
        const jsonMatch = newContextResponse.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : newContextResponse;
        const newContext = JSON.parse(jsonStr);
        
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
        console.log('Request was cancelled');
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