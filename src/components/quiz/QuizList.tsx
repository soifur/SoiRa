import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizConfiguration } from "@/types/quiz";
import { Trash2, GraduationCap, Play } from "lucide-react";
import { QuizTaker } from "./QuizTaker";

interface QuizListProps {
  configurations: QuizConfiguration[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export const QuizList = ({ configurations, isLoading, onDelete }: QuizListProps) => {
  const [selectedQuiz, setSelectedQuiz] = useState<QuizConfiguration | null>(null);

  if (isLoading) {
    return <div className="text-center text-muted-foreground py-8">Loading...</div>;
  }

  if (selectedQuiz) {
    return (
      <QuizTaker
        quiz={selectedQuiz}
        onComplete={() => setSelectedQuiz(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {configurations.map((quiz) => (
        <Card key={quiz.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{quiz.title}</h3>
              </div>
              {quiz.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {quiz.description}
                </p>
              )}
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>{quiz.questions.length} questions</span>
                <span>Passing score: {quiz.passingScore}%</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedQuiz(quiz)}
              >
                <Play className="h-4 w-4 mr-2" />
                Take Quiz
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(quiz.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
      {configurations.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No quizzes created yet
        </div>
      )}
    </div>
  );
};