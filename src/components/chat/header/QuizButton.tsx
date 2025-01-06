import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface QuizButtonProps {
  botId: string;
  onStartQuiz: () => void;
}

export const QuizButton = ({ botId, onStartQuiz }: QuizButtonProps) => {
  const { data: quizConfig } = useQuery({
    queryKey: ['quiz-config', botId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_configurations')
        .select('*')
        .eq('bot_id', botId)
        .eq('enabled', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!botId,
  });

  if (!quizConfig?.enabled) return null;

  return (
    <Button
      variant="default"
      size="sm"
      onClick={onStartQuiz}
      className="ml-2"
    >
      Start Now
    </Button>
  );
};