import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuizModal } from "../quiz/QuizModal";
import { Loader2 } from "lucide-react";
import { useQuizInstructions } from "@/hooks/useQuizInstructions";

interface QuizButtonProps {
  botId: string;
  onStartQuiz: () => void;
  onQuizComplete?: (instructions: string) => void;
}

export const QuizButton = ({ botId, onStartQuiz, onQuizComplete }: QuizButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: quizConfig } = useQuery({
    queryKey: ['quiz-config', botId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_configurations')
        .select('*')
        .eq('bot_id', botId)
        .eq('enabled', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!botId,
  });

  const { refetch: refetchInstructions } = useQuizInstructions(botId, true);

  const handleQuizComplete = async (instructions: string) => {
    setIsLoading(true);
    // Add a delay to ensure Supabase has time to update
    await new Promise(resolve => setTimeout(resolve, 3000));
    // Refetch instructions after the delay
    await refetchInstructions();
    onQuizComplete?.(instructions);
    setShowModal(false);
    setIsLoading(false);
  };

  if (!quizConfig?.enabled) return null;

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => {
          onStartQuiz();
          setShowModal(true);
        }}
        className="ml-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          'Start Now'
        )}
      </Button>
      
      <QuizModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        botId={botId}
        onComplete={handleQuizComplete}
      />
    </>
  );
};