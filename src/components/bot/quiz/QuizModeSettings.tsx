import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { QuizFieldBuilder } from "./QuizFieldBuilder";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Field } from "./QuizFieldBuilder";
import { saveQuizConfiguration, saveQuizFields } from "@/utils/quizUtils";

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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsEnabled(initialEnabled);
    if (botId) {
      loadQuizFields();
    }
  }, [botId, initialEnabled]);

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

  const handleEnableChange = (checked: boolean) => {
    setIsEnabled(checked);
  };

  const handleFieldsChange = (newFields: Field[]) => {
    setFields(newFields);
  };

  const handleSaveQuizSettings = async () => {
    try {
      setIsSaving(true);
      const quizId = await saveQuizConfiguration(botId, isEnabled);
      
      if (fields.length > 0) {
        await saveQuizFields(quizId, fields);
      }

      onEnableChange(isEnabled, fields);
      
      toast({
        title: "Success",
        description: "Quiz settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving quiz settings:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="quiz-mode"
            checked={isEnabled}
            onCheckedChange={handleEnableChange}
          />
          <Label htmlFor="quiz-mode">Enable Quiz Mode</Label>
        </div>
        {isEnabled && (
          <Button 
            onClick={handleSaveQuizSettings}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Quiz Settings"}
          </Button>
        )}
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