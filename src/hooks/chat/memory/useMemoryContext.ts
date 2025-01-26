import { Bot } from "@/components/chat/types/chatTypes";
import { ChatService } from "@/services/ChatService";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useMemoryContext = (
  bot: Bot,
  userContext: any,
  updateUserContext: (newContext: any) => Promise<void>
) => {
  // Fetch Memory Bot settings
  const { data: memorySettings } = useQuery({
    queryKey: ['memory-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memory_bot_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching memory settings:', error);
        return null;
      }
      return data;
    },
    enabled: bot?.memory_enabled === true
  });

  const handleMemoryUpdate = async (messages: Array<{ role: string; content: string }>) => {
    if (!bot?.memory_enabled || !memorySettings) {
      console.log("Memory not enabled or settings not found");
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
${memorySettings.instructions || "Extract and maintain user context from the conversation."}

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
}`;

      console.log("Sending context update to Memory Bot");

      let apiResponse: string | undefined;
      
      // Use Memory Bot's configured model and API key
      const memoryBot = {
        ...bot,
        model: memorySettings.model as any,
        apiKey: memorySettings.api_key,
        openRouterModel: memorySettings.open_router_model,
        instructions: memorySettings.instructions
      };

      try {
        if (memorySettings.model === "gemini") {
          apiResponse = await ChatService.sendGeminiMessage(
            [{ role: "user", content: contextUpdatePrompt }],
            memoryBot
          );
        } else {
          apiResponse = await ChatService.sendOpenRouterMessage(
            [{ role: "user", content: contextUpdatePrompt }],
            memoryBot
          );
        }

        if (!apiResponse) {
          console.log("Empty API response from Memory Bot");
          return;
        }

        console.log("Memory Bot response:", apiResponse);

        const cleanedResponse = apiResponse.trim();
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
          console.log("No valid JSON found in Memory Bot response");
          return;
        }

        let newContext;
        try {
          newContext = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.log("Parse error:", parseError);
          return;
        }

        // Validate the required structure
        if (!newContext || typeof newContext !== 'object') {
          console.log("Invalid context structure");
          return;
        }

        // Merge with existing context
        const mergedContext = {
          name: newContext.name || userContext?.name || null,
          faith: newContext.faith || userContext?.faith || null,
          likes: Array.isArray(newContext.likes) ? 
            [...new Set(newContext.likes)].filter(item => item && typeof item === 'string' && item.trim() !== "") : 
            userContext?.likes || [],
          topics: Array.from(new Set([
            ...(Array.isArray(userContext?.topics) ? userContext.topics : []),
            ...(Array.isArray(newContext.topics) ? newContext.topics : [])
          ])).filter(item => item && typeof item === 'string' && item.trim() !== ""),
          facts: Array.from(new Set([
            ...(Array.isArray(userContext?.facts) ? userContext.facts : []),
            ...(Array.isArray(newContext.facts) ? newContext.facts : [])
          ])).filter(item => item && typeof item === 'string' && item.trim() !== "")
        };

        console.log("Updating user context with:", mergedContext);
        await updateUserContext(mergedContext);

      } catch (apiError) {
        console.error("Memory Bot API error:", apiError);
        if (userContext) {
          await updateUserContext(userContext);
        }
      }
    } catch (error) {
      console.error("Memory update failed:", error);
    }
  };

  return { handleMemoryUpdate };
};