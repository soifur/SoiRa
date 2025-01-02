import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QuizConfiguration } from "@/types/quiz";

export const useQuizConfigurations = (botId: string) => {
  const [configurations, setConfigurations] = useState<QuizConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfigurations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('quiz_configurations')
        .select('*')
        .eq('bot_id', botId);

      if (error) throw error;

      setConfigurations(data.map(config => ({
        id: config.id,
        botId: config.bot_id,
        title: config.title,
        description: config.description,
        passingScore: config.passing_score,
        questions: config.questions,
        branchingLogic: config.branching_logic,
        createdAt: config.created_at,
        updatedAt: config.updated_at,
      })));
    } catch (error) {
      console.error('Error fetching quiz configurations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quiz configurations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async (config: Omit<QuizConfiguration, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('quiz_configurations')
        .insert([{
          bot_id: config.botId,
          title: config.title,
          description: config.description,
          passing_score: config.passingScore,
          questions: config.questions,
          branching_logic: config.branchingLogic,
        }])
        .select()
        .single();

      if (error) throw error;

      const newConfig: QuizConfiguration = {
        id: data.id,
        botId: data.bot_id,
        title: data.title,
        description: data.description,
        passingScore: data.passing_score,
        questions: data.questions,
        branchingLogic: data.branching_logic,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setConfigurations([...configurations, newConfig]);
      toast({
        title: "Success",
        description: "Quiz configuration saved successfully",
      });

      return newConfig;
    } catch (error) {
      console.error('Error saving quiz configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz configuration",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteConfiguration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quiz_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConfigurations(configurations.filter(config => config.id !== id));
      toast({
        title: "Success",
        description: "Quiz configuration deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting quiz configuration:', error);
      toast({
        title: "Error",
        description: "Failed to delete quiz configuration",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (botId) {
      fetchConfigurations();
    }
  }, [botId]);

  return {
    configurations,
    isLoading,
    saveConfiguration,
    deleteConfiguration,
    refreshConfigurations: fetchConfigurations,
  };
};