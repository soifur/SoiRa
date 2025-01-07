import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseQuizProps {
  botId: string;
  onQuizComplete?: (instructions: string) => void;
}

export const useQuiz = ({ botId, onQuizComplete }: UseQuizProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if bot is published and has quiz mode enabled
  const { data: bot, isLoading: isBotLoading } = useQuery({
    queryKey: ['bot', botId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bots')
        .select('published, quiz_mode')
        .eq('id', botId)
        .single();

      if (error) {
        console.error('Error fetching bot:', error);
        return null;
      }
      return data;
    },
  });

  // Check for quiz configuration if bot is published and has quiz mode
  const { data: quizConfig, isLoading: isQuizConfigLoading } = useQuery({
    queryKey: ['quiz-config', botId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_configurations')
        .select('*')
        .eq('bot_id', botId)
        .eq('enabled', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching quiz config:', error);
        return null;
      }
      return data;
    },
    enabled: !!bot?.published && !!bot?.quiz_mode,
  });

  const handleQuizStart = () => {
    console.log("Quiz started");
    setShowModal(true);
  };

  const handleQuizComplete = async (instructions: string) => {
    setIsLoading(true);
    // Add a delay to ensure Supabase has time to update
    await new Promise(resolve => setTimeout(resolve, 3000));
    onQuizComplete?.(instructions);
    setShowModal(false);
    setIsLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const shouldShowQuiz = !isBotLoading && !isQuizConfigLoading && bot?.published && bot?.quiz_mode && quizConfig?.enabled;

  return {
    showModal,
    isLoading,
    shouldShowQuiz,
    handleQuizStart,
    handleQuizComplete,
    handleCloseModal
  };
};