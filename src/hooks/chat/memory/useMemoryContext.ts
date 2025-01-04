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
        console.error("Parse error:", parseError);
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
        // For likes, we want to use the new context's likes array directly since it should handle removals
        likes: Array.isArray(newContext.likes) ? 
          newContext.likes.filter(item => item && item.trim() !== "" && item !== " ") : 
          [],
        topics: Array.from(new Set([
          ...(Array.isArray(userContext?.topics) ? userContext.topics : []),
          ...(Array.isArray(newContext.topics) ? newContext.topics : [])
        ])).filter(item => 
          item && 
          item.trim() !== "" && 
          item !== " "
        ),
        facts: Array.from(new Set([
          ...(Array.isArray(userContext?.facts) ? userContext.facts : []),
          ...(Array.isArray(newContext.facts) ? newContext.facts : [])
        ])).filter(item => 
          item && 
          item.trim() !== "" && 
          item !== " "
        )
      };

      console.log("Merged context:", mergedContext);
      await updateUserContext(mergedContext);
    } catch (error) {
      console.error("Memory update failed:", error);
      // Don't throw the error to prevent breaking the chat flow
    }
  };

  return { handleMemoryUpdate };
};