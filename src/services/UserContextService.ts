import { supabase } from "@/integrations/supabase/client";
import { Message, Bot, UserContext } from "@/components/chat/types/chatTypes";

export class UserContextService {
  static async updateContext(
    messages: Message[],
    bot: Bot,
    clientId: string | null,
    sessionToken: string | null
  ) {
    if (!bot.memory_enabled) {
      console.log('Memory is disabled for this bot, skipping context update');
      return;
    }

    if (!clientId && !sessionToken) {
      console.error('No clientId or sessionToken provided for context update');
      return;
    }

    try {
      // Get last few messages for context
      const recentMessages = messages.slice(-5);
      const summary = recentMessages.map(msg => 
        `${msg.role}: ${msg.content.substring(0, 100)}...`
      ).join('\n');

      // Extract topics
      const topics = new Set<string>();
      recentMessages.forEach(msg => {
        const words = msg.content.toLowerCase().split(/\W+/);
        words.forEach(word => {
          if (word.length > 4) topics.add(word);
        });
      });

      const context: UserContext = {
        summary,
        lastInteraction: new Date().toISOString(),
        topics: Array.from(topics).slice(0, 5),
        preferences: {}
      };

      console.log('Attempting to update user context:', {
        bot_id: bot.id,
        client_id: clientId,
        session_token: sessionToken,
        context
      });

      const { error } = await supabase
        .from('user_context')
        .upsert({
          bot_id: bot.id,
          client_id: clientId,
          session_token: sessionToken,
          context,
          last_updated: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating context:', error);
        throw error;
      }

      console.log('Successfully updated user context');
    } catch (error) {
      console.error('Error in updateContext:', error);
    }
  }

  static async getContextForUser(
    bot: Bot,
    clientId: string | null,
    sessionToken: string | null
  ): Promise<UserContext | null> {
    try {
      if (!clientId && !sessionToken) {
        console.log('No clientId or sessionToken provided for context retrieval');
        return null;
      }

      console.log('Fetching context for:', { clientId, sessionToken, botId: bot.id });

      const { data, error } = await supabase
        .from('user_context')
        .select('context')
        .eq('bot_id', bot.id)
        .or(`client_id.eq.${clientId},session_token.eq.${sessionToken}`)
        .maybeSingle();

      if (error) {
        console.error('Error fetching context:', error);
        return null;
      }

      return data?.context as UserContext || null;
    } catch (error) {
      console.error('Error in getContextForUser:', error);
      return null;
    }
  }
}