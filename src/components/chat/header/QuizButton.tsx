import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { QuizModal } from "../quiz/QuizModal";
import { useQuiz } from "@/hooks/useQuiz";

interface QuizButtonProps {
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
  } = useQuiz({ botId: bot_id, onQuizComplete });

  if (!shouldShowQuiz) {
    return null;
  }

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => {
          onStartQuiz();
          handleQuizStart();
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
        onClose={handleCloseModal}
        botId={bot_id}
        onComplete={handleQuizComplete}
      />
    </>
  );
};