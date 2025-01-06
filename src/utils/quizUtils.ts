import { supabase } from "@/integrations/supabase/client";
import { Field } from "@/components/bot/quiz/QuizFieldBuilder";

export const saveQuizConfiguration = async (botId: string, enabled: boolean) => {
  try {
    // First, try to get existing configuration
    const { data: existingConfig, error: fetchError } = await supabase
      .from('quiz_configurations')
      .select('*')
      .eq('bot_id', botId)
      .limit(1)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingConfig) {
      // Update existing configuration
      const { data, error } = await supabase
        .from('quiz_configurations')
        .update({ enabled })
        .eq('id', existingConfig.id)
        .select()
        .single();
      
      if (error) throw error;
      return data.id;
    } else {
      // Create new configuration
      const { data, error } = await supabase
        .from('quiz_configurations')
        .insert([{ bot_id: botId, enabled }])
        .select()
        .single();
      
      if (error) throw error;
      return data.id;
    }
  } catch (error) {
    console.error('Error in saveQuizConfiguration:', error);
    throw error;
  }
};

export const saveQuizFields = async (quizId: string, fields: Field[]) => {
  try {
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
  } catch (error) {
    console.error('Error in saveQuizFields:', error);
    throw error;
  }
};