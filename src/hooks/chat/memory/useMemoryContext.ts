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
      console.log("No memory settings found, skipping memory update");
      return;
    }

    if (!memorySettings.api_key) {
      console.log("No memory API key configured, skipping memory update");
      return;
    }

    if (!memorySettings.instructions) {
      console.log("No memory instructions configured, skipping memory update");
      return;
    }

    try {
      console.log("Updating memory with context:", userContext);
      
      // Filter only user messages for analysis
      const userMessages = messages.filter(msg => msg.role === "user");
      
      const contextUpdatePrompt = `
${memorySettings.instructions}

Previous context: ${JSON.stringify(userContext || {})}

User messages to analyze:
${userMessages.map(msg => msg.content).join('\n')}

Based on the above instructions, analyze these messages and update the user context.
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
        // Don't throw error, just log it and continue
      }
    } catch (memoryError) {
      console.error("Error updating memory:", memoryError);
      // Don't throw error to prevent breaking the chat flow
      console.log("Continuing chat despite memory error");
    }
  };

  return { handleMemoryUpdate };
};