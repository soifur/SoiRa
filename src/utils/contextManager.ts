import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

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
        .maybeSingle();

      if (error) throw error;
      return (data?.context as Json as UserContext) || {};
    } catch (error) {
      console.error('Error fetching context:', error);
      return {};
    }
  },

  async updateContext(botId: string, clientId: string, newContext: UserContext): Promise<void> {
    try {
      const { data: existingContext } = await supabase
        .from('user_context')
        .select('context')
        .match({ bot_id: botId, client_id: clientId })
        .maybeSingle();

      const updatedContext: UserContext = {
        ...(existingContext?.context as Json as UserContext || {}),
        ...newContext,
      };

      const { error } = await supabase
        .from('user_context')
        .upsert({
          bot_id: botId,
          client_id: clientId,
          context: updatedContext as Json
        }, {
          onConflict: 'bot_id,client_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating context:', error);
    }
  },

  async processMessageForContext(message: string, context: UserContext): Promise<UserContext> {
    const newContext: UserContext = { ...context };
    
    if (!newContext.recentTopics) {
      newContext.recentTopics = [];
    }
    
    const potentialTopic = message.split(' ').slice(0, 3).join(' ');
    if (!newContext.recentTopics.includes(potentialTopic)) {
      newContext.recentTopics = [potentialTopic, ...newContext.recentTopics].slice(0, 5);
    }

    return newContext;
  }
};