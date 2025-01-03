import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Bot } from "@/components/chat/types/chatTypes";
import { ChatService } from "@/services/ChatService";
import { useMemoryBotSettings } from "@/hooks/useMemoryBotSettings";

export const useMemoryContext = (
  bot: Bot,
  userContext: any,
  updateUserContext: (newContext: any) => Promise<void>
) => {
  const { settings: memorySettings } = useMemoryBotSettings();
  const { toast } = useToast();

  const handleMemoryUpdate = async (messages: Array<{ role: string; content: string }>) => {
    if (!bot.memory_enabled) {
      console.log("Memory not enabled for bot:", bot.id);
      return;
    }

    if (!memorySettings) {
      const error = new Error("Memory settings not configured");
      console.error(error.message);
      toast({
        title: "Error",
        description: "Memory settings not configured. Please configure memory settings first.",
        variant: "destructive",
      });
      throw error;
    }

    if (!memorySettings.api_key) {
      const error = new Error("Memory API key not configured");
      console.error(error.message);
      toast({
        title: "Error",
        description: "Memory API key not configured. Please configure memory settings first.",
        variant: "destructive",
      });
      throw error;
    }

    if (!memorySettings.instructions) {
      const error = new Error("Memory instructions not configured");
      console.error(error.message);
      toast({
        title: "Error",
        description: "Memory instructions not configured. Please configure memory settings first.",
        variant: "destructive",
      });
      throw error;
    }

    try {
      console.log("Updating memory with context:", userContext);
      
      const contextUpdatePrompt = `
${memorySettings.instructions}

Previous context: ${JSON.stringify(userContext || {})}

Conversation to analyze:
${messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Based on the above instructions, analyze this conversation and update the user context.
IMPORTANT: Merge any new information with the existing context, don't replace it unless explicitly contradicted.
Return ONLY a valid JSON object with the merged context.`;

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

      console.log("Memory bot configuration:", {
        ...memoryBot,
        apiKey: '[REDACTED]'
      });

      let newContextResponse;
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
        throw new Error("Failed to parse memory bot response");
      }
    } catch (memoryError) {
      console.error("Error updating memory:", memoryError);
      toast({
        title: "Error",
        description: memoryError instanceof Error ? memoryError.message : "Failed to update memory",
        variant: "destructive",
      });
      throw memoryError;
    }
  };

  return { handleMemoryUpdate };
};