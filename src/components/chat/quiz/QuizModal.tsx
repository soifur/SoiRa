import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Field } from "@/components/bot/quiz/QuizFieldBuilder";
import { QuizSection } from "./QuizSection";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  botId: string;
  onComplete?: (instructions: string) => void;
}

export const QuizModal = ({ isOpen, onClose, botId, onComplete }: QuizModalProps) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [sections, setSections] = useState<Field[]>([]);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && botId) {
      loadQuizFields();
    }
  }, [isOpen, botId]);

  const loadQuizFields = async () => {
    try {
      // First get the quiz configuration
      const { data: quizConfig } = await supabase
        .from('quiz_configurations')
        .select('*')
        .eq('bot_id', botId)
        .single();

      if (!quizConfig) {
        console.error('No quiz configuration found');
        return;
      }

      // Then get the fields
      const { data: fields } = await supabase
        .from('quiz_fields')
        .select('*')
        .eq('quiz_id', quizConfig.id)
        .order('sequence_number', { ascending: true });

      if (fields) {
        setSections(fields);
      }
    } catch (error) {
      console.error('Error loading quiz fields:', error);
    }
  };

  const handleResponse = async (response: string | string[]) => {
    try {
      const currentField = sections[currentSection];
      if (!currentField) return;

      // Update responses
      const updatedResponses = {
        ...responses,
        [currentField.id]: response
      };
      setResponses(updatedResponses);

      // If this is the last section, save all responses
      if (currentSection === sections.length - 1) {
        await saveResponses(updatedResponses);
      } else {
        // Move to next section
        setCurrentSection(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error handling response:', error);
      toast({
        title: "Error",
        description: "Failed to save response",
        variant: "destructive",
      });
    }
  };

  const saveResponses = async (finalResponses: Record<string, string | string[]>) => {
    try {
      // Get the quiz configuration for this bot
      const { data: quizConfig } = await supabase
        .from('quiz_configurations')
        .select('*')
        .eq('bot_id', botId)
        .single();

      if (!quizConfig) {
        throw new Error('No quiz configuration found');
      }

      // Combine all responses into instructions
      const combinedInstructions = sections
        .map(field => {
          const response = finalResponses[field.id];
          if (Array.isArray(response)) {
            return `${field.title}: ${response.join(', ')}`;
          }
          return `${field.title}: ${response || ''}`;
        })
        .join('\n');

      // Save to quiz_responses with bot_id
      const { data: quizResponse, error } = await supabase
        .from('quiz_responses')
        .insert({
          quiz_id: quizConfig.id,
          bot_id: botId, // Make sure we're setting the bot_id
          responses: finalResponses,
          combined_instructions: combinedInstructions
        })
        .select()
        .single();

      if (error) throw error;

      // Call onComplete with the combined instructions
      if (onComplete) {
        onComplete(combinedInstructions);
      }

      // Close the modal
      onClose();

      toast({
        title: "Success",
        description: "Quiz completed successfully",
      });
    } catch (error) {
      console.error('Error saving responses:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz responses",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none border-none bg-gradient-to-br from-violet-50 to-pink-50 dark:from-gray-900 dark:to-gray-800" style={{ zIndex: 9999 }}>
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
              field={sections[currentSection]}
              onResponse={handleResponse}
              isLast={currentSection === sections.length - 1}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};