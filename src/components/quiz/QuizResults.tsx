import React from "react";
import { Card } from "@/components/ui/card";
import { QuizHistory } from "@/types/quiz";

interface QuizResultsProps {
  history: QuizHistory[];
}

export const QuizResults = ({ history }: QuizResultsProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Quiz History</h2>
      {history.map((attempt) => (
        <Card key={attempt.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">
                Score: {attempt.score}%
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(attempt.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className={`px-2 py-1 rounded text-sm ${
              attempt.score >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {attempt.score >= 75 ? 'Passed' : 'Failed'}
            </div>
          </div>
        </Card>
      ))}
      {history.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No quiz attempts yet
        </p>
      )}
    </div>
  );
};