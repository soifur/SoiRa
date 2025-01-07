import React from "react";
import { Field } from "@/components/bot/quiz/QuizFieldBuilder";
import { QuizOption } from "./QuizOption";
import { cn } from "@/lib/utils";

interface QuizFieldProps {
  field: Field;
  response?: string | string[];
  onResponse: (fieldId: string, value: string | string[]) => void;
}

export const QuizField = ({ field, response, onResponse }: QuizFieldProps) => {
  const handleOptionClick = (value: string) => {
    onResponse(field.id!, value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-medium text-center mb-6">{field.title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field.choices?.map((choice) => (
          <QuizOption
            key={choice}
            isSelected={response === choice}
            onClick={() => handleOptionClick(choice)}
          >
            {choice}
          </QuizOption>
        ))}
      </div>
    </div>
  );
};