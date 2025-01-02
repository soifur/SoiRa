import React from "react";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

interface QuizProgressTrackerProps {
  totalQuestions: number;
  answeredQuestions: number;
  score?: number;
  passingScore: number;
}

export const QuizProgressTracker = ({
  totalQuestions,
  answeredQuestions,
  score,
  passingScore,
}: QuizProgressTrackerProps) => {
  const progress = (answeredQuestions / totalQuestions) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Question {answeredQuestions} of {totalQuestions}
        </span>
        {score !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Score: {score}%</span>
            {score >= passingScore && (
              <Trophy className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        )}
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};