import React from "react";
import { Button } from "@/components/ui/button";

interface QuizNavigationProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  showFeedback: boolean;
  hasSelectedAnswer: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const QuizNavigation = ({
  currentQuestionIndex,
  totalQuestions,
  showFeedback,
  hasSelectedAnswer,
  onPrevious,
  onNext,
  onSubmit,
}: QuizNavigationProps) => {
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
      >
        Previous
      </Button>
      {currentQuestionIndex === totalQuestions - 1 ? (
        <Button onClick={onSubmit} disabled={!hasSelectedAnswer || !showFeedback}>
          Submit Quiz
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!hasSelectedAnswer || !showFeedback}
        >
          Next
        </Button>
      )}
    </div>
  );
};