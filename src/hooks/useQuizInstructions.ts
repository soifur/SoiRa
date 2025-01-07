import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useQuizInstructions = (botId: string, quizMode: boolean = false) => {
  const [combinedInstructions, setCombinedInstructions] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizInstructions = async () => {
      if (!quizMode || !botId) {
        console.log("Quiz mode disabled or no bot ID, skipping fetch");
        setCombinedInstructions(null);
        return;
      }

      try {
        console.log("Fetching quiz instructions for bot:", botId);
        
        const { data: quizResponse, error } = await supabase
          .from('quiz_responses')
          .select('combined_instructions')
          .eq('bot_id', botId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching quiz responses:", error);
          return;
        }

        console.log("Quiz response found:", quizResponse);
        setCombinedInstructions(quizResponse?.combined_instructions || null);
        
      } catch (error) {
        console.error("Error in fetchQuizInstructions:", error);
      }
    };

    fetchQuizInstructions();
  }, [botId, quizMode]);

  return { combinedInstructions };
};