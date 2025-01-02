import React from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizResultsSummaryProps {
  score: number;
  passingScore: number;
  totalQuestions: number;
  correctAnswers: number;
  onRetry?: () => void;
  onReview: () => void;
}

export const QuizResultsSummary = ({
  score,
  passingScore,
  totalQuestions,
  correctAnswers,
  onRetry,
  onReview,
}: QuizResultsSummaryProps) => {
  const passed = score >= passingScore;

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
              You scored {score}%. The passing score is {passingScore}%.
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
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="flex-1">
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