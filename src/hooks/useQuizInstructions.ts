import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useQuizInstructions = (botId: string, quizMode: boolean = false) => {
  const [combinedInstructions, setCombinedInstructions] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizInstructions = async () => {
      if (!quizMode || !botId) {
        setCombinedInstructions(null);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No authenticated user found");
          return;
        }

        // First check if this is a shared bot
        const { data: sharedBot } = await supabase
          .from('shared_bots')
          .select('quiz_mode, share_key')
          .eq('share_key', botId)
          .maybeSingle();

        console.log("Shared bot data:", sharedBot);

        // If this is a shared bot and quiz mode is enabled
        if (sharedBot?.quiz_mode) {
          console.log("Fetching quiz responses for shared bot with share_key:", sharedBot.share_key);
          
          // Use share_key as bot_id for quiz responses
          const { data: quizResponse, error: sharedError } = await supabase
            .from('quiz_responses')
            .select('combined_instructions')
            .eq('bot_id', sharedBot.share_key)  // Match share_key with bot_id
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (sharedError) {
            console.error("Error fetching shared bot quiz responses:", sharedError);
            return;
          }

          console.log("Shared bot quiz response:", quizResponse);
          setCombinedInstructions(quizResponse?.combined_instructions || null);
          return;
        }

        // If not a shared bot, fetch quiz response normally
        const { data: quizResponse, error } = await supabase
          .from('quiz_responses')
          .select('combined_instructions')
          .eq('bot_id', botId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching quiz responses:", error);
          return;
        }

        console.log("Regular bot quiz response:", quizResponse);
        setCombinedInstructions(quizResponse?.combined_instructions || null);
      } catch (error) {
        console.error("Error in fetchQuizInstructions:", error);
      }
    };

    fetchQuizInstructions();
  }, [botId, quizMode]);

  return { combinedInstructions };
};