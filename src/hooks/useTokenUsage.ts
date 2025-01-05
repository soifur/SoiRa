import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LimitType, ResetPeriod } from "@/types/subscriptionSettings";

interface TokenUsageResponse {
  canProceed: boolean;
  limitType: LimitType;
  resetPeriod: ResetPeriod;
  currentUsage: number;
  limit: number;
}

export const useTokenUsage = () => {
  const { toast } = useToast();
  let lastToastTime = 0;
  const TOAST_COOLDOWN = 5000; // 5 seconds between toasts

  const showErrorToast = (title: string, description: string) => {
    const now = Date.now();
    if (now - lastToastTime > TOAST_COOLDOWN) {
      lastToastTime = now;
      toast({
        title,
        description,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const checkTokenUsage = async (botId: string, estimatedTokens: number): Promise<TokenUsageResponse> => {
    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        showErrorToast("Authentication Error", "Failed to verify user session");
        return {
          canProceed: true,
          limitType: 'tokens',
          resetPeriod: 'monthly',
          currentUsage: 0,
          limit: 0
        };
      }

      if (!session?.user?.id) {
        return {
          canProceed: true,
          limitType: 'tokens',
          resetPeriod: 'monthly',
          currentUsage: 0,
          limit: 0
        };
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        showErrorToast("Profile Error", "Failed to fetch user profile");
        return {
          canProceed: true,
          limitType: 'tokens',
          resetPeriod: 'monthly',
          currentUsage: 0,
          limit: 0
        };
      }

      // Get bot model
      const { data: bot, error: botError } = await supabase
        .from('bots')
        .select('model')
        .eq('id', botId)
        .maybeSingle();

      if (botError || !bot?.model) {
        showErrorToast("Bot Error", "Failed to fetch bot information");
        return {
          canProceed: true,
          limitType: 'tokens',
          resetPeriod: 'monthly',
          currentUsage: 0,
          limit: 0
        };
      }

      // Get subscription settings
      const { data: settings, error: settingsError } = await supabase
        .from('model_subscription_settings')
        .select('*')
        .eq('model', bot.model)
        .eq('user_role', profile?.role || 'user')
        .maybeSingle();

      if (settingsError) {
        showErrorToast("Settings Error", "Failed to fetch subscription settings");
        return {
          canProceed: true,
          limitType: 'tokens',
          resetPeriod: 'monthly',
          currentUsage: 0,
          limit: 0
        };
      }

      if (!settings) {
        return {
          canProceed: true,
          limitType: 'tokens',
          resetPeriod: 'monthly',
          currentUsage: 0,
          limit: 0
        };
      }

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

      const { data: usage, error: usageError } = await supabase
        .from('chat_history')
        .select('tokens_used, messages_used')
        .eq('user_id', session.user.id)
        .eq('bot_id', botId)
        .gte('created_at', periodStart.toISOString());

      if (usageError) {
        showErrorToast("Usage Error", "Failed to fetch usage data");
        return {
          canProceed: true,
          limitType: settings.limit_type || 'tokens',
          resetPeriod: settings.reset_period,
          currentUsage: 0,
          limit: settings.units_per_period
        };
      }

      const limitType = (settings.limit_type || 'tokens') as LimitType;
      const currentUsage = usage?.reduce((acc: number, curr) => {
        return acc + (limitType === 'messages' ? (curr.messages_used || 0) : (curr.tokens_used || 0));
      }, 0) || 0;

      const unitsToCheck = limitType === 'messages' ? 1 : estimatedTokens;
      const canProceed = currentUsage + unitsToCheck <= settings.units_per_period;

      if (!canProceed) {
        showErrorToast(
          "Usage Limit Reached",
          `You've reached your ${settings.reset_period} limit of ${settings.units_per_period} ${limitType}`
        );
      }

      return {
        canProceed,
        limitType,
        resetPeriod: settings.reset_period,
        currentUsage,
        limit: settings.units_per_period
      };

    } catch (error) {
      console.error("Token usage check failed:", error);
      return {
        canProceed: true,
        limitType: 'tokens',
        resetPeriod: 'monthly',
        currentUsage: 0,
        limit: 0
      };
    }
  };

  return { checkTokenUsage };
};