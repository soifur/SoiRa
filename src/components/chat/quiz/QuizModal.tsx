import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Field } from "@/components/bot/quiz/QuizFieldBuilder";
import { QuizSection } from "./QuizSection";
import { QuizNavigation } from "./QuizNavigation";
import { cn } from "@/lib/utils";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  botId: string;
  onComplete: (instructions: string) => void;
}

interface QuizSectionData {
  fields: Field[];
  responses: Record<string, string | string[]>;
}

export const QuizModal = ({ isOpen, onClose, botId, onComplete }: QuizModalProps) => {
  const [sections, setSections] = useState<QuizSectionData[]>([]);
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
          
          const groupedSections: QuizSectionData[] = [];
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

  const handlePrevious = () => {
    setCurrentSection(prev => prev - 1);
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
        className="fixed inset-0 w-full h-screen max-w-none max-h-none m-0 p-0 bg-gradient-to-br from-background to-background/95 backdrop-blur-sm z-[200]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 z-50"
        >
          <X className="h-6 w-6" />
        </Button>
        
        <div className="w-full h-full overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-6 md:p-8">
            <div className="w-full max-w-2xl">
              <div className="flex-1">
                <div 
                  className={cn(
                    "transition-all duration-1000 transform",
                    showTransition ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"
                  )}
                >
                  {sections[currentSection] && (
                    <QuizSection
                      fields={sections[currentSection].fields}
                      responses={responses}
                      onResponse={handleResponse}
                    />
                  )}
                </div>
              </div>
              <div className="pt-6 mt-8">
                <QuizNavigation
                  currentSection={currentSection}
                  totalSections={sections.length}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};