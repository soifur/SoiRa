import React from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";

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
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      
      {score !== undefined && (
        <div className="flex items-center gap-2 mt-4">
          {score >= passingScore ? (
            <CheckCircle2 className="text-green-500 h-5 w-5" />
          ) : (
            <XCircle className="text-red-500 h-5 w-5" />
          )}
          <span className="text-sm">
            Score: {score}% (Passing: {passingScore}%)
          </span>
        </div>
      )}
    </div>
  );
};