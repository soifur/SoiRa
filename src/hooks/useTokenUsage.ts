import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TokenUsageResponse {
  canProceed: boolean;
  limitType: 'tokens' | 'messages';
  resetPeriod: 'daily' | 'weekly' | 'monthly' | 'never';
  currentUsage: number;
  limit: number;
}

interface MessagesUsage {
  messages_used: number;
}

interface TokensUsage {
  tokens_used: number;
}

export const useTokenUsage = () => {
  const { toast } = useToast();

  const getPeriodStart = (resetPeriod: string): string => {
    const now = new Date();
    switch (resetPeriod) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      case 'weekly':
        const day = now.getDay();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day).toISOString();
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      default:
        return new Date(1970, 0, 1).toISOString();
    }
  };

  const checkTokenUsage = async (model: string, estimatedTokens: number): Promise<TokenUsageResponse> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.log("No authenticated user found");
        throw new Error("Authentication required");
      }

      console.log("Checking token usage for user:", userData.user.id);
      console.log("Model:", model);
      console.log("Estimated tokens:", estimatedTokens);

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (!profile) {
        console.log("No profile found for user");
        throw new Error("User profile not found");
      }

      console.log("User role:", profile.role);

      const { data: settings } = await supabase
        .from('model_subscription_settings')
        .select('*')
        .eq('model', model)
        .eq('user_role', profile.role)
        .single();

      if (!settings) {
        console.log("No subscription settings found for model and role");
        throw new Error("Subscription settings not found");
      }

      console.log("Subscription settings:", settings);

      const periodStart = getPeriodStart(settings.reset_period);
      console.log("Period start:", periodStart);

      const { data: usage } = await supabase
        .from('chat_history')
        .select(settings.limit_type === 'messages' ? 'messages_used' : 'tokens_used')
        .eq('user_id', userData.user.id)
        .eq('bot_id', model) // Add this line to filter by specific model/bot
        .gte('created_at', periodStart);

      console.log("Raw usage data:", usage);

      const currentUsage = usage?.reduce((acc, curr) => {
        if (settings.limit_type === 'messages') {
          const messagesUsed = (curr as MessagesUsage).messages_used || 0;
          console.log("Adding messages:", messagesUsed);
          return acc + messagesUsed;
        } else {
          const tokensUsed = (curr as TokensUsage).tokens_used || 0;
          console.log("Adding tokens:", tokensUsed);
          return acc + tokensUsed;
        }
      }, 0) || 0;

      console.log("Current usage:", currentUsage);
      console.log("Limit:", settings.units_per_period);

      const unitsToCheck = settings.limit_type === 'messages' ? 1 : estimatedTokens;
      const canProceed = currentUsage + unitsToCheck <= settings.units_per_period;

      console.log("Units to check:", unitsToCheck);
      console.log("Can proceed:", canProceed);

      return {
        canProceed,
        limitType: settings.limit_type as 'tokens' | 'messages',
        resetPeriod: settings.reset_period,
        currentUsage,
        limit: settings.units_per_period
      };

    } catch (error) {
      console.error('Error checking token usage:', error);
      toast({
        title: "Error",
        description: "Failed to check usage limits. Access denied for safety.",
        variant: "destructive",
      });
      return {
        canProceed: false,
        limitType: 'tokens',
        resetPeriod: 'monthly',
        currentUsage: 0,
        limit: 0
      };
    }
  };

  return { checkTokenUsage };
};