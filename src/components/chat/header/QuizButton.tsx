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
      console.log("Fetching quiz config for bot:", botId);
      const { data, error } = await supabase
        .from('quiz_configurations')
        .select('*')
        .eq('bot_id', botId)
        .eq('enabled', true)
        .maybeSingle();

      if (error) throw error;
      console.log("Quiz config:", data);
      return data;
    },
    enabled: !!botId,
  });

  const handleQuizComplete = async (instructions: string) => {
    console.log("Quiz completed with instructions:", instructions);
    
    // Wait a moment for Supabase to finish saving
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Double check that the instructions were saved
    const { data: quizResponse } = await supabase
      .from('quiz_responses')
      .select('combined_instructions')
      .eq('quiz_id', botId)
      .maybeSingle();
      
    console.log("Verified quiz response:", quizResponse);
    
    if (quizResponse?.combined_instructions) {
      console.log("Using verified instructions:", quizResponse.combined_instructions);
      onQuizComplete?.(quizResponse.combined_instructions);
    } else {
      console.warn("Quiz response not found after waiting");
      // Use the original instructions as fallback
      onQuizComplete?.(instructions);
    }
    
    setShowModal(false);
  };

  if (!quizConfig?.enabled) return null;

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => {
          console.log("Starting quiz for bot:", botId);
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