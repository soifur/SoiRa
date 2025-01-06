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
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (botId) {
      loadQuizConfiguration();
    }
  }, [botId]);

  useEffect(() => {
    setIsEnabled(initialEnabled);
  }, [initialEnabled]);

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
        setIsEnabled(quizConfig.enabled);
        
        // Load fields if quiz configuration exists
        const { data: quizFields } = await supabase
          .from('quiz_fields')
          .select('*')
          .eq('quiz_id', quizConfig.id)
          .order('sequence_number', { ascending: true });

        if (quizFields) {
          setFields(quizFields);
        }
      }
    } catch (error) {
      console.error('Error loading quiz configuration:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableChange = (checked: boolean) => {
    setIsEnabled(checked);
    setHasChanges(true);
  };

  const handleFieldsChange = (newFields: Field[]) => {
    setFields(newFields);
    setHasChanges(true);
  };

  const handleSaveQuizSettings = async () => {
    try {
      setIsSaving(true);
      const quizId = await saveQuizConfiguration(botId, isEnabled);
      
      if (fields.length > 0) {
        await saveQuizFields(quizId, fields);
      }

      onEnableChange(isEnabled, fields);
      setHasChanges(false);
      
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

  if (isLoading) {
    return <div>Loading quiz settings...</div>;
  }

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
        {hasChanges && (
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