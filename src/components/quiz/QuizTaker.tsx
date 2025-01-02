import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuizConfiguration, QuizQuestion } from "@/types/quiz";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuizTakerProps {
  quiz: QuizConfiguration;
  onComplete: () => void;
}

export const QuizTaker = ({ quiz, onComplete }: QuizTakerProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const { toast } = useToast();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = (currentQuestionIndex / totalQuestions) * 100;

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId,
    });
    setShowFeedback(true);
  };

  const isCorrectAnswer = (questionId: string, selectedOptionId: string) => {
    const question = quiz.questions.find(q => q.id === questionId);
    return question?.options.find(o => o.id === selectedOptionId)?.isCorrect || false;
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    quiz.questions.forEach((question) => {
      const selectedOptionId = selectedAnswers[question.id];
      if (selectedOptionId && isCorrectAnswer(question.id, selectedOptionId)) {
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
      setShowFeedback(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowFeedback(true);
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

      <Progress value={progress} className="h-2" />

      {currentQuestion && (
        <Card className="p-4 space-y-4">
          <p className="font-medium">{currentQuestion.text}</p>
          <div className="space-y-2">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option.id;
              const showCorrectness = showFeedback && isSelected;
              const isCorrect = option.isCorrect;

              return (
                <div key={option.id} className="relative">
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full justify-start ${
                      showCorrectness && isCorrect ? "bg-green-100" : ""
                    } ${showCorrectness && !isCorrect ? "bg-red-100" : ""}`}
                    onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                    disabled={showFeedback}
                  >
                    {option.text}
                    {showCorrectness && (
                      <span className="absolute right-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </span>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
          {showFeedback && (
            <div className="text-sm mt-2">
              {isCorrectAnswer(currentQuestion.id, selectedAnswers[currentQuestion.id]) ? (
                <p className="text-green-600">Correct! Well done!</p>
              ) : (
                <p className="text-red-600">
                  Incorrect. The correct answer is: {
                    currentQuestion.options.find(o => o.isCorrect)?.text
                  }
                </p>
              )}
            </div>
          )}
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
          <Button 
            onClick={handleSubmit} 
            disabled={!canSubmit || !showFeedback}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!selectedAnswers[currentQuestion.id] || !showFeedback}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};