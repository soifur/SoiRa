import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

export const useQuizInstructions = (botId: string, quizMode: boolean = false) => {
  const { data: combinedInstructions, refetch } = useQuery({
    queryKey: ['quiz-instructions', botId, quizMode],
    queryFn: async () => {
      if (!quizMode || !botId) {
        return null;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No authenticated user found");
          return null;
        }

        const { data: quizResponse, error } = await supabase
          .from('quiz_responses')
          .select('combined_instructions')
          .eq('bot_id', botId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching quiz responses:", error);
          return null;
        }

        console.log("Quiz response found:", quizResponse);
        return quizResponse?.combined_instructions || null;
      } catch (error) {
        console.error("Error in fetchQuizInstructions:", error);
        return null;
      }
    },
    enabled: !!botId && quizMode,
  });

  return { combinedInstructions, refetch };
};