import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Bot {
  id: string;
  name: string;
  instructions: string;
  starters: string[];
  model: "gemini" | "claude" | "openai" | "openrouter";
  apiKey: string;
  openRouterModel?: string;
  avatar?: string;
  accessType?: "public" | "private";
  memory_enabled?: boolean;
  memory_instructions?: string;
  memory_model?: string;
  memory_api_key?: string;
}

export const useBots = () => {
  const { toast } = useToast();
  const [bots, setBots] = useState<Bot[]>([]);

  // Fetch bots from Supabase on component mount
  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Bot interface
      const transformedBots = data.map((bot): Bot => ({
        id: bot.id,
        name: bot.name,
        instructions: bot.instructions || "",
        starters: bot.starters || [],
        model: bot.model,
        apiKey: bot.api_key,
        openRouterModel: bot.open_router_model,
        avatar: bot.avatar,
        accessType: "private"
      }));

      setBots(transformedBots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      toast({
        title: "Error",
        description: "Failed to fetch bots. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveBot = async (bot: Bot) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated user");
      }

      const botData = {
        name: bot.name,
        instructions: bot.instructions,
        starters: bot.starters,
        model: bot.model,
        api_key: bot.apiKey,
        open_router_model: bot.openRouterModel,
        avatar: bot.avatar,
        user_id: session.session.user.id
      };

      let result;
      if (bot.id) {
        // Update existing bot
        result = await supabase
          .from('bots')
          .update(botData)
          .eq('id', bot.id)
          .select()
          .single();
      } else {
        // Insert new bot
        result = await supabase
          .from('bots')
          .insert(botData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Transform the saved bot data
      const savedBot: Bot = {
        id: result.data.id,
        name: result.data.name,
        instructions: result.data.instructions || "",
        starters: result.data.starters || [],
        model: result.data.model,
        apiKey: result.data.api_key,
        openRouterModel: result.data.open_router_model,
        avatar: result.data.avatar,
        accessType: "private"
      };

      // Refresh the bots list
      await fetchBots();

      // Return the saved bot
      return savedBot;

    } catch (error) {
      console.error("Error saving bot:", error);
      toast({
        title: "Error",
        description: "Failed to save bot. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteBot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setBots(bots.filter((b) => b.id !== id));

      toast({
        title: "Success",
        description: "Bot deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting bot:", error);
      toast({
        title: "Error",
        description: "Failed to delete bot. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { bots, saveBot, deleteBot };
};