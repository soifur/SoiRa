import React from "react";
import { Card } from "@/components/ui/card";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizConfiguration, QuizHistory } from "@/types/quiz";

interface QuizResultsSummaryProps {
  quiz: QuizConfiguration;
  history: QuizHistory;
  onRetake?: () => void;
  onReview: () => void;
}

export const QuizResultsSummary = ({
  quiz,
  history,
  onRetake,
  onReview,
}: QuizResultsSummaryProps) => {
  const score = history.score || 0;
  const passed = score >= quiz.passingScore;
  const totalQuestions = quiz.questions.length;
  const correctAnswers = history.answers.filter(answer => {
    const question = quiz.questions.find(q => q.id === answer.questionId);
    return question?.options.find(o => o.id === answer.selectedOptionId)?.isCorrect;
  }).length;

  return (
    <Card className="p-6 space-y-6">
      <div className="text-center space-y-2">
        {passed ? (
          <>
            <Trophy className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="text-2xl font-bold text-green-600">
              Congratulations!
            </h2>
            <p className="text-muted-foreground">
              You passed the quiz with a score of {score}%
            </p>
          </>
        ) : (
          <>
            <X className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="text-2xl font-bold text-red-600">
              Keep Practicing
            </h2>
            <p className="text-muted-foreground">
              You scored {score}%. The passing score is {quiz.passingScore}%.
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{totalQuestions}</div>
          <div className="text-sm text-muted-foreground">Total Questions</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{correctAnswers}</div>
          <div className="text-sm text-muted-foreground">Correct Answers</div>
        </div>
      </div>

      <div className="flex gap-4">
        {onRetake && (
          <Button onClick={onRetake} variant="outline" className="flex-1">
            Try Again
          </Button>
        )}
        <Button onClick={onReview} className="flex-1">
          Review Answers
        </Button>
      </div>
    </Card>
  );
};