import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@auth0/auth0-react";

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
}

export const useBots = () => {
  const { toast } = useToast();
  const [bots, setBots] = useState<Bot[]>([]);
  const { user } = useAuth();

  // Fetch bots from Supabase on component mount
  useEffect(() => {
    if (user) {
      fetchBots();
    }
  }, [user]);

  const fetchBots = async () => {
    try {
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
      const botData = {
        name: bot.name,
        instructions: bot.instructions,
        starters: bot.starters,
        model: bot.model,
        api_key: bot.apiKey,
        open_router_model: bot.openRouterModel,
        avatar: bot.avatar,
        user_id: user?.sub
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

      // Refresh the bots list
      await fetchBots();

      toast({
        title: "Success",
        description: `Bot ${bot.id ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      console.error("Error saving bot:", error);
      toast({
        title: "Error",
        description: "Failed to save bot. Please try again.",
        variant: "destructive",
      });
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