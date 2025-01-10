import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type BaseModel = "gemini" | "claude" | "openai" | "openrouter";

export interface Bot {
  id: string;
  name: string;
  instructions: string;
  starters: string[];
  model: BaseModel;
  apiKey: string;
  openRouterModel?: string;
  avatar?: string;
  accessType?: "public" | "private";
  memory_enabled?: boolean;
  published?: boolean;
  default_bot?: boolean;
  quiz_mode?: boolean;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  response_format?: { type: string; [key: string]: any };
  stream?: boolean;
  tool_config?: any[];
  system_templates?: any[];
  memory_model?: string;
  memory_enabled_model?: boolean;
  share_key?: string;
}

export const useBots = () => {
  const { toast } = useToast();
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBots = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      // Fetch bots with their API keys
      const { data: botsData, error: botsError } = await supabase
        .from('shared_bots')
        .select(`
          *,
          bot_api_keys (
            api_key
          )
        `)
        .order('created_at', { ascending: false });

      if (botsError) throw botsError;

      // Transform the data
      const transformedBots = botsData.map((sharedBot) => {
        return {
          id: sharedBot.share_key,
          name: sharedBot.bot_name,
          instructions: sharedBot.instructions || "",
          starters: sharedBot.starters || [],
          model: sharedBot.model as BaseModel,
          apiKey: sharedBot.bot_api_keys?.api_key || "", // Get API key from bot_api_keys join
          openRouterModel: sharedBot.open_router_model,
          avatar: sharedBot.avatar,
          memory_enabled: sharedBot.memory_enabled,
          published: sharedBot.published,
          default_bot: false,
          quiz_mode: sharedBot.quiz_mode,
          frequency_penalty: sharedBot.frequency_penalty ?? 0,
          presence_penalty: sharedBot.presence_penalty ?? 0,
          max_tokens: sharedBot.max_tokens ?? 4096,
          temperature: sharedBot.temperature ?? 1,
          top_p: sharedBot.top_p ?? 1,
          response_format: sharedBot?.response_format ? 
            (typeof sharedBot.response_format === 'string' ? 
              JSON.parse(sharedBot.response_format) : 
              sharedBot.response_format) : 
            { type: "text" },
          tool_config: sharedBot?.tool_config ? 
            (typeof sharedBot.tool_config === 'string' ? 
              JSON.parse(sharedBot.tool_config) : 
              sharedBot.tool_config) : 
            [],
          system_templates: sharedBot?.system_templates ? 
            (typeof sharedBot.system_templates === 'string' ? 
              JSON.parse(sharedBot.system_templates) : 
              sharedBot.system_templates) : 
            [],
          memory_enabled_model: sharedBot?.memory_enabled_model ?? false,
          share_key: sharedBot?.share_key
        };
      });

      setBots(transformedBots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      toast({
        title: "Error",
        description: "Failed to fetch bots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveBot = async (bot: Bot) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated user");
      }

      // Prepare the shared bot data
      const sharedBotData = {
        bot_name: bot.name,
        instructions: bot.instructions,
        starters: bot.starters,
        model: bot.model,
        open_router_model: bot.openRouterModel,
        avatar: bot.avatar,
        memory_enabled: bot.memory_enabled,
        published: bot.published,
        frequency_penalty: bot.frequency_penalty,
        presence_penalty: bot.presence_penalty,
        max_tokens: bot.max_tokens,
        temperature: bot.temperature,
        top_p: bot.top_p,
        response_format: bot.response_format,
        tool_config: bot.tool_config,
        system_templates: bot.system_templates,
        memory_enabled_model: bot.memory_enabled_model,
      };

      // Update existing shared bot using share_key
      const { data: updatedSharedBot, error: sharedBotError } = await supabase
        .from('shared_bots')
        .update(sharedBotData)
        .eq('share_key', bot.id)
        .select()
        .single();

      if (sharedBotError) throw sharedBotError;

      // Refresh the bots list
      await fetchBots();

      return updatedSharedBot;

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
        .from('shared_bots')
        .delete()
        .eq('share_key', id);

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

  // Fetch bots on component mount
  useEffect(() => {
    fetchBots();
  }, []);

  return { bots, saveBot, deleteBot, isLoading };
};