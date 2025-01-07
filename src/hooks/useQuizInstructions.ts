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
          console.log("Quiz mode disabled or no botId, skipping fetch", { botId, quizMode });
          setCombinedInstructions(null);
          return;
        }

        // Get the current user or client IP
        const { data: { user } } = await supabase.auth.getUser();
        const { data: { user_ip } } = await supabase.functions.invoke('get-client-ip');
        const userId = user?.id || user_ip;

        if (!userId) {
          console.log("No user ID or client IP found");
          return;
        }

        console.log("Fetching quiz instructions for:", { botId, userId });

        // First check if this is a shared bot
        const { data: sharedBot } = await supabase
          .from('shared_bots')
          .select('quiz_mode, share_key, bot_id, short_key')
          .eq('short_key', botId)
          .maybeSingle();

        console.log("Shared bot lookup result:", sharedBot);

        // Determine which bot ID to use for quiz responses
        const quizBotId = sharedBot?.share_key || botId;
        console.log("Using bot ID for quiz responses:", quizBotId);

        // Fetch the quiz response
        const { data: quizResponse, error } = await supabase
          .from('quiz_responses')
          .select('combined_instructions')
          .eq('bot_id', quizBotId)
          .eq('user_id', userId)
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
        
        if (quizResponse?.combined_instructions) {
          console.log("Setting combined instructions:", quizResponse.combined_instructions);
          setCombinedInstructions(quizResponse.combined_instructions);
        } else {
          console.log("No combined instructions found");
          setCombinedInstructions(null);
        }
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