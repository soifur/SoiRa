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
        .single();

      if (error) {
        console.error("Error fetching user context:", error);
        return null;
      }

      return data?.context || null;
    } catch (error) {
      console.error("Error in getUserContext:", error);
      return null;
    }
  }

  static async updateUserContext(botId: string, clientId: string, context: any, sessionToken?: string | null) {
    try {
      const { error } = await supabase
        .from('user_context')
        .upsert({
          bot_id: botId,
          client_id: clientId,
          session_token: sessionToken,
          context,
          last_updated: new Date().toISOString()
        });

      if (error) {
        console.error("Error updating user context:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in updateUserContext:", error);
      throw error;
    }
  }
}