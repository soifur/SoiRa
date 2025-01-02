import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuizHistory } from "@/types/quiz";

interface QuizProgressTrackerProps {
  attempts: QuizHistory[];
  passingScore: number;
}

export const QuizProgressTracker = ({ attempts, passingScore }: QuizProgressTrackerProps) => {
  const sortedAttempts = [...attempts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const averageScore = attempts.length > 0
    ? attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / attempts.length
    : 0;

  const bestScore = attempts.length > 0
    ? Math.max(...attempts.map(attempt => attempt.score || 0))
    : 0;

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-semibold">Your Progress</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span>Best Score</span>
            <span>{bestScore}%</span>
          </div>
          <Progress value={bestScore} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span>Average Score</span>
            <span>{Math.round(averageScore)}%</span>
          </div>
          <Progress value={averageScore} className="h-2" />
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Recent Attempts</h4>
          <div className="space-y-2">
            {sortedAttempts.slice(0, 5).map((attempt, index) => (
              <div key={attempt.id} className="flex justify-between text-sm">
                <span>Attempt {attempts.length - index}</span>
                <span className={attempt.score >= passingScore ? "text-green-600" : "text-red-600"}>
                  {attempt.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};