import React, { useState, useEffect, KeyboardEvent } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Field } from "@/components/bot/quiz/QuizFieldBuilder";
import { QuizSection } from "./QuizSection";
import { X } from "lucide-react";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  botId: string;
  onComplete: (instructions: string) => void;
}

export const QuizModal = ({ isOpen, onClose, botId, onComplete }: QuizModalProps) => {
  const [sections, setSections] = useState<{ fields: Field[]; responses: Record<string, string | string[]>; }[]>([]);
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
      // First check if the bot exists and is published or owned by the user
      const { data: bot, error: botError } = await supabase
        .from('bots')
        .select('published, quiz_mode')
        .eq('id', botId)
        .single();

      if (botError || !bot) {
        console.error('Error loading bot:', botError);
        setLoading(false);
        return;
      }

      // Only proceed if the bot is published and has quiz mode enabled
      if (!bot.published || !bot.quiz_mode) {
        console.log('Bot is not published or quiz mode is not enabled');
        setLoading(false);
        return;
      }

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
          
          const groupedSections: { fields: Field[]; responses: Record<string, string | string[]>; }[] = [];
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
            const { data: existingResponse } = await supabase
              .from('quiz_responses')
              .select('*')
              .eq('quiz_id', quizConfig.id)
              .eq('user_id', user.id)
              .single();

            const responseData = {
              quiz_id: quizConfig.id,
              user_id: user.id,
              responses,
              combined_instructions: combinedInstructions
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
        }

        onComplete(combinedInstructions);
        onClose();
      } catch (error) {
        console.error('Error saving quiz responses:', error);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none border-none bg-gradient-to-br from-violet-50 to-pink-50 dark:from-gray-900 dark:to-gray-800" 
        style={{ zIndex: 9999 }}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const currentFields = sections[currentSection]?.fields || [];
            const isComplete = currentFields.every(field => {
              const response = responses[field.id!];
              return response && (typeof response === 'string' ? response.trim() !== '' : response.length > 0);
            });
            if (isComplete) {
              handleNext();
            }
          }
        }}
      >
        <style>{`
          .dialog-overlay { display: none !important; }
          .dialog-close { display: none !important; }
        `}</style>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
          style={{ zIndex: 9999 }}
        >
          <X className="h-6 w-6" />
        </button>
        <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto">
          {sections[currentSection] && (
            <QuizSection
              fields={sections[currentSection].fields}
              responses={responses}
              onResponse={handleResponse}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isLastSection={currentSection === sections.length - 1}
              isFirstSection={currentSection === 0}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};