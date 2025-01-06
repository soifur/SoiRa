import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";

interface BotApiKey {
  api_key: string;
}

interface SharedBot {
  share_key: string;
  bot_name: string;
  instructions: string | null;
  starters: string[] | null;
  model: Bot['model'];
  open_router_model: string | null;
  avatar: string | null;
  memory_enabled: boolean | null;
  published: boolean | null;
  bot_api_keys: BotApiKey[] | null;
}

export const useBotProvider = () => {
  return useQuery({
    queryKey: ['bots-and-shared'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      
      // First get user's own bots if authenticated
      let userBots: Bot[] = [];
      if (session.session) {
        const { data: ownBots, error: ownBotsError } = await supabase
          .from('bots')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });
        
        if (ownBotsError) throw ownBotsError;
        
        userBots = ownBots.map((bot): Bot => ({
          id: bot.id,
          name: bot.name,
          instructions: bot.instructions || "",
          starters: bot.starters || [],
          model: bot.model,
          apiKey: bot.api_key,
          openRouterModel: bot.open_router_model,
          avatar: bot.avatar,
          accessType: "private",
          memory_enabled: bot.memory_enabled,
          published: bot.published,
          default_bot: bot.default_bot,
        }));
      }

      // Then get published shared bots with their API keys
      const { data: sharedBots, error: sharedBotsError } = await supabase
        .from('shared_bots')
        .select(`
          *,
          bot_api_keys (
            api_key
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (sharedBotsError) throw sharedBotsError;

      console.log("Raw shared bots data:", sharedBots);

      const transformedSharedBots: Bot[] = (sharedBots as SharedBot[]).map(shared => {
        const apiKey = shared.bot_api_keys?.[0]?.api_key || "";
        
        console.log(`Processing bot ${shared.bot_name}, API key present: ${Boolean(apiKey)}`);
        
        return {
          id: shared.share_key,
          name: shared.bot_name,
          instructions: shared.instructions || "",
          starters: shared.starters || [],
          model: shared.model,
          apiKey: apiKey,
          openRouterModel: shared.open_router_model,
          avatar: shared.avatar,
          accessType: "public",
          memory_enabled: shared.memory_enabled,
          published: shared.published,
        };
      });

      console.log("Transformed shared bots:", transformedSharedBots);

      // Combine and return both sets of bots
      return [...userBots, ...transformedSharedBots];
    },
  });
};