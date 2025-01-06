import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { QuizFieldBuilder } from "./QuizFieldBuilder";
import { Field } from "./QuizFieldBuilder";
import { supabase } from "@/integrations/supabase/client";

interface QuizModeSettingsProps {
  botId: string;
  enabled: boolean;
  fields: Field[];
  onEnableChange: (enabled: boolean) => void;
  onFieldsChange: (fields: Field[]) => void;
}

export const QuizModeSettings = ({ 
  botId, 
  enabled,
  fields,
  onEnableChange,
  onFieldsChange
}: QuizModeSettingsProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (botId) {
      loadQuizConfiguration();
    }
  }, [botId]);

  const loadQuizConfiguration = async () => {
    try {
      setIsLoading(true);
      const { data: quizConfig } = await supabase
        .from('quiz_configurations')
        .select('*')
        .eq('bot_id', botId)
        .limit(1)
        .maybeSingle();

      if (quizConfig) {
        onEnableChange(quizConfig.enabled);
        
        // Load fields if quiz configuration exists
        const { data: quizFields } = await supabase
          .from('quiz_fields')
          .select('*')
          .eq('quiz_id', quizConfig.id)
          .order('sequence_number', { ascending: true });

        if (quizFields) {
          onFieldsChange(quizFields);
        }
      }
    } catch (error) {
      console.error('Error loading quiz configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading quiz settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="quiz-mode"
          checked={enabled}
          onCheckedChange={onEnableChange}
        />
        <Label htmlFor="quiz-mode">Enable Quiz Mode</Label>
      </div>
      
      {enabled && (
        <QuizFieldBuilder 
          botId={botId}
          fields={fields}
          onFieldsChange={onFieldsChange}
        />
      )}
    </div>
  );
};