import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldType } from "./QuizFieldBuilder";
import { Trash2 } from "lucide-react";

interface QuizFieldProps {
  field: Field;
  onChange: (field: Field) => void;
  onRemove: () => void;
}

export const QuizField = ({ field, onChange, onRemove }: QuizFieldProps) => {
  const [choices, setChoices] = useState<string>(field.choices?.join(', ') || '');

  const handleTypeChange = (value: FieldType) => {
    onChange({
      ...field,
      field_type: value,
      choices: value.includes('choice') ? [] : undefined,
    });
  };

  const handleChoicesChange = (value: string) => {
    setChoices(value);
    const choiceArray = value.split(',').map(choice => choice.trim()).filter(Boolean);
    onChange({
      ...field,
      choices: choiceArray,
    });
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-4">
          <div>
            <Label>Field Type</Label>
            <Select value={field.field_type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="single_choice">Single Choice</SelectItem>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Title/Question</Label>
            <Input
              value={field.title}
              onChange={(e) => onChange({ ...field, title: e.target.value })}
              placeholder="Enter question..."
            />
          </div>

          <div>
            <Label>Instructions</Label>
            <Textarea
              value={field.instructions}
              onChange={(e) => onChange({ ...field, instructions: e.target.value })}
              placeholder="Enter instructions with {placeholder} for user input..."
            />
          </div>

          {field.field_type.includes('choice') && (
            <div>
              <Label>Choices (comma-separated)</Label>
              <Input
                value={choices}
                onChange={(e) => handleChoicesChange(e.target.value)}
                placeholder="Option 1, Option 2, Option 3..."
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id={`single-section-${field.id}`}
              checked={field.single_section}
              onCheckedChange={(checked) => onChange({ ...field, single_section: checked })}
            />
            <Label htmlFor={`single-section-${field.id}`}>Single Section</Label>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:text-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};