import { Bot } from "@/components/chat/types/chatTypes";
import { ChatService } from "@/services/ChatService";
import { useMemoryBotSettings } from "@/hooks/useMemoryBotSettings";

export const useMemoryContext = (
  bot: Bot,
  userContext: any,
  updateUserContext: (newContext: any) => Promise<void>
) => {
  const { settings: memorySettings } = useMemoryBotSettings();

  const handleMemoryUpdate = async (messages: Array<{ role: string; content: string }>) => {
    if (!bot.memory_enabled || !memorySettings?.api_key || !memorySettings?.instructions) {
      return;
    }

    try {
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
        const jsonMatch = newContextResponse.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : newContextResponse;
        const newContext = JSON.parse(jsonStr);
        
        const mergedContext = {
          ...(userContext || {}),
          ...newContext
        };
        
        await updateUserContext(mergedContext);
      } catch (parseError) {
        throw new Error('Failed to parse memory bot response');
      }
    } catch (memoryError) {
      // Don't throw error to prevent breaking the chat flow
      console.error('Memory update failed:', memoryError);
    }
  };

  return { handleMemoryUpdate };
};