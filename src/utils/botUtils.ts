import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import { Field } from "@/components/bot/quiz/QuizFieldBuilder";

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

export const updateQuizConfiguration = async (botId: string, enabled: boolean, fields: Field[]) => {
  try {
    // First verify the bot exists
    const { data: botExists, error: botError } = await supabase
      .from('bots')
      .select('id')
      .eq('id', botId)
      .single();

    if (botError || !botExists) {
      throw new Error('Bot not found');
    }

    // First, try to get existing configuration
    const { data: existingConfig } = await supabase
      .from('quiz_configurations')
      .select('*')
      .eq('bot_id', botId)
      .maybeSingle();

    let quizId;
    
    if (existingConfig) {
      // Update existing configuration
      const { data, error } = await supabase
        .from('quiz_configurations')
        .update({ enabled, bot_id: botId })
        .eq('id', existingConfig.id)
        .select()
        .single();
      
      if (error) throw error;
      quizId = data.id;
    } else {
      // Create new configuration
      const { data, error } = await supabase
        .from('quiz_configurations')
        .insert([{ bot_id: botId, enabled }])
        .select()
        .single();
      
      if (error) throw error;
      quizId = data.id;
    }

    // Delete existing fields
    await supabase
      .from('quiz_fields')
      .delete()
      .eq('quiz_id', quizId);

    // Insert new fields if quiz is enabled and there are fields
    if (enabled && fields.length > 0) {
      const { error: insertError } = await supabase
        .from('quiz_fields')
        .insert(
          fields.map((field, index) => ({
            quiz_id: quizId,
            field_type: field.field_type,
            title: field.title,
            instructions: field.instructions,
            choices: field.choices,
            single_section: field.single_section,
            sequence_number: index
          }))
        );

      if (insertError) throw insertError;
    }

    return quizId;
  } catch (error) {
    console.error('Error in updateQuizConfiguration:', error);
    throw error;
  }
};