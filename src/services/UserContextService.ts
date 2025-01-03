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

  static async updateUserContext(botId: string, clientId: string, newContext: Record<string, any>, sessionToken?: string | null) {
    try {
      console.log("Updating context for:", { botId, clientId, sessionToken });
      console.log("New context:", newContext);
      
      const { data: existingData, error: fetchError } = await supabase
        .from('user_context')
        .select('id, context')
        .eq('bot_id', botId)
        .eq('client_id', clientId)
        .eq('session_token', sessionToken)
        .maybeSingle();

      if (fetchError) {
        console.error("Error checking existing context:", fetchError);
        throw fetchError;
      }

      const existingContext = (existingData?.context && typeof existingData.context === 'object') 
        ? existingData.context as Record<string, any>
        : {};

      const mergedContext = {
        ...existingContext,
        ...newContext
      };

      console.log("Merged context:", mergedContext);

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