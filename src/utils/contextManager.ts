import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface UserContext {
  recentTopics?: string[];
  userPreferences?: {
    name?: string;
    interests?: string[];
  };
  keyInsights?: string[];
  botSpecificData?: {
    knownName?: string;
    lastInteraction?: string;
  };
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

      // Return a fresh context if none exists, with bot-specific structure
      const emptyContext: UserContext = {
        recentTopics: [],
        userPreferences: {
          interests: []
        },
        keyInsights: [],
        botSpecificData: {
          knownName: undefined,
          lastInteraction: new Date().toISOString()
        }
      };

      // If we have existing data, ensure it has the bot-specific structure
      if (data?.context) {
        const existingContext = data.context as Json as UserContext;
        return {
          ...emptyContext,
          ...existingContext,
          botSpecificData: {
            ...emptyContext.botSpecificData,
            ...existingContext.botSpecificData,
          }
        };
      }

      return emptyContext;
    } catch (error) {
      console.error('Error fetching context:', error);
      return {
        recentTopics: [],
        userPreferences: {
          interests: []
        },
        keyInsights: [],
        botSpecificData: {
          lastInteraction: new Date().toISOString()
        }
      };
    }
  },

  async updateContext(botId: string, clientId: string, newContext: UserContext): Promise<void> {
    try {
      console.log("Updating context for bot:", botId, "client:", clientId, "context:", newContext);

      // Ensure we're not carrying over name data from other bots
      const contextToSave: UserContext = {
        ...newContext,
        userPreferences: {
          ...newContext.userPreferences,
          // Remove any shared name data
          name: undefined
        },
        botSpecificData: {
          ...newContext.botSpecificData,
          lastInteraction: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('user_context')
        .upsert({
          bot_id: botId,
          client_id: clientId,
          context: contextToSave as Json
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
      keyInsights: [...(context.keyInsights || [])],
      botSpecificData: {
        ...context.botSpecificData,
        lastInteraction: new Date().toISOString()
      }
    };
    
    // Extract potential topic from the first few words
    const potentialTopic = message.split(' ').slice(0, 3).join(' ');
    if (!newContext.recentTopics?.includes(potentialTopic)) {
      newContext.recentTopics = [potentialTopic, ...(newContext.recentTopics || [])].slice(0, 5);
    }

    return newContext;
  }
};