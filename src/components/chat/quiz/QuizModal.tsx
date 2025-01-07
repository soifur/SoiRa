import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Field } from "@/components/bot/quiz/QuizFieldBuilder";
import { QuizField } from "./QuizField";
import { cn } from "@/lib/utils";

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
  const [showTransition, setShowTransition] = useState(false);

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
    setShowTransition(true);
    setTimeout(() => {
      if (currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1);
      } else {
        handleComplete();
      }
      setShowTransition(false);
    }, 1000);
  };

  const handleComplete = async () => {
    const allFields = fields;
    let userResponses = '';

    allFields.forEach(field => {
      const response = responses[field.id!];
      if (response) {
        const instruction = field.instructions?.replace('{input}', 
          Array.isArray(response) ? response.join(', ') : response
        );
        if (instruction) {
          userResponses += instruction + ' ';
        }
      }
    });

    try {
      const { data: sharedBot } = await supabase
        .from('shared_bots')
        .select('instructions')
        .eq('bot_id', botId)
        .maybeSingle();

      const originalInstructions = sharedBot?.instructions || '';
      const combinedInstructions = `${originalInstructions} ${userResponses}`.trim();

      const { data: quizConfig } = await supabase
        .from('quiz_configurations')
        .select('id')
        .eq('bot_id', botId)
        .single();

      if (quizConfig) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const responseData = {
            quiz_id: quizConfig.id,
            user_id: user.id,
            responses,
            combined_instructions: combinedInstructions
          };

          const { data: existingResponse } = await supabase
            .from('quiz_responses')
            .select('*')
            .eq('quiz_id', quizConfig.id)
            .eq('user_id', user.id)
            .single();

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
      }

      onComplete(combinedInstructions);
      onClose();
    } catch (error) {
      console.error('Error saving quiz responses:', error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-screen h-screen max-w-none m-0 p-0 rounded-none bg-background"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="h-full flex flex-col p-6 md:p-8 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div 
              className={cn(
                "transition-all duration-1000 transform",
                showTransition ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"
              )}
            >
              {sections[currentSection]?.fields.map((field) => (
                <QuizField
                  key={field.id}
                  field={field}
                  response={responses[field.id!]}
                  onResponse={handleResponse}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-6 border-t">
            {currentSection > 0 && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentSection(prev => prev - 1)}
                className="text-lg px-8"
              >
                Previous
              </Button>
            )}
            <Button 
              onClick={handleNext}
              size="lg"
              className="text-lg px-8"
            >
              {currentSection < sections.length - 1 ? 'Next' : "Let's Start"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};