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

      const { error: upsertError } = await supabase
        .from('user_context')
        .upsert({
          ...(existingData?.id ? { id: existingData.id } : {}),
          bot_id: botId,
          client_id: clientId,
          session_token: sessionToken,
          context: mergedContext,
          last_updated: new Date().toISOString()
        });

      if (upsertError) throw upsertError;
    } catch (error) {
      throw error;
    }
  }
}