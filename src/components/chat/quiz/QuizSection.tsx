import React from 'react';
import { Button } from "@/components/ui/button";
import { QuizField } from './QuizField';
import { Field } from '@/components/bot/quiz/QuizFieldBuilder';

interface QuizSectionProps {
  fields: Field[];
  responses: Record<string, string | string[]>;
  onResponse: (fieldId: string, value: string | string[]) => void;
  onNext: () => void;
  isLastSection: boolean;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const QuizSection = ({ 
  fields, 
  responses, 
  onResponse, 
  onNext,
  isLastSection,
  onKeyPress
}: QuizSectionProps) => {
  const isComplete = fields.every(field => {
    const response = responses[field.id!];
    return response && (typeof response === 'string' ? response.trim() !== '' : response.length > 0);
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full max-w-4xl mx-auto p-6 space-y-8">
      {fields.map((field) => (
        <QuizField
          key={field.id}
          field={field}
          value={responses[field.id!] || (field.field_type.includes('choice') ? [] : '')}
          onChange={(value) => onResponse(field.id!, value)}
          onKeyPress={onKeyPress}
        />
      ))}
      
      {isComplete && (
        <Button
          onClick={onNext}
          className="mt-8 px-8 py-6 text-lg font-semibold bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
        >
          {isLastSection ? "Let's Start" : "Next"}
        </Button>
      )}
    </div>
  );
};