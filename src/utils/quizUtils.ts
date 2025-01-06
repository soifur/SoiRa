import { supabase } from "@/integrations/supabase/client";
import { Field } from "@/components/bot/quiz/QuizFieldBuilder";

export const saveQuizConfiguration = async (botId: string, enabled: boolean) => {
  const { data: existingConfig, error: fetchError } = await supabase
    .from('quiz_configurations')
    .select('*')
    .eq('bot_id', botId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existingConfig) {
    const { error } = await supabase
      .from('quiz_configurations')
      .update({ enabled })
      .eq('id', existingConfig.id);
    
    if (error) throw error;
    return existingConfig.id;
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