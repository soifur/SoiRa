import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuizField } from "./QuizField";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuizFieldBuilderProps {
  botId: string;
  fields?: Field[];
  onFieldsChange?: (newFields: Field[]) => void;
}

export type FieldType = 'text' | 'email' | 'phone' | 'single_choice' | 'multiple_choice';

export interface Field {
  id?: string;
  field_type: FieldType;
  title: string;
  instructions?: string;
  choices?: string[];
  single_section: boolean;
  sequence_number: number;
}

export const QuizFieldBuilder = ({ botId, fields: initialFields, onFieldsChange }: QuizFieldBuilderProps) => {
  const [fields, setFields] = useState<Field[]>(initialFields || []);
  const { toast } = useToast();

  useEffect(() => {
    if (initialFields) {
      setFields(initialFields);
    }
  }, [initialFields]);

  const addField = () => {
    const newField: Field = {
      field_type: 'text',
      title: '',
      instructions: '',
      single_section: false,
      sequence_number: fields.length,
    };
    const newFields = [...fields, newField];
    setFields(newFields);
    onFieldsChange?.(newFields);
  };

  const updateField = (index: number, updatedField: Field) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    setFields(newFields);
    onFieldsChange?.(newFields);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    onFieldsChange?.(newFields);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <QuizField
            key={field.id || index}
            field={field}
            onChange={(updatedField) => updateField(index, updatedField)}
            onRemove={() => removeField(index)}
          />
        ))}
      </div>
      
      <Button onClick={addField} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Field
      </Button>
    </div>
  );
};