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

interface UsageData {
  tokens_used: number | null;
  messages_used: number | null;
}

export const useTokenUsage = () => {
  const { toast } = useToast();

  const checkTokenUsage = async (botId: string, estimatedTokens: number): Promise<TokenUsageResponse> => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user?.id) {
        return {
          canProceed: true,
          limitType: 'tokens',
          resetPeriod: 'monthly',
          currentUsage: 0,
          limit: 0
        };
      }

      // Get user's role and bot's model
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const { data: bot } = await supabase
        .from('bots')
        .select('model')
        .eq('id', botId)
        .maybeSingle();

      if (!bot?.model) {
        return {
          canProceed: true,
          limitType: 'tokens',
          resetPeriod: 'monthly',
          currentUsage: 0,
          limit: 0
        };
      }

      // Get subscription settings using bot's model type
      const { data: settings } = await supabase
        .from('model_subscription_settings')
        .select('*')
        .eq('model', bot.model)
        .eq('user_role', profile?.role || 'user')
        .maybeSingle();

      if (!settings) {
        return {
          canProceed: true,
          limitType: 'tokens',
          resetPeriod: 'monthly',
          currentUsage: 0,
          limit: 0
        };
      }

      // Calculate period start
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

      // Get current usage
      const { data: usage } = await supabase
        .from('chat_history')
        .select('tokens_used, messages_used')
        .eq('user_id', user.id)
        .eq('bot_id', botId)
        .gte('created_at', periodStart.toISOString());

      // Calculate current usage
      const limitType = (settings.limit_type || 'tokens') as LimitType;
      const currentUsage = usage?.reduce((acc: number, curr: UsageData) => {
        if (limitType === 'messages') {
          return acc + (curr.messages_used || 0);
        }
        return acc + (curr.tokens_used || 0);
      }, 0) || 0;

      // Calculate units to check based on limit type
      const unitsToCheck = limitType === 'messages' ? 1 : estimatedTokens;
      
      // Check if adding the new units would exceed the limit
      const canProceed = currentUsage + unitsToCheck <= settings.units_per_period;

      if (!canProceed) {
        toast({
          title: "Usage Limit Reached",
          description: `You've reached your ${settings.reset_period} limit of ${settings.units_per_period} ${limitType}`,
          variant: "destructive",
        });
      }

      return {
        canProceed,
        limitType,
        resetPeriod: settings.reset_period as ResetPeriod,
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