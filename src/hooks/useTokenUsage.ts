import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useTokenUsage = () => {
  const { toast } = useToast();

  const checkTokenUsage = async (model: string, estimatedTokens: number) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return true; // Allow usage for non-authenticated users
      }

      const { data, error } = await supabase
        .rpc('check_token_usage', {
          p_user_id: userData.user.id,
          p_model: model,
          p_tokens: estimatedTokens
        });

      if (error) throw error;

      if (!data) {
        toast({
          title: "Usage Limit Reached",
          description: "You've reached your usage limit for this model. Please try again later or upgrade your subscription.",
          variant: "destructive",
        });
      }

      return data;
    } catch (error) {
      console.error('Error checking token usage:', error);
      return false; // Prevent usage on error to enforce limits
    }
  };

  return { checkTokenUsage };
};