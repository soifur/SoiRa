import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";

export const updateBotAndSharedConfig = async (bot: Bot) => {
  // First update the bot
  const { error: botError } = await supabase
    .from('bots')
    .update({
      name: bot.name,
      instructions: bot.instructions,
      starters: bot.starters,
      model: bot.model,
      api_key: bot.apiKey,
      open_router_model: bot.openRouterModel,
      avatar: bot.avatar,
      memory_enabled: bot.memory_enabled,
      published: bot.published
    })
    .eq('id', bot.id);

  if (botError) throw botError;

  // Check if there's a shared bot configuration
  const { data: sharedBot } = await supabase
    .from('shared_bots')
    .select('*')
    .eq('bot_id', bot.id)
    .maybeSingle();

  if (sharedBot) {
    // Update shared bot configuration
    const { error: sharedBotError } = await supabase
      .from('shared_bots')
      .update({
        bot_name: bot.name,
        instructions: bot.instructions,
        starters: bot.starters,
        model: bot.model,
        open_router_model: bot.openRouterModel,
        avatar: bot.avatar,
        memory_enabled: bot.memory_enabled,
        published: bot.published
      })
      .eq('bot_id', bot.id);

    if (sharedBotError) throw sharedBotError;
  }
};

export const updateBotMemorySettings = async (botId: string, memoryEnabled: boolean) => {
  try {
    // First update the bot
    const { error: botError } = await supabase
      .from('bots')
      .update({ memory_enabled: memoryEnabled })
      .eq('id', botId);

    if (botError) throw botError;

    // Then update shared bot if it exists
    const { data: sharedBot } = await supabase
      .from('shared_bots')
      .select('short_key')
      .eq('bot_id', botId)
      .maybeSingle();

    if (sharedBot) {
      const { error: sharedBotError } = await supabase
        .from('shared_bots')
        .update({ memory_enabled: memoryEnabled })
        .eq('bot_id', botId);

      if (sharedBotError) throw sharedBotError;
    }

    return true;
  } catch (error) {
    throw error;
  }
};