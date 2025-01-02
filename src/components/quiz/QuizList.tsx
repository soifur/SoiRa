import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizConfiguration } from "@/types/quiz";
import { Trash2, GraduationCap } from "lucide-react";

interface QuizListProps {
  quizzes: QuizConfiguration[];
  onDelete: (id: string) => void;
}

export const QuizList = ({ quizzes, onDelete }: QuizListProps) => {
  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(quiz.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
      {quizzes.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No quizzes created yet
        </div>
      )}
    </div>
  );
};