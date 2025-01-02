import { supabase } from "@/integrations/supabase/client";
import { Message, Bot, UserContext } from "@/components/chat/types/chatTypes";

export class MemoryService {
  static async getContextForUser(sessionToken: string | null, userId: string | null): Promise<string | null> {
    try {
      if (!sessionToken && !userId) {
        console.log('No session token or user ID provided for context retrieval');
        return null;
      }

      const { data, error } = await supabase
        .from('user_context')
        .select('context')
        .or(`session_token.eq.${sessionToken},user_id.eq.${userId}`)
        .single();

      if (error) {
        console.error('Error fetching context:', error);
        return null;
      }

      const context = data?.context as UserContext;
      if (!context || !context.summary) {
        console.log('No context or summary found for user');
        return null;
      }

      const contextParts = [];
      if (context.summary) {
        contextParts.push(`Previous conversation summary: ${context.summary}`);
      }
      if (context.topics?.length) {
        contextParts.push(`Main topics discussed: ${context.topics.join(', ')}`);
      }
      if (context.preferences) {
        const prefStrings = Object.entries(context.preferences)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        contextParts.push(`User preferences: ${prefStrings}`);
      }
      if (context.lastInteraction) {
        contextParts.push(`Last interaction: ${context.lastInteraction}`);
      }

      return contextParts.join('\n');
    } catch (error) {
      console.error('Error in getContextForUser:', error);
      return null;
    }
  }

  static async injectMemoryContext(messages: Message[], bot: Bot, sessionToken: string | null, userId: string | null): Promise<Message[]> {
    if (!bot.memory_enabled) {
      console.log('Memory is disabled for this bot, skipping context injection');
      return messages;
    }

    const context = await this.getContextForUser(sessionToken, userId);
    if (!context) {
      console.log('No context available, proceeding without memory injection');
      return messages;
    }

    console.log('Injecting memory context into conversation');
    return [
      {
        id: 'context-message',
        role: 'system',
        content: context,
      },
      ...messages
    ];
  }
}