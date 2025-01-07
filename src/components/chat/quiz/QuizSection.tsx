import React from 'react';
import { Field } from '@/components/bot/quiz/QuizFieldBuilder';
import { QuizField } from './QuizField';

interface QuizSectionProps {
  fields: Field[];
  responses: Record<string, string | string[]>;
  onResponse: (fieldId: string, value: string | string[]) => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ fields, responses, onResponse }) => {
  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <div key={field.id} className="space-y-4">
          <h3 className="text-lg font-medium">{field.title}</h3>
          <QuizField
            field={field}
            responses={responses}
            onResponse={onResponse}
          />
        </div>
      ))}
    </div>
  );
};