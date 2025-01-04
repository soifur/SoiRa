import { Bot } from "@/components/chat/types/chatTypes";
import { ChatService } from "@/services/ChatService";

export const useMemoryContext = (
  bot: Bot,
  userContext: any,
  updateUserContext: (newContext: any) => Promise<void>
) => {
  const addContextToMessage = async (message: string, context: any) => {
    if (!bot.memory_enabled) {
      console.log("Memory not enabled for bot:", bot.id);
      return message;
    }

    if (!context || Object.keys(context).length === 0) {
      console.log("No context available, returning original message");
      return message;
    }

    const contextString = JSON.stringify(context);
    return `[Context: ${contextString}]\n\nUser message: ${message}`;
  };

  const updateMemoryFromResponse = async (response: string, currentContext: any) => {
    if (!bot.memory_enabled) {
      console.log("Memory not enabled for bot:", bot.id);
      return;
    }

    try {
      const contextUpdatePrompt = `
Based on this conversation, update the user context. Current context:
${JSON.stringify(currentContext || {})}

Assistant's last response:
${response}

Return ONLY a valid JSON object with this structure:
{
  "name": "string or null",
  "faith": "string or null",
  "likes": ["array of strings"],
  "topics": ["array of strings"]
}`;

      let newContextResponse;
      if (bot.model === "gemini") {
        newContextResponse = await ChatService.sendGeminiMessage(
          [{ role: "user", content: contextUpdatePrompt }],
          bot
        );
      } else {
        newContextResponse = await ChatService.sendOpenRouterMessage(
          [{ role: "user", content: contextUpdatePrompt }],
          bot
        );
      }

      const jsonMatch = newContextResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      let newContext;
      try {
        newContext = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("Parse error:", parseError);
        throw new Error("Invalid JSON format in memory bot response");
      }

      // Keep existing values if new ones are null or empty
      const mergedContext = {
        name: newContext.name || currentContext?.name || null,
        faith: newContext.faith || currentContext?.faith || null,
        likes: Array.from(new Set([
          ...(currentContext?.likes || []),
          ...(newContext.likes || [])
        ])).filter(item => item && item.trim() !== ""),
        topics: Array.from(new Set([
          ...(currentContext?.topics || []),
          ...(newContext.topics || [])
        ])).filter(item => item && item.trim() !== "")
      };

      console.log("Merged context:", mergedContext);
      await updateUserContext(mergedContext);
    } catch (error) {
      console.error("Memory update failed:", error);
    }
  };

  const handleMemoryUpdate = async (messages: Array<{ role: string; content: string }>) => {
    if (!bot.memory_enabled) {
      return;
    }

    try {
      const userMessages = messages.filter(msg => msg.role === "user");
      await updateMemoryFromResponse(userMessages[userMessages.length - 1].content, userContext);
    } catch (error) {
      console.error("Memory update failed:", error);
    }
  };

  return {
    handleMemoryUpdate,
    addContextToMessage,
    updateMemoryFromResponse
  };
};
