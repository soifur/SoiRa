import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuizBot {
  id?: string;
  title: string;
  description?: string;
  passing_score: number;
  instructions?: string;
}

interface QuizBotFormProps {
  onSave: (bot: QuizBot) => void;
  onCancel: () => void;
  initialData?: QuizBot;
}

export const QuizBotForm = ({ onSave, onCancel, initialData }: QuizBotFormProps) => {
  const [quizBot, setQuizBot] = useState<QuizBot>(
    initialData || {
      title: "",
      description: "",
      passing_score: 75,
      instructions: "",
    }
  );
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onSave(quizBot);
    } catch (error) {
      console.error("Error saving quiz bot:", error);
      toast({
        title: "Error",
        description: "Failed to save quiz bot",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          value={quizBot.title}
          onChange={(e) => setQuizBot({ ...quizBot, title: e.target.value })}
          placeholder="Enter quiz title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={quizBot.description}
          onChange={(e) => setQuizBot({ ...quizBot, description: e.target.value })}
          placeholder="Enter quiz description"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
        <Input
          type="number"
          min={0}
          max={100}
          value={quizBot.passing_score}
          onChange={(e) => setQuizBot({ ...quizBot, passing_score: parseInt(e.target.value) })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Instructions</label>
        <Textarea
          value={quizBot.instructions}
          onChange={(e) => setQuizBot({ ...quizBot, instructions: e.target.value })}
          placeholder="Enter quiz instructions"
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};