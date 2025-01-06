import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { QuizFieldBuilder } from "./QuizFieldBuilder";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuizModeSettingsProps {
  botId: string;
  enabled: boolean;
  onEnableChange: (enabled: boolean) => void;
}

export const QuizModeSettings = ({ botId, enabled: initialEnabled, onEnableChange }: QuizModeSettingsProps) => {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(initialEnabled);

  useEffect(() => {
    setIsEnabled(initialEnabled);
  }, [initialEnabled]);

  const handleEnableChange = async (checked: boolean) => {
    try {
      if (checked) {
        // Create quiz configuration when enabling
        const { error } = await supabase
          .from('quiz_configurations')
          .upsert({ bot_id: botId, enabled: true });

        if (error) throw error;
      }
      setIsEnabled(checked);
      onEnableChange(checked);
    } catch (error) {
      console.error('Error updating quiz mode:', error);
      toast({
        title: "Error",
        description: "Failed to update quiz mode settings",
        variant: "destructive",
      });
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
        <QuizFieldBuilder botId={botId} />
      )}
    </div>
  );
};