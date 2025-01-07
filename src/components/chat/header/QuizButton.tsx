import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuizModal } from "../quiz/QuizModal";

interface QuizButtonProps {
  botId: string;
  onStartQuiz: () => void;
  onQuizComplete?: (instructions: string) => void;
}

export const QuizButton = ({ botId, onStartQuiz, onQuizComplete }: QuizButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  
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

  const handleQuizComplete = (instructions: string) => {
    onQuizComplete?.(instructions);
    setShowModal(false);
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
      >
        Start Now
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