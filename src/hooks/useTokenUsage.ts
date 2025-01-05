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

      // First, get the user's role from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profileError || !profile) {
        console.log("No profile found for user");
        throw new Error("User profile not found");
      }

      console.log("User role:", profile.role);

      // Get subscription settings for the model and user role
      const { data: settings, error: settingsError } = await supabase
        .from('model_subscription_settings')
        .select('*')
        .eq('model', model)
        .eq('user_role', profile.role)
        .single();

      if (settingsError || !settings) {
        console.log("No subscription settings found for model and role");
        throw new Error("Subscription settings not found");
      }

      console.log("Subscription settings:", settings);

      // Calculate period start based on reset period
      const now = new Date();
      let periodStart = new Date();
      switch (settings.reset_period) {
        case 'daily':
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          const day = now.getDay();
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
          break;
        case 'monthly':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          periodStart = new Date(1970, 0, 1);
      }

      console.log("Period start:", periodStart.toISOString());

      // Get current usage for the period
      const { data: usage, error: usageError } = await supabase
        .from('chat_history')
        .select(settings.limit_type === 'messages' ? 'messages_used' : 'tokens_used')
        .eq('user_id', userData.user.id)
        .eq('bot_id', model)
        .gte('created_at', periodStart.toISOString());

      if (usageError) {
        console.error("Error fetching usage:", usageError);
        throw new Error("Failed to fetch usage data");
      }

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