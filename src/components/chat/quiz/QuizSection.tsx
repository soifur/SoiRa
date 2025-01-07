import { Button } from "@/components/ui/button";
import { Field } from "@/components/bot/quiz/QuizFieldBuilder";
import { QuizField } from "./QuizField";

interface QuizSectionProps {
  fields: Field[];
  responses: Record<string, string | string[]>;
  onResponse: (fieldId: string, value: string | string[]) => void;
}

export const QuizSection = ({ fields, responses, onResponse }: QuizSectionProps) => {
  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <QuizField
          key={field.id}
          field={field}
          response={responses[field.id!]}
          onResponse={onResponse}
        />
      ))}
    </div>
  );
};