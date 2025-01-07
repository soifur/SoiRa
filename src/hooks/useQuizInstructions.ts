import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useQuizInstructions = (botId: string | undefined, quizMode?: boolean) => {
  const [combinedInstructions, setCombinedInstructions] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuizInstructions = async () => {
      try {
        if (!botId || !quizMode) {
          setCombinedInstructions(null);
          return;
        }

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found, skipping quiz instructions fetch");
          return;
        }

        console.log("Fetching quiz instructions for botId:", botId);

        // First check if this is a shared bot
        const { data: sharedBot } = await supabase
          .from('shared_bots')
          .select('quiz_mode, share_key, bot_id')
          .eq('short_key', botId)
          .maybeSingle();

        console.log("Shared bot data:", sharedBot);

        // Determine which bot ID to use for quiz responses
        let quizBotId = botId;
        
        // If this is a shared bot and quiz mode is enabled
        if (sharedBot?.quiz_mode) {
          console.log("Using share_key as bot_id for quiz responses:", sharedBot.share_key);
          quizBotId = sharedBot.share_key;
        }

        // Fetch the quiz response
        const { data: quizResponse, error } = await supabase
          .from('quiz_responses')
          .select('combined_instructions')
          .eq('bot_id', quizBotId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching quiz responses:", error);
          toast({
            title: "Error",
            description: "Failed to fetch quiz responses",
            variant: "destructive",
          });
          return;
        }

        console.log("Quiz response found:", quizResponse);
        setCombinedInstructions(quizResponse?.combined_instructions || null);
      } catch (error) {
        console.error("Error in fetchQuizInstructions:", error);
        toast({
          title: "Error",
          description: "Failed to fetch quiz instructions",
          variant: "destructive",
        });
      }
    };

    fetchQuizInstructions();
  }, [botId, quizMode, toast]);

  return { combinedInstructions };
};