import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizConfiguration, QuizHistory } from "@/types/quiz";

interface QuizResultsSummaryProps {
  quiz: QuizConfiguration;
  history: QuizHistory;
  onRetake: () => void;
}

export const QuizResultsSummary = ({ quiz, history, onRetake }: QuizResultsSummaryProps) => {
  const score = history.score || 0;
  const passed = score >= quiz.passingScore;
  const totalQuestions = quiz.questions.length;
  const correctAnswers = Math.round((score / 100) * totalQuestions);

  return (
    <Card className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
        <p className="text-lg mb-4">
          {passed ? (
            <span className="text-green-600 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-6 w-6" />
              Congratulations! You passed!
            </span>
          ) : (
            <span className="text-red-600 flex items-center justify-center gap-2">
              <XCircle className="h-6 w-6" />
              Keep practicing!
            </span>
          )}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span>Score</span>
            <span>{score}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-background rounded-lg">
            <div className="text-2xl font-bold">{correctAnswers}</div>
            <div className="text-sm text-muted-foreground">Correct Answers</div>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <div className="text-2xl font-bold">{totalQuestions - correctAnswers}</div>
            <div className="text-sm text-muted-foreground">Incorrect Answers</div>
          </div>
        </div>

        <div className="text-center">
          <Button onClick={onRetake} className="mt-4">
            Retake Quiz
          </Button>
        </div>
      </div>
    </Card>
  );
};