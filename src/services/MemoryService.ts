import { supabase } from "@/integrations/supabase/client";
import { Message, Bot, UserContext } from "@/components/chat/types/chatTypes";

export class MemoryService {
  static async getContextForUser(sessionToken: string | null, userId: string | null): Promise<string | null> {
    try {
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
      return context?.summary || null;
    } catch (error) {
      console.error('Error in getContextForUser:', error);
      return null;
    }
  }

  static async injectMemoryContext(messages: Message[], bot: Bot, sessionToken: string | null, userId: string | null): Promise<Message[]> {
    if (!bot.memory_enabled) {
      return messages;
    }

    const context = await this.getContextForUser(sessionToken, userId);
    if (!context) {
      return messages;
    }

    return [
      {
        id: 'context-message',
        role: 'system',
        content: `Previous conversation context: ${context}`,
      },
      ...messages
    ];
  }
}