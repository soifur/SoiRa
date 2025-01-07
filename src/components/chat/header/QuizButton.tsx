import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuizModal } from "../quiz/QuizModal";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizButtonProps {
  botId: string;
  onStartQuiz: () => void;
  onQuizComplete?: (instructions: string) => void;
  className?: string;
}

export const QuizButton = ({ botId, onStartQuiz, onQuizComplete, className }: QuizButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // First check if the bot is published and has quiz mode enabled
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

  // Then check for quiz configuration if bot is published and has quiz mode
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

  const handleQuizComplete = async (instructions: string) => {
    setIsLoading(true);
    // Add a delay to ensure Supabase has time to update
    await new Promise(resolve => setTimeout(resolve, 3000));
    onQuizComplete?.(instructions);
    setShowModal(false);
    setIsLoading(false);
  };

  // Show loading state while checking permissions
  if (isBotLoading || isQuizConfigLoading) {
    return null;
  }

  // Only show the button if:
  // 1. The bot exists and is published
  // 2. Quiz mode is enabled for the bot
  // 3. There is an enabled quiz configuration
  if (!bot?.published || !bot?.quiz_mode || !quizConfig?.enabled) {
    return null;
  }

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => {
          onStartQuiz();
          setShowModal(true);
        }}
        className={cn("ml-2", className)}
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