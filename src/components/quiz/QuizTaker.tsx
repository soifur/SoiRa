import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuizConfiguration, QuizQuestion } from "@/types/quiz";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuizTakerProps {
  quiz: QuizConfiguration;
  onComplete: () => void;
}

export const QuizTaker = ({ quiz, onComplete }: QuizTakerProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId,
    });
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    quiz.questions.forEach((question) => {
      const selectedOptionId = selectedAnswers[question.id];
      const correctOption = question.options.find((o) => o.isCorrect);
      if (selectedOptionId && correctOption && selectedOptionId === correctOption.id) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const handleSubmit = async () => {
    const score = calculateScore();
    const passed = score >= quiz.passingScore;

    try {
      await supabase.from("quiz_history").insert({
        quiz_id: quiz.id,
        answers: Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
          questionId,
          selectedOptionId: optionId,
        })),
        score,
        status: "completed",
      });

      toast({
        title: passed ? "Congratulations!" : "Quiz Completed",
        description: `You scored ${score}%. ${
          passed ? "You passed!" : "Keep practicing!"
        }`,
      });

      onComplete();
    } catch (error) {
      console.error("Error saving quiz results:", error);
      toast({
        title: "Error",
        description: "Failed to save quiz results",
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const canSubmit = Object.keys(selectedAnswers).length === totalQuestions;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{quiz.title}</h2>
        <span className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </span>
      </div>

      {currentQuestion && (
        <Card className="p-4 space-y-4">
          <p className="font-medium">{currentQuestion.text}</p>
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <Button
                key={option.id}
                variant={
                  selectedAnswers[currentQuestion.id] === option.id
                    ? "default"
                    : "outline"
                }
                className="w-full justify-start"
                onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
              >
                {option.text}
              </Button>
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        {isLastQuestion ? (
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!selectedAnswers[currentQuestion.id]}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};