import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useTokenUsage = () => {
  const { toast } = useToast();

  const checkTokenUsage = async (model: string, estimatedTokens: number) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.log("No authenticated user, skipping token check");
        return false; // Don't allow usage for non-authenticated users
      }

      console.log("Checking token usage for user:", userData.user.id);
      console.log("Model:", model);
      console.log("Estimated tokens:", estimatedTokens);

      const { data, error } = await supabase
        .rpc('check_token_usage', {
          p_user_id: userData.user.id,
          p_model: model,
          p_tokens: estimatedTokens
        });

      if (error) {
        console.error("Error from check_token_usage:", error);
        throw error;
      }

      console.log("Token usage check result:", data);

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
      toast({
        title: "Error",
        description: "Failed to check usage limits. Access denied for safety.",
        variant: "destructive",
      });
      return false; // Prevent usage on error to enforce limits
    }
  };

  return { checkTokenUsage };
};