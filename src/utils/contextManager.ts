import { supabase } from "@/integrations/supabase/client";

export interface UserContext {
  recentTopics?: string[];
  userPreferences?: {
    name?: string;
    interests?: string[];
  };
  keyInsights?: string[];
}

export const ContextManager = {
  async getContext(botId: string, clientId: string): Promise<UserContext> {
    try {
      const { data, error } = await supabase
        .from('user_context')
        .select('context')
        .match({ bot_id: botId, client_id: clientId })
        .single();

      if (error) throw error;
      return data?.context || {};
    } catch (error) {
      console.error('Error fetching context:', error);
      return {};
    }
  },

  async updateContext(botId: string, clientId: string, newContext: Partial<UserContext>): Promise<void> {
    try {
      const { data: existingContext } = await supabase
        .from('user_context')
        .select('context')
        .match({ bot_id: botId, client_id: clientId })
        .single();

      const updatedContext = {
        ...existingContext?.context,
        ...newContext,
      };

      const { error } = await supabase
        .from('user_context')
        .upsert({
          bot_id: botId,
          client_id: clientId,
          context: updatedContext,
        }, {
          onConflict: 'client_id,bot_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating context:', error);
    }
  },

  async processMessageForContext(message: string, context: UserContext): Promise<UserContext> {
    // Extract key information from the message to update context
    const newContext: UserContext = { ...context };
    
    // Add to recent topics if it seems like a new topic
    if (!newContext.recentTopics) {
      newContext.recentTopics = [];
    }
    
    // Simple topic extraction (can be made more sophisticated)
    const potentialTopic = message.split(' ').slice(0, 3).join(' ');
    if (!newContext.recentTopics.includes(potentialTopic)) {
      newContext.recentTopics = [potentialTopic, ...newContext.recentTopics].slice(0, 5);
    }

    return newContext;
  }
};