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

      console.log("Memory bot configuration:", bot);

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

      console.log("Memory bot raw response:", newContextResponse);

      // Extract JSON from the response
      const jsonMatch = newContextResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      let newContext;
      try {
        newContext = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("Failed to parse memory bot response:", parseError);
        throw new Error("Invalid JSON format in memory bot response");
      }

      // Validate the required structure
      if (!newContext || typeof newContext !== 'object') {
        throw new Error("Invalid context structure");
      }

      if (!Array.isArray(newContext.likes) || !Array.isArray(newContext.topics)) {
        throw new Error("Invalid context format: missing required arrays");
      }

      // Merge with existing context
      const mergedContext = {
        name: newContext.name || userContext?.name || "null",
        faith: newContext.faith || userContext?.faith || " ",
        likes: [...new Set([...(userContext?.likes || []), ...newContext.likes])].filter(item => item !== " "),
        topics: [...new Set([...(userContext?.topics || []), ...newContext.topics])].filter(item => item !== " ")
      };

      console.log("New context extracted:", newContext);
      console.log("Merged context:", mergedContext);

      await updateUserContext(mergedContext);
    } catch (error) {
      console.error("Memory update failed:", error);
      // Don't throw the error to prevent breaking the chat flow
    }
  };

  return { handleMemoryUpdate };
};