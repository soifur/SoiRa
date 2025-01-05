import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TokenUsageResponse {
  canProceed: boolean;
  limitType: 'tokens' | 'messages';
  resetPeriod: 'daily' | 'weekly' | 'monthly' | 'never';
  currentUsage: number;
  limit: number;
}

export const useTokenUsage = () => {
  const { toast } = useToast();

  const checkTokenUsage = async (model: string, estimatedTokens: number): Promise<TokenUsageResponse> => {
    console.log("🔍 Starting token usage check in useTokenUsage hook");
    console.log("Model:", model);
    console.log("Estimated tokens:", estimatedTokens);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("❌ Auth error:", userError);
        throw userError;
      }
      console.log("👤 User found:", user?.id);

      // Get user's role from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error("❌ Profile fetch error:", profileError);
        throw profileError;
      }
      console.log("👑 User role:", profile?.role);

      // Get subscription settings
      const { data: settings, error: settingsError } = await supabase
        .from('model_subscription_settings')
        .select('*')
        .eq('model', model)
        .eq('user_role', profile.role)
        .single();

      if (settingsError) {
        console.error("❌ Settings fetch error:", settingsError);
        throw settingsError;
      }
      console.log("⚙️ Subscription settings found:", settings);

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
      console.log("📅 Period start date:", periodStart.toISOString());

      // Get current usage
      const { data: usage, error: usageError } = await supabase
        .from('chat_history')
        .select(settings.limit_type === 'messages' ? 'messages_used' : 'tokens_used')
        .eq('user_id', user?.id)
        .eq('bot_id', model)
        .gte('created_at', periodStart.toISOString());

      if (usageError) {
        console.error("❌ Usage fetch error:", usageError);
        throw usageError;
      }

      const currentUsage = usage?.reduce((acc, curr) => {
        if (settings.limit_type === 'messages') {
          return acc + (curr.messages_used || 0);
        }
        return acc + (curr.tokens_used || 0);
      }, 0) || 0;

      console.log("📊 Current usage:", currentUsage);
      console.log("📊 Period limit:", settings.units_per_period);

      const unitsToCheck = settings.limit_type === 'messages' ? 1 : estimatedTokens;
      const canProceed = currentUsage + unitsToCheck <= settings.units_per_period;

      console.log("🎯 Units to check:", unitsToCheck);
      console.log("✅ Can proceed:", canProceed);

      return {
        canProceed,
        limitType: settings.limit_type as 'tokens' | 'messages',
        resetPeriod: settings.reset_period,
        currentUsage,
        limit: settings.units_per_period
      };

    } catch (error) {
      console.error("❌ Token usage check failed:", error);
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