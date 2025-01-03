import { supabase } from "@/integrations/supabase/client";

export class UserContextService {
  static async getUserContext(botId: string, clientId: string, sessionToken?: string | null) {
    try {
      const { data, error } = await supabase
        .from('user_context')
        .select('context')
        .eq('bot_id', botId)
        .eq('client_id', clientId)
        .eq('session_token', sessionToken)
        .maybeSingle();

      if (error) throw error;
      return data?.context || null;
    } catch (error) {
      throw error;
    }
  }

  static async updateUserContext(botId: string, clientId: string, newContext: Record<string, any>, sessionToken?: string | null) {
    try {
      // First try to find an existing context with either session_token or client_id
      const { data: existingData, error: fetchError } = await supabase
        .from('user_context')
        .select('id, context')
        .eq('bot_id', botId)
        .eq('client_id', clientId)
        .eq('session_token', sessionToken)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const mergedContext = {
        ...(existingData?.context || {}),
        ...newContext
      };

      if (existingData?.id) {
        // Update existing context
        const { error: updateError } = await supabase
          .from('user_context')
          .update({
            context: mergedContext,
            last_updated: new Date().toISOString()
          })
          .eq('id', existingData.id);

        if (updateError) throw updateError;
      } else {
        // Create new context
        const { error: insertError } = await supabase
          .from('user_context')
          .insert({
            bot_id: botId,
            client_id: clientId,
            session_token: sessionToken,
            context: mergedContext,
            last_updated: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      throw error;
    }
  }
}