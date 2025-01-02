import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { QuizQuestion } from "@/types/quiz";

interface QuestionFormProps {
  question: QuizQuestion;
  questionIndex: number;
  onQuestionUpdate: (questionId: string, text: string) => void;
  onQuestionRemove: (questionId: string) => void;
  onOptionAdd: (questionId: string) => void;
  onOptionUpdate: (questionId: string, optionId: string, text: string, isCorrect: boolean) => void;
  onOptionRemove: (questionId: string, optionId: string) => void;
}

export const QuestionForm = ({
  question,
  questionIndex,
  onQuestionUpdate,
  onQuestionRemove,
  onOptionAdd,
  onOptionUpdate,
  onOptionRemove,
}: QuestionFormProps) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Input
            value={question.text}
            onChange={(e) => onQuestionUpdate(question.id, e.target.value)}
            placeholder={`Question ${questionIndex + 1}`}
            required
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onQuestionRemove(question.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="pl-4 space-y-2">
        {question.options.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <Input
              value={option.text}
              onChange={(e) =>
                onOptionUpdate(question.id, option.id, e.target.value, option.isCorrect)
              }
              placeholder="Option text"
              className="flex-1"
              required
            />
            <Button
              type="button"
              variant={option.isCorrect ? "default" : "outline"}
              size="sm"
              onClick={() =>
                onOptionUpdate(question.id, option.id, option.text, !option.isCorrect)
              }
            >
              Correct
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOptionRemove(question.id, option.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOptionAdd(question.id)}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Option
        </Button>
      </div>
    </Card>
  );
};