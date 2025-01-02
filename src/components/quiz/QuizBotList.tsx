import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, BookOpen } from "lucide-react";

interface QuizBot {
  id: string;
  title: string;
  description?: string;
  passing_score: number;
}

interface QuizBotListProps {
  quizBots: QuizBot[];
  onEdit: (bot: QuizBot) => void;
  onDelete: (id: string) => void;
  onSelect: (bot: QuizBot) => void;
}

export const QuizBotList = ({ quizBots, onEdit, onDelete, onSelect }: QuizBotListProps) => {
  return (
    <div className="grid gap-4">
      {quizBots.map((bot) => (
        <Card key={bot.id} className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{bot.title}</h3>
              {bot.description && (
                <p className="text-sm text-muted-foreground mt-1">{bot.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Passing Score: {bot.passing_score}%
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelect(bot)}
              >
                <BookOpen className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(bot)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(bot.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};