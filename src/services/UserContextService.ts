import { supabase } from "@/integrations/supabase/client";

export class UserContextService {
  static async getUserContext(botId: string, clientId: string, sessionToken?: string | null) {
    try {
      console.log("Getting context for:", { botId, clientId, sessionToken });
      
      const { data, error } = await supabase
        .from('user_context')
        .select('context')
        .eq('bot_id', botId)
        .eq('client_id', clientId)
        .eq('session_token', sessionToken)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user context:", error);
        return null;
      }

      console.log("Retrieved context:", data?.context);
      return data?.context || null;
    } catch (error) {
      console.error("Error in getUserContext:", error);
      return null;
    }
  }

  static async updateUserContext(botId: string, clientId: string, context: any, sessionToken?: string | null) {
    try {
      console.log("Updating context for:", { botId, clientId, sessionToken });
      console.log("New context:", context);
      
      const { data: existingContext, error: fetchError } = await supabase
        .from('user_context')
        .select('id')
        .eq('bot_id', botId)
        .eq('client_id', clientId)
        .eq('session_token', sessionToken)
        .maybeSingle();

      if (fetchError) {
        console.error("Error checking existing context:", fetchError);
        throw fetchError;
      }

      const { error: upsertError } = await supabase
        .from('user_context')
        .upsert({
          ...(existingContext?.id ? { id: existingContext.id } : {}),
          bot_id: botId,
          client_id: clientId,
          session_token: sessionToken,
          context,
          last_updated: new Date().toISOString()
        });

      if (upsertError) {
        console.error("Error updating user context:", upsertError);
        throw upsertError;
      }
      
      console.log("Successfully updated context");
    } catch (error) {
      console.error("Error in updateUserContext:", error);
      throw error;
    }
  }
}