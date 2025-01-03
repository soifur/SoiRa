import { Bot } from "@/components/chat/types/chatTypes";
import { ChatService } from "@/services/ChatService";

export const useMemoryContext = (
  bot: Bot,
  userContext: any,
  updateUserContext: (newContext: any) => Promise<void>
) => {
  const handleMemoryUpdate = async (messages: Array<{ role: string; content: string }>) => {
    if (!bot.memory_enabled || !bot.apiKey || !bot.instructions) {
      return;
    }

    try {
      const userMessages = messages.filter(msg => msg.role === "user");
      
      const contextUpdatePrompt = `
${bot.instructions}

Previous context: ${JSON.stringify(userContext || {})}

User messages to analyze:
${userMessages.map(msg => msg.content).join('\n')}

Based on the above instructions, analyze these messages and update the user context.
IMPORTANT: Merge any new information with the existing context, don't replace it unless explicitly contradicted.
Return ONLY a valid JSON object with the merged context.`;

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

      // Extract JSON from the response
      const jsonMatch = newContextResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      let newContext;
      try {
        newContext = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        throw new Error("Invalid JSON format in memory bot response");
      }

      // Validate the required structure
      if (!newContext || typeof newContext !== 'object') {
        throw new Error("Invalid context structure");
      }

      // Initialize arrays if they don't exist
      const mergedContext = {
        name: newContext.name || userContext?.name || null,
        faith: newContext.faith || userContext?.faith || null,
        likes: [
          ...(Array.isArray(userContext?.likes) ? userContext.likes : []),
          ...(Array.isArray(newContext.likes) ? newContext.likes : [])
        ].filter((item, index, self) => 
          item && 
          item !== " " && 
          self.indexOf(item) === index
        ),
        topics: [
          ...(Array.isArray(userContext?.topics) ? userContext.topics : []),
          ...(Array.isArray(newContext.topics) ? newContext.topics : [])
        ].filter((item, index, self) => 
          item && 
          item !== " " && 
          self.indexOf(item) === index
        )
      };

      await updateUserContext(mergedContext);
    } catch (error) {
      console.error("Memory update failed:", error);
      // Don't throw the error to prevent breaking the chat flow
    }
  };

  return { handleMemoryUpdate };
};