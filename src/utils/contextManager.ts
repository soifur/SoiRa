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
      console.log("Getting context for bot:", botId, "client:", clientId);
      
      const { data, error } = await supabase
        .from('user_context')
        .select('context')
        .match({ bot_id: botId, client_id: clientId })
        .maybeSingle();

      if (error) {
        console.error('Error fetching context:', error);
        throw error;
      }

      // Return empty context if none exists
      return (data?.context as Json as UserContext) || {
        recentTopics: [],
        userPreferences: {},
        keyInsights: []
      };
    } catch (error) {
      console.error('Error fetching context:', error);
      return {
        recentTopics: [],
        userPreferences: {},
        keyInsights: []
      };
    }
  },

  async updateContext(botId: string, clientId: string, newContext: UserContext): Promise<void> {
    try {
      console.log("Updating context for bot:", botId, "client:", clientId, "context:", newContext);

      // Always create a new context entry or update existing one for this specific bot-client pair
      const { error } = await supabase
        .from('user_context')
        .upsert({
          bot_id: botId,
          client_id: clientId,
          context: {
            ...newContext,
            userPreferences: {
              ...newContext.userPreferences,
              // Ensure name is specific to this bot's context
              name: newContext.userPreferences?.name || undefined
            }
          } as Json
        }, {
          onConflict: 'bot_id,client_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating context:', error);
    }
  },

  async processMessageForContext(message: string, context: UserContext): Promise<UserContext> {
    const newContext: UserContext = { 
      ...context,
      recentTopics: [...(context.recentTopics || [])],
      userPreferences: { ...context.userPreferences },
      keyInsights: [...(context.keyInsights || [])]
    };
    
    // Extract potential topic from the first few words
    const potentialTopic = message.split(' ').slice(0, 3).join(' ');
    if (!newContext.recentTopics?.includes(potentialTopic)) {
      newContext.recentTopics = [potentialTopic, ...(newContext.recentTopics || [])].slice(0, 5);
    }

    return newContext;
  }
};