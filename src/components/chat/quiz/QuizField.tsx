import { Field } from "@/components/bot/quiz/QuizFieldBuilder";
import { QuizOption } from "./QuizOption";

interface QuizFieldProps {
  field: Field;
  response: string | string[];
  onResponse: (fieldId: string, value: string | string[]) => void;
}

export const QuizField = ({ field, response, onResponse }: QuizFieldProps) => {
  const handleSingleChoice = (choice: string) => {
    onResponse(field.id!, choice);
  };

  const handleMultipleChoice = (choice: string) => {
    const currentValues = (response as string[]) || [];
    const newValues = currentValues.includes(choice)
      ? currentValues.filter(v => v !== choice)
      : [...currentValues, choice];
    onResponse(field.id!, newValues);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold tracking-tight">{field.title}</h3>
      <div className="grid gap-4">
        {field.field_type === 'text' || field.field_type === 'email' || field.field_type === 'phone' ? (
          <input
            type={field.field_type}
            value={response as string || ''}
            onChange={(e) => onResponse(field.id!, e.target.value)}
            className="w-full p-4 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={`Enter your ${field.field_type}`}
          />
        ) : (
          <div className="grid gap-4">
            {field.choices?.map((choice) => (
              <QuizOption
                key={choice}
                value={choice}
                isSelected={
                  field.field_type === 'single_choice'
                    ? response === choice
                    : (response as string[])?.includes(choice)
                }
                onClick={() =>
                  field.field_type === 'single_choice'
                    ? handleSingleChoice(choice)
                    : handleMultipleChoice(choice)
                }
                type={field.field_type === 'single_choice' ? 'radio' : 'checkbox'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};