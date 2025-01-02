import React from "react";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { QuizConfiguration } from "@/types/quiz";
import { Button } from "@/components/ui/button";

interface QuizReviewProps {
  quiz: QuizConfiguration;
  history: { questionId: string; selectedOptionId: string; }[];
  onClose: () => void;
}

export const QuizReview = ({ quiz, history, onClose }: QuizReviewProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Quiz Review</h2>
        <Button variant="outline" onClick={onClose}>Close Review</Button>
      </div>
      {quiz.questions.map((question, index) => {
        const userAnswer = history.find(
          (a) => a.questionId === question.id
        );
        const selectedOption = question.options.find(
          (o) => o.id === userAnswer?.selectedOptionId
        );
        const correctOption = question.options.find((o) => o.isCorrect);
        const isCorrect = selectedOption?.isCorrect;

        return (
          <Card key={question.id} className="p-4 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium">Question {index + 1}:</span>
              <div className="flex-1">{question.text}</div>
              {isCorrect ? (
                <Check className="text-green-500 h-5 w-5 flex-shrink-0" />
              ) : (
                <X className="text-red-500 h-5 w-5 flex-shrink-0" />
              )}
            </div>
            <div className="pl-6 space-y-1">
              <div>
                <span className="font-medium">Your answer: </span>
                {selectedOption?.text || "No answer provided"}
              </div>
              {!isCorrect && (
                <div className="text-green-600">
                  <span className="font-medium">Correct answer: </span>
                  {correctOption?.text}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};