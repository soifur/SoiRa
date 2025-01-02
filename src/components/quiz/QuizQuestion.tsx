import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { QuizQuestion as QuizQuestionType } from "@/types/quiz";

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswer?: string;
  showFeedback: boolean;
  onOptionSelect: (questionId: string, optionId: string) => void;
}

export const QuizQuestion = ({
  question,
  selectedAnswer,
  showFeedback,
  onOptionSelect,
}: QuizQuestionProps) => {
  const isCorrectAnswer = (optionId: string) => {
    return question.options.find((o) => o.id === optionId)?.isCorrect || false;
  };

  return (
    <Card className="p-4 space-y-4">
      <p className="font-medium">{question.text}</p>
      <div className="space-y-2">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const showCorrectness = showFeedback && isSelected;
          const isCorrect = option.isCorrect;

          return (
            <div key={option.id} className="relative">
              <Button
                variant={isSelected ? "default" : "outline"}
                className={`w-full justify-start ${
                  showCorrectness && isCorrect ? "bg-green-100" : ""
                } ${showCorrectness && !isCorrect ? "bg-red-100" : ""}`}
                onClick={() => onOptionSelect(question.id, option.id)}
                disabled={showFeedback}
              >
                {option.text}
                {showCorrectness && (
                  <span className="absolute right-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </span>
                )}
              </Button>
            </div>
          );
        })}
      </div>
      {showFeedback && selectedAnswer && (
        <div className="text-sm mt-2">
          {isCorrectAnswer(selectedAnswer) ? (
            <p className="text-green-600">Correct! Well done!</p>
          ) : (
            <p className="text-red-600">
              Incorrect. The correct answer is:{" "}
              {question.options.find((o) => o.isCorrect)?.text}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};