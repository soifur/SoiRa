import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuizModal } from "../quiz/QuizModal";
import { LoaderCircle } from "lucide-react";

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

  const handleQuizComplete = async (instructions: string) => {
    setIsLoading(true);
    try {
      // Wait for 3 seconds to ensure Supabase has updated
      await new Promise(resolve => setTimeout(resolve, 3000));
      onQuizComplete?.(instructions);
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
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
          <div className="flex items-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          "Start Now"
        )}
      </Button>
      
      <QuizModal
        isOpen={showModal}
        onClose={() => !isLoading && setShowModal(false)}
        botId={botId}
        onComplete={handleQuizComplete}
      />
    </>
  );
};