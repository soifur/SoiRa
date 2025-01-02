import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuizBot {
  id: string;
  title: string;
  description?: string;
  passing_score: number;
  instructions?: string;
}

export const useQuizBots = () => {
  const [quizBots, setQuizBots] = useState<QuizBot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchQuizBots = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_bots")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuizBots(data || []);
    } catch (error) {
      console.error("Error fetching quiz bots:", error);
      toast({
        title: "Error",
        description: "Failed to fetch quiz bots",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuizBot = async (bot: Omit<QuizBot, "id">) => {
    try {
      const { data, error } = await supabase
        .from("quiz_bots")
        .insert([bot])
        .select()
        .single();

      if (error) throw error;
      setQuizBots([data, ...quizBots]);
      toast({
        title: "Success",
        description: "Quiz bot created successfully",
      });
      return data;
    } catch (error) {
      console.error("Error saving quiz bot:", error);
      toast({
        title: "Error",
        description: "Failed to save quiz bot",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateQuizBot = async (id: string, updates: Partial<QuizBot>) => {
    try {
      const { data, error } = await supabase
        .from("quiz_bots")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setQuizBots(quizBots.map((bot) => (bot.id === id ? data : bot)));
      toast({
        title: "Success",
        description: "Quiz bot updated successfully",
      });
      return data;
    } catch (error) {
      console.error("Error updating quiz bot:", error);
      toast({
        title: "Error",
        description: "Failed to update quiz bot",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteQuizBot = async (id: string) => {
    try {
      const { error } = await supabase.from("quiz_bots").delete().eq("id", id);
      if (error) throw error;
      setQuizBots(quizBots.filter((bot) => bot.id !== id));
      toast({
        title: "Success",
        description: "Quiz bot deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting quiz bot:", error);
      toast({
        title: "Error",
        description: "Failed to delete quiz bot",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchQuizBots();
  }, []);

  return {
    quizBots,
    isLoading,
    saveQuizBot,
    updateQuizBot,
    deleteQuizBot,
  };
};