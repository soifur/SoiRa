import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { QuizFieldBuilder } from "./QuizFieldBuilder";
import { Field } from "./QuizFieldBuilder";

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