import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Field } from "@/components/bot/quiz/QuizFieldBuilder";
import { QuizSection } from "./QuizSection";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  botId: string;
  onComplete: (instructions: string) => void;
}

export const QuizModal = ({ isOpen, onClose, botId, onComplete }: QuizModalProps) => {
  const [sections, setSections] = useState<{ fields: Field[], responses: Record<string, string | string[]> }[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
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
          // Group fields into sections
          const groupedSections = [];
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
      const allFields = sections.flatMap(section => section.fields);
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
        // Get the bot's instructions
        const { data: bot } = await supabase
          .from('bots')
          .select('instructions')
          .eq('id', botId)
          .single();

        if (!bot) {
          console.error('No bot found');
          return;
        }

        const originalInstructions = bot.instructions || '';
        const combinedInstructions = `${originalInstructions} ${userResponses}`.trim();

        // Get quiz configuration
        const { data: quizConfig } = await supabase
          .from('quiz_configurations')
          .select('id')
          .eq('bot_id', botId)
          .single();

        if (quizConfig) {
          const { data: { user } } = await supabase.auth.getUser();
          
          // Save quiz responses
          const responseData = {
            quiz_id: quizConfig.id,
            user_id: user?.id,
            responses,
            combined_instructions: combinedInstructions
          };

          await supabase
            .from('quiz_responses')
            .upsert([responseData]);
        }

        onComplete(combinedInstructions);
        onClose();
      } catch (error) {
        console.error('Error saving quiz responses:', error);
      }
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-6 py-4">
          {sections[currentSection] && (
            <QuizSection
              fields={sections[currentSection].fields}
              responses={responses}
              onResponse={handleResponse}
            />
          )}
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