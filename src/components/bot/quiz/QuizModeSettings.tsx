import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { QuizFieldBuilder } from "./QuizFieldBuilder";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Field } from "./QuizFieldBuilder";

interface QuizModeSettingsProps {
  botId: string;
  enabled: boolean;
  onEnableChange: (enabled: boolean, fields?: Field[]) => void;
}

export const QuizModeSettings = ({ 
  botId, 
  enabled: initialEnabled, 
  onEnableChange 
}: QuizModeSettingsProps) => {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    setIsEnabled(initialEnabled);
  }, [initialEnabled]);

  useEffect(() => {
    if (botId) {
      loadQuizFields();
    }
  }, [botId]);

  const loadQuizFields = async () => {
    try {
      const { data: quizConfig } = await supabase
        .from('quiz_configurations')
        .select('*')
        .eq('bot_id', botId)
        .maybeSingle();

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

  const handleEnableChange = async (checked: boolean) => {
    try {
      setIsEnabled(checked);
      onEnableChange(checked, fields);
    } catch (error) {
      console.error('Error updating quiz mode:', error);
      toast({
        title: "Error",
        description: "Failed to update quiz mode settings",
        variant: "destructive",
      });
    }
  };

  const handleFieldsChange = (newFields: Field[]) => {
    setFields(newFields);
    if (isEnabled) {
      onEnableChange(true, newFields);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="quiz-mode"
          checked={isEnabled}
          onCheckedChange={handleEnableChange}
        />
        <Label htmlFor="quiz-mode">Enable Quiz Mode</Label>
      </div>
      
      {isEnabled && (
        <QuizFieldBuilder 
          botId={botId}
          fields={fields}
          onFieldsChange={handleFieldsChange}
        />
      )}
    </div>
  );
};