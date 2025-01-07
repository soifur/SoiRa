import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useQuizInstructions = (botId: string, quizMode: boolean = false) => {
  const [combinedInstructions, setCombinedInstructions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuizInstructions = async () => {
    if (!quizMode || !botId) {
      setCombinedInstructions(null);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user found");
        return;
      }

      const { data: quizResponse, error } = await supabase
        .from('quiz_responses')
        .select('combined_instructions')
        .eq('bot_id', botId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("Error fetching quiz responses:", error);
        return;
      }

      console.log("Quiz response found:", quizResponse);
      setCombinedInstructions(quizResponse?.combined_instructions || null);
    } catch (error) {
      console.error("Error in fetchQuizInstructions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizInstructions();
  }, [botId, quizMode]);

  return { combinedInstructions, isLoading, refetch: fetchQuizInstructions };
};