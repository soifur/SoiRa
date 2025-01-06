import { supabase } from "@/integrations/supabase/client";
import { Field } from "@/components/bot/quiz/QuizFieldBuilder";

export const saveQuizConfiguration = async (botId: string, enabled: boolean) => {
  // First get or create quiz configuration
  const { data: existingConfigs, error: fetchError } = await supabase
    .from('quiz_configurations')
    .select('*')
    .eq('bot_id', botId);

  if (fetchError) throw fetchError;

  // Use the first config or create a new one
  if (existingConfigs && existingConfigs.length > 0) {
    const { error } = await supabase
      .from('quiz_configurations')
      .update({ enabled })
      .eq('id', existingConfigs[0].id);
    
    if (error) throw error;
    return existingConfigs[0].id;
  } else {
    const { data, error } = await supabase
      .from('quiz_configurations')
      .insert({ bot_id: botId, enabled })
      .select()
      .single();
    
    if (error) throw error;
    return data.id;
  }
};

export const saveQuizFields = async (quizId: string, fields: Field[]) => {
  // First delete existing fields
  const { error: deleteError } = await supabase
    .from('quiz_fields')
    .delete()
    .eq('quiz_id', quizId);

  if (deleteError) throw deleteError;

  // Then insert new fields if there are any
  if (fields.length > 0) {
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
};