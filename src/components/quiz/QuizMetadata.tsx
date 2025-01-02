import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface QuizMetadataProps {
  title: string;
  description: string;
  passingScore: number;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onPassingScoreChange: (score: number) => void;
}

export const QuizMetadata = ({
  title,
  description,
  passingScore,
  onTitleChange,
  onDescriptionChange,
  onPassingScoreChange,
}: QuizMetadataProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Quiz title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Quiz description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
        <Input
          type="number"
          min="0"
          max="100"
          value={passingScore}
          onChange={(e) => onPassingScoreChange(Number(e.target.value))}
          required
        />
      </div>
    </div>
  );
};