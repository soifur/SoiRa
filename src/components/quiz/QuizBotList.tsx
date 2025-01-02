import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, BookOpen, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  isLoading?: boolean;
}

export const QuizBotList = ({ 
  quizBots, 
  onEdit, 
  onDelete, 
  onSelect,
  isLoading 
}: QuizBotListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (quizBots.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-semibold">No Quiz Bots</h3>
        <p className="text-sm text-muted-foreground">
          Create your first quiz bot to get started
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {quizBots.map((bot) => (
        <Card key={bot.id} className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{bot.title}</h3>
              {bot.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {bot.description}
                </p>
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
                title="Open Quiz"
              >
                <BookOpen className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(bot)}
                title="Edit Quiz"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    title="Delete Quiz"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Quiz Bot</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{bot.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(bot.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};