import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuizField } from "./QuizField";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuizFieldBuilderProps {
  botId: string;
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

export const QuizFieldBuilder = ({ botId }: QuizFieldBuilderProps) => {
  const [fields, setFields] = useState<Field[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadFields();
  }, [botId]);

  const loadFields = async () => {
    try {
      const { data: quizConfig } = await supabase
        .from('quiz_configurations')
        .select('id')
        .eq('bot_id', botId)
        .single();

      if (quizConfig) {
        const { data: fields } = await supabase
          .from('quiz_fields')
          .select('*')
          .eq('quiz_id', quizConfig.id)
          .order('sequence_number', { ascending: true });

        if (fields) {
          setFields(fields);
        }
      }
    } catch (error) {
      console.error('Error loading fields:', error);
    }
  };

  const addField = () => {
    const newField: Field = {
      field_type: 'text',
      title: '',
      instructions: '',
      single_section: false,
      sequence_number: fields.length,
    };
    setFields([...fields, newField]);
  };

  const updateField = async (index: number, updatedField: Field) => {
    try {
      const newFields = [...fields];
      newFields[index] = updatedField;
      setFields(newFields);

      const { data: quizConfig } = await supabase
        .from('quiz_configurations')
        .select('id')
        .eq('bot_id', botId)
        .single();

      if (quizConfig) {
        if (updatedField.id) {
          await supabase
            .from('quiz_fields')
            .update({
              ...updatedField,
              quiz_id: quizConfig.id,
            })
            .eq('id', updatedField.id);
        } else {
          await supabase
            .from('quiz_fields')
            .insert({
              ...updatedField,
              quiz_id: quizConfig.id,
            });
        }
      }
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: "Error",
        description: "Failed to save field",
        variant: "destructive",
      });
    }
  };

  const removeField = async (index: number) => {
    try {
      const fieldToRemove = fields[index];
      if (fieldToRemove.id) {
        await supabase
          .from('quiz_fields')
          .delete()
          .eq('id', fieldToRemove.id);
      }
      
      const newFields = fields.filter((_, i) => i !== index);
      setFields(newFields);
    } catch (error) {
      console.error('Error removing field:', error);
      toast({
        title: "Error",
        description: "Failed to remove field",
        variant: "destructive",
      });
    }
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