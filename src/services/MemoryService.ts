import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/chat/types/chatTypes";

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

      return data?.context?.summary || null;
    } catch (error) {
      console.error('Error in getContextForUser:', error);
      return null;
    }
  }

  static async injectMemoryContext(messages: Message[], bot: { memory_enabled?: boolean }, sessionToken: string | null, userId: string | null): Promise<Message[]> {
    if (!bot.memory_enabled) {
      return messages;
    }

    const context = await this.getContextForUser(sessionToken, userId);
    if (!context) {
      return messages;
    }

    // Insert the context as a system message at the start of the conversation
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