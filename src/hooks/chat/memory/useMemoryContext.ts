import { Bot } from "@/components/chat/types/chatTypes";
import { ChatService } from "@/services/ChatService";

export const useMemoryContext = (
  bot: Bot,
  userContext: any,
  updateUserContext: (newContext: any) => Promise<void>
) => {
  const handleMemoryUpdate = async (messages: Array<{ role: string; content: string }>) => {
    if (bot.memory_enabled === false) {
      console.log("Memory updates disabled for bot:", bot.id);
      return;
    }

    if (!bot.apiKey || !bot.instructions) {
      console.log("Memory updates disabled - missing API key or instructions");
      return;
    }

    try {
      const userMessages = messages.filter(msg => msg.role === "user");
      
      const contextUpdatePrompt = `
You are a context analyzer. Your task is to extract and maintain user context from conversations.

Previous context: ${JSON.stringify(userContext || {
  name: null,
  faith: null,
  likes: [],
  topics: []
})}

User messages to analyze:
${userMessages.map(msg => msg.content).join('\n')}

Instructions:
${bot.instructions}

Based on the messages, update the user context following these rules:
1. Extract the user's name if mentioned
2. Note any likes, interests, or positive mentions
3. Track topics they discuss
4. Preserve existing context unless explicitly contradicted
5. Return ONLY a valid JSON object in this exact format:

{
  "name": "string or null",
  "faith": "string or null",
  "likes": ["array of strings"],
  "topics": ["array of strings"]
}

IMPORTANT: 
- Merge new information with existing context
- Keep previous values unless contradicted
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

      // Clean up the response to ensure we only get JSON
      const cleanedResponse = newContextResponse.replace(/```json\s*|\s*```/g, '').trim();
      
      // Try to find a JSON object in the response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("No valid JSON found in response:", cleanedResponse);
        throw new Error("No valid JSON found in response");
      }

      let newContext;
      try {
        newContext = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("Parse error:", parseError, "Response:", cleanedResponse);
        throw new Error("Invalid JSON format in memory bot response");
      }

      // Validate the required structure
      if (!newContext || typeof newContext !== 'object') {
        throw new Error("Invalid context structure");
      }

      // Ensure all required fields exist with proper types
      const mergedContext = {
        // Only update name if new context explicitly provides one
        name: newContext.name || userContext?.name || null,
        // Only update faith if new context explicitly provides one
        faith: newContext.faith || userContext?.faith || null,
        // Merge likes arrays, removing duplicates and empty values
        likes: Array.from(new Set([
          ...(Array.isArray(userContext?.likes) ? userContext.likes : []),
          ...(Array.isArray(newContext.likes) ? newContext.likes : [])
        ])).filter(item => 
          item && 
          item.trim() !== "" && 
          item !== " "
        ),
        // Merge topics arrays, removing duplicates and empty values
        topics: Array.from(new Set([
          ...(Array.isArray(userContext?.topics) ? userContext.topics : []),
          ...(Array.isArray(newContext.topics) ? newContext.topics : [])
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
      throw error;
    }
  };

  return { handleMemoryUpdate };
};