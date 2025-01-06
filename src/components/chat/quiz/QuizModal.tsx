import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Field } from "@/components/bot/quiz/QuizFieldBuilder";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  botId: string;
  onComplete: (instructions: string) => void;
}

interface QuizSection {
  fields: Field[];
  responses: Record<string, string | string[]>;
}

export const QuizModal = ({ isOpen, onClose, botId, onComplete }: QuizModalProps) => {
  const [sections, setSections] = useState<QuizSection[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && botId) {
      loadQuizConfiguration();
    }
  }, [isOpen, botId]);

  const loadQuizConfiguration = async () => {
    try {
      const { data: quizConfig } = await supabase
        .from('quiz_configurations')
        .select('*')
        .eq('bot_id', botId)
        .eq('enabled', true)
        .single();

      if (quizConfig) {
        const { data: quizFields } = await supabase
          .from('quiz_fields')
          .select('*')
          .eq('quiz_id', quizConfig.id)
          .order('sequence_number', { ascending: true });

        if (quizFields) {
          setFields(quizFields);
          
          // Group fields into sections
          const groupedSections: QuizSection[] = [];
          let currentSectionFields: Field[] = [];

          quizFields.forEach((field) => {
            if (field.single_section && currentSectionFields.length > 0) {
              groupedSections.push({ fields: currentSectionFields, responses: {} });
              currentSectionFields = [];
            }
            currentSectionFields.push(field);
            if (field.single_section) {
              groupedSections.push({ fields: [field], responses: {} });
              currentSectionFields = [];
            }
          });

          if (currentSectionFields.length > 0) {
            groupedSections.push({ fields: currentSectionFields, responses: {} });
          }

          setSections(groupedSections);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading quiz configuration:', error);
      setLoading(false);
    }
  };

  const handleResponse = (fieldId: string, value: string | string[]) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleNext = async () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      // Process all responses and generate instructions
      const allFields = fields;
      let userInstructions = '';

      allFields.forEach(field => {
        const response = responses[field.id!];
        if (response) {
          const instruction = field.instructions?.replace('{input}', 
            Array.isArray(response) ? response.join(', ') : response
          );
          if (instruction) {
            userInstructions += instruction + ' ';
          }
        }
      });

      try {
        // Save quiz responses
        const { data: quizConfig } = await supabase
          .from('quiz_configurations')
          .select('id')
          .eq('bot_id', botId)
          .single();

        if (quizConfig) {
          const { data: existingResponse } = await supabase
            .from('quiz_responses')
            .select('*')
            .eq('quiz_id', quizConfig.id)
            .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
            .single();

          const responseData = {
            quiz_id: quizConfig.id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            responses,
            combined_instructions: userInstructions.trim()
          };

          if (existingResponse) {
            await supabase
              .from('quiz_responses')
              .update(responseData)
              .eq('id', existingResponse.id);
          } else {
            await supabase
              .from('quiz_responses')
              .insert([responseData]);
          }
        }

        onComplete(userInstructions.trim());
        onClose();
      } catch (error) {
        console.error('Error saving quiz responses:', error);
      }
    }
  };

  const renderField = (field: Field) => {
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <input
            type={field.field_type}
            value={responses[field.id!] as string || ''}
            onChange={(e) => handleResponse(field.id!, e.target.value)}
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
                  onChange={(e) => handleResponse(field.id!, e.target.value)}
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
                    handleResponse(field.id!, newValues);
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

  if (loading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-6 py-4">
          {sections[currentSection]?.fields.map((field) => (
            <div key={field.id} className="space-y-4">
              <h3 className="text-lg font-medium">{field.title}</h3>
              {renderField(field)}
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            {currentSection > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentSection(prev => prev - 1)}
              >
                Previous
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentSection < sections.length - 1 ? 'Next' : "Let's Start"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};