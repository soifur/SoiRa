import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";

export const useBotsData = () => {
  const { data: userBots = [], isLoading: isLoadingUserBots } = useQuery({
    queryKey: ['bots'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("No authenticated session");

      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      return data.map((bot): Bot => ({
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
      }));
    }
  });

  const { data: sharedBots = [], isLoading: isLoadingSharedBots } = useQuery({
    queryKey: ['shared-bots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shared_bots')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const allBots = [
    ...(userBots || []),
    ...(sharedBots || []).map(shared => ({
      id: shared.share_key,
      name: `${shared.bot_name} (Shared)`,
      instructions: shared.instructions || "",
      starters: shared.starters || [],
      model: shared.model as Bot['model'],
      apiKey: "",
      openRouterModel: shared.open_router_model,
      avatar: shared.avatar,
      accessType: "public" as const,
      memory_enabled: shared.memory_enabled,
    }))
  ];

  return {
    allBots,
    isLoadingBots: isLoadingUserBots || isLoadingSharedBots
  };
};