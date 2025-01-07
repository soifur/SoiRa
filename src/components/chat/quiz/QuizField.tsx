import React from 'react';
import { Input } from "@/components/ui/input";
import { QuizButton } from './QuizButton';
import { Field } from '@/components/bot/quiz/QuizFieldBuilder';

interface QuizFieldProps {
  field: Field;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

export const QuizField = ({ field, value, onChange }: QuizFieldProps) => {
  const handleSingleChoice = (choice: string) => {
    onChange(choice);
  };

  const handleMultipleChoice = (choice: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(choice)
      ? currentValues.filter(v => v !== choice)
      : [...currentValues, choice];
    onChange(newValues);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <h3 className="text-2xl font-semibold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-pink-500">
        {field.title}
      </h3>
      
      {(field.field_type === 'text' || field.field_type === 'email' || field.field_type === 'phone') && (
        <Input
          type={field.field_type}
          value={value as string || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 text-lg"
          placeholder={`Enter your ${field.field_type}`}
        />
      )}

      {field.field_type === 'single_choice' && field.choices && (
        <div className="grid gap-4">
          {field.choices.map((choice) => (
            <QuizButton
              key={choice}
              selected={value === choice}
              onClick={() => handleSingleChoice(choice)}
            >
              {choice}
            </QuizButton>
          ))}
        </div>
      )}

      {field.field_type === 'multiple_choice' && field.choices && (
        <div className="grid gap-4">
          {field.choices.map((choice) => (
            <QuizButton
              key={choice}
              selected={Array.isArray(value) && value.includes(choice)}
              onClick={() => handleMultipleChoice(choice)}
            >
              {choice}
            </QuizButton>
          ))}
        </div>
      )}
    </div>
  );
};