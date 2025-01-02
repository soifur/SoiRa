import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { QuizConfiguration, QuizHistory } from "@/types/quiz";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QuizResultsSummary } from "./QuizResultsSummary";
import { QuizProgressTracker } from "./QuizProgressTracker";
import { QuizQuestion } from "./QuizQuestion";
import { QuizNavigation } from "./QuizNavigation";
import { QuizTimer } from "./QuizTimer";

interface QuizTakerProps {
  quiz: QuizConfiguration;
  onComplete: (history: QuizHistory) => void;
}

export const QuizTaker = ({ quiz, onComplete }: QuizTakerProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizHistory | null>(null);
  const { toast } = useToast();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId,
    });
    setShowFeedback(true);

    const isCorrect = currentQuestion.options.find(o => o.id === optionId)?.isCorrect;
    toast({
      title: isCorrect ? "Correct!" : "Incorrect",
      description: isCorrect 
        ? "Great job! Keep going!" 
        : "Don't worry, keep trying!",
      variant: isCorrect ? "default" : "destructive",
    });
  };

  const handleTimeUp = () => {
    toast({
      title: "Time's up!",
      description: "Your quiz will be submitted automatically.",
      variant: "destructive",
    });
    handleSubmit();
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

  const isCorrectAnswer = (questionId: string, selectedOptionId: string) => {
    const question = quiz.questions.find(q => q.id === questionId);
    return question?.options.find(o => o.id === selectedOptionId)?.isCorrect || false;
  };

  const handleSubmit = async () => {
    const score = calculateScore();
    const passed = score >= quiz.passingScore;

    try {
      const { data: historyData, error } = await supabase
        .from("quiz_history")
        .insert({
          quiz_id: quiz.id,
          answers: Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
            questionId,
            selectedOptionId: optionId,
          })),
          score,
          status: "completed",
        })
        .select()
        .single();

      if (error) throw error;

      const history: QuizHistory = {
        id: historyData.id,
        quizId: historyData.quiz_id,
        answers: historyData.answers as { questionId: string; selectedOptionId: string; }[],
        score: historyData.score,
        status: historyData.status,
        sessionToken: historyData.session_token,
        userId: historyData.user_id,
        createdAt: historyData.created_at,
        updatedAt: historyData.updated_at,
      };

      setQuizHistory(history);
      onComplete(history);

      toast({
        title: passed ? "Congratulations!" : "Quiz Completed",
        description: `You scored ${score}%. ${
          passed ? "You passed!" : "Keep practicing!"
        }`,
      });
    } catch (error) {
      console.error("Error saving quiz results:", error);
      toast({
        title: "Error",
        description: "Failed to save quiz results",
        variant: "destructive",
      });
    }
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowFeedback(false);
    setQuizHistory(null);
  };

  if (quizHistory) {
    return (
      <div className="space-y-6">
        <QuizResultsSummary
          quiz={quiz}
          history={quizHistory}
          onRetake={handleRetake}
          onReview={() => {
            // Handle review
          }}
        />
        <QuizProgressTracker
          totalQuestions={totalQuestions}
          answeredQuestions={answeredQuestions}
          score={quizHistory.score}
          passingScore={quiz.passingScore}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{quiz.title}</h2>
        <QuizTimer onTimeUp={handleTimeUp} />
      </div>

      <Progress value={progress} className="w-full" />

      <div className="text-sm text-muted-foreground">
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </div>

      {currentQuestion && (
        <QuizQuestion
          question={currentQuestion}
          selectedAnswer={selectedAnswers[currentQuestion.id]}
          showFeedback={showFeedback}
          onOptionSelect={handleOptionSelect}
        />
      )}

      <QuizNavigation
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        showFeedback={showFeedback}
        hasSelectedAnswer={!!selectedAnswers[currentQuestion.id]}
        onPrevious={() => {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
          setShowFeedback(true);
        }}
        onNext={() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setShowFeedback(false);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};