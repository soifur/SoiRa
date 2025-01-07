import React from 'react';
import { Field } from '@/components/bot/quiz/QuizFieldBuilder';

interface QuizFieldProps {
  field: Field;
  responses: Record<string, string | string[]>;
  onResponse: (fieldId: string, value: string | string[]) => void;
}

export const QuizField: React.FC<QuizFieldProps> = ({ field, responses, onResponse }) => {
  switch (field.field_type) {
    case 'text':
    case 'email':
    case 'phone':
      return (
        <input
          type={field.field_type}
          value={responses[field.id!] as string || ''}
          onChange={(e) => onResponse(field.id!, e.target.value)}
          className="w-full p-2 border rounded"
          placeholder={`Enter your ${field.field_type}`}
        />
      );
    case 'single_choice':
      return (
        <div className="space-y-2">
          {field.choices?.map((choice) => (
            <label key={choice} className="flex items-center space-x-2">
              <input
                type="radio"
                name={field.id!}
                value={choice}
                checked={(responses[field.id!] as string) === choice}
                onChange={(e) => onResponse(field.id!, e.target.value)}
              />
              <span>{choice}</span>
            </label>
          ))}
        </div>
      );
    case 'multiple_choice':
      return (
        <div className="space-y-2">
          {field.choices?.map((choice) => (
            <label key={choice} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={choice}
                checked={Array.isArray(responses[field.id!]) && 
                  (responses[field.id!] as string[]).includes(choice)}
                onChange={(e) => {
                  const currentValues = (responses[field.id!] as string[]) || [];
                  const newValues = e.target.checked
                    ? [...currentValues, choice]
                    : currentValues.filter(v => v !== choice);
                  onResponse(field.id!, newValues);
                }}
              />
              <span>{choice}</span>
            </label>
          ))}
        </div>
      );
    default:
      return null;
  }
};