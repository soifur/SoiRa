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
      // Get only the last user message
      const lastUserMessage = messages.filter(msg => msg.role === "user").slice(-1)[0];
      if (!lastUserMessage) return;

      const contextUpdatePrompt = `
You are a context analyzer. Your task is to extract and maintain user context from conversations.

Previous context: ${JSON.stringify(userContext || {
  name: null,
  faith: null,
  likes: [],
  topics: [],
  facts: []
})}

User message to analyze:
${lastUserMessage.content}

Instructions:
${bot.instructions}

Based on the message, update the user context following these rules:
1. Extract the user's name if mentioned
2. Note any likes, interests, or positive mentions
3. Track topics they discuss
4. If user expresses dislike for something that was in their "likes" array, REMOVE it
5. Extract factual statements about the user (job, role, location, etc.)
6. Preserve existing context unless explicitly contradicted
7. Return ONLY a valid JSON object in this exact format:

{
  "name": "string or null",
  "faith": "string or null",
  "likes": ["array of strings"],
  "topics": ["array of strings"],
  "facts": ["array of strings"]
}

IMPORTANT: 
- Merge new information with existing context
- Keep previous values unless contradicted
- If user says they don't like something anymore, remove it from likes array
- Facts should be complete, clear statements about the user
- Return ONLY the JSON object, no other text
- Ensure all arrays exist even if empty`;

      let apiResponse: string;
      try {
        if (bot.model === "gemini") {
          apiResponse = await ChatService.sendGeminiMessage(
            [{ role: "user", content: contextUpdatePrompt }],
            bot
          );
        } else {
          apiResponse = await ChatService.sendOpenRouterMessage(
            [{ role: "user", content: contextUpdatePrompt }],
            bot
          );
        }

        if (typeof apiResponse !== 'string') {
          console.error("Invalid API response type:", typeof apiResponse);
          throw new Error("Invalid response type from API");
        }

        const cleanedResponse = apiResponse.trim();
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
          console.error("No valid JSON found in response:", cleanedResponse);
          throw new Error("Invalid response format from API");
        }

        let newContext;
        try {
          newContext = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error("Parse error:", parseError, "Response:", jsonMatch[0]);
          throw new Error("Invalid JSON format in memory bot response");
        }

        // Validate the required structure
        if (!newContext || typeof newContext !== 'object') {
          throw new Error("Invalid context structure");
        }

        // Ensure all required fields exist with proper types
        const mergedContext = {
          name: newContext.name || userContext?.name || null,
          faith: newContext.faith || userContext?.faith || null,
          likes: Array.isArray(newContext.likes) ? 
            [...new Set(newContext.likes)].filter(item => item && item.trim() !== "") : 
            userContext?.likes || [],
          topics: Array.from(new Set([
            ...(Array.isArray(userContext?.topics) ? userContext.topics : []),
            ...(Array.isArray(newContext.topics) ? newContext.topics : [])
          ])).filter(item => item && item.trim() !== ""),
          facts: Array.from(new Set([
            ...(Array.isArray(userContext?.facts) ? userContext.facts : []),
            ...(Array.isArray(newContext.facts) ? newContext.facts : [])
          ])).filter(item => item && item.trim() !== "")
        };

        console.log("Merged context:", mergedContext);
        await updateUserContext(mergedContext);
      } catch (apiError) {
        console.error("API or parsing error:", apiError);
        // Don't throw here to prevent breaking the chat flow
        // Instead, preserve the existing context
        if (userContext) {
          await updateUserContext(userContext);
        }
      }
    } catch (error) {
      console.error("Memory update failed:", error);
      // Don't throw the error to prevent breaking the chat flow
    }
  };

  return { handleMemoryUpdate };
};