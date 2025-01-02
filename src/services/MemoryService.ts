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

  static async updateContext(messages: Message[], bot: Bot, sessionToken: string | null, userId: string | null, clientId: string | null): Promise<void> {
    if (!bot.memory_enabled) {
      console.log('Memory is disabled for this bot, skipping context update');
      return;
    }

    try {
      // Get last few messages for context
      const recentMessages = messages.slice(-5);
      const summary = recentMessages.map(msg => 
        `${msg.role}: ${msg.content.substring(0, 100)}...`
      ).join('\n');

      // Extract topics (simple implementation - could be enhanced with NLP)
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

      const { error } = await supabase
        .from('user_context')
        .upsert({
          bot_id: bot.id,
          client_id: clientId,
          session_token: sessionToken,
          user_id: userId,
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