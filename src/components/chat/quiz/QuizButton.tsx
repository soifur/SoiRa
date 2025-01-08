import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { QuizModal } from "./QuizModal";
import { useQuiz } from "@/hooks/useQuiz";

export interface QuizButtonProps {
  bot_id: string;
  onStartQuiz: () => void;
  onQuizComplete?: (instructions: string) => void;
}

export const QuizButton = ({ bot_id, onStartQuiz, onQuizComplete }: QuizButtonProps) => {
  const {
    showModal,
    isLoading,
    shouldShowQuiz,
    handleQuizStart,
    handleQuizComplete,
    handleCloseModal
  } = useQuiz({ 
    botId: bot_id, 
    onQuizComplete: (instructions) => {
      handleCloseModal();
      onQuizComplete?.(instructions);
    }
  });

  if (!shouldShowQuiz) {
    return null;
  }

  return (
    <>
      <Button
        size="lg"
        onClick={() => {
          onStartQuiz();
          handleQuizStart();
        }}
        className="w-full md:w-auto px-8 py-6 text-lg font-semibold rounded-xl
                   bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600
                   transform transition-all duration-200 hover:scale-105 active:scale-95
                   shadow-lg hover:shadow-xl"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            Click Here to Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
      
      <QuizModal
        isOpen={showModal}
        onClose={handleCloseModal}
        botId={bot_id}
        onComplete={handleQuizComplete}
      />
    </>
  );
};