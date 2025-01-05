import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addDays, isAfter, parseISO } from 'date-fns';

interface SubscriptionLimit {
  isExceeded: boolean;
  resetDate: Date | null;
  currentUsage: number;
  maxUsage: number;
  limitType: 'messages' | 'tokens';
}

export const useSubscriptionLimits = (botId: string | null) => {
  const [limits, setLimits] = useState<SubscriptionLimit>({
    isExceeded: false,
    resetDate: null,
    currentUsage: 0,
    maxUsage: 0,
    limitType: 'messages'
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!botId) return;
    checkSubscriptionLimits();
  }, [botId]);

  const checkSubscriptionLimits = async () => {
    try {
      console.log("Checking subscription limits for bot:", botId);
      
      // Get current user's profile to check role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user found");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile) {
        console.log("No profile found for user");
        return;
      }

      console.log("User role:", profile.role);

      // Get subscription settings for this bot and user role
      const { data: settings, error: settingsError } = await supabase
        .from('model_subscription_settings')
        .select('*')
        .eq('bot_id', botId)
        .eq('user_role', profile.role)
        .single();

      if (settingsError) {
        console.error("Error fetching subscription settings:", settingsError);
        return;
      }

      if (!settings) {
        console.log('No subscription settings found for this bot and user role');
        return;
      }

      console.log("Subscription settings:", settings);

      // Calculate the start date based on reset_amount and reset_period
      const resetAmount = settings.reset_amount || 1;
      let startDate = new Date();
      
      switch (settings.reset_period) {
        case 'hourly':
          startDate.setHours(startDate.getHours() - resetAmount);
          break;
        case 'daily':
          startDate = addDays(startDate, -resetAmount);
          break;
        case 'weekly':
          startDate = addDays(startDate, -7 * resetAmount);
          break;
        case 'monthly':
          startDate = addDays(startDate, -30 * resetAmount);
          break;
        case 'never':
          startDate = new Date(0); // Beginning of time
          break;
      }

      console.log("Calculating usage since:", startDate.toISOString());

      // Get usage within the period
      const { data: usage, error: usageError } = await supabase
        .from('chat_history')
        .select('messages, messages_used, tokens_used, created_at')
        .eq('bot_id', botId)
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (usageError) {
        console.error("Error fetching usage:", usageError);
        throw usageError;
      }

      console.log("Usage data:", usage);

      // Calculate total usage
      let totalUsage = 0;
      if (settings.limit_type === 'messages') {
        totalUsage = usage?.reduce((acc, chat) => acc + (chat.messages_used || 1), 0) || 0;
      } else {
        totalUsage = usage?.reduce((acc, chat) => acc + (chat.tokens_used || 0), 0) || 0;
      }

      console.log("Total usage:", totalUsage, "Max allowed:", settings.units_per_period);

      const isExceeded = totalUsage >= settings.units_per_period;
      let resetDate = null;

      if (isExceeded && usage && usage.length > 0) {
        // Calculate reset date based on the oldest message in the current period
        const oldestMessage = usage.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )[0];

        if (oldestMessage) {
          const oldestDate = parseISO(oldestMessage.created_at);
          switch (settings.reset_period) {
            case 'hourly':
              resetDate = new Date(oldestDate);
              resetDate.setHours(resetDate.getHours() + settings.reset_amount || 1);
              break;
            case 'daily':
              resetDate = addDays(oldestDate, settings.reset_amount || 1);
              break;
            case 'weekly':
              resetDate = addDays(oldestDate, (settings.reset_amount || 1) * 7);
              break;
            case 'monthly':
              resetDate = addDays(oldestDate, (settings.reset_amount || 1) * 30);
              break;
          }
        }
      }

      console.log("Is exceeded:", isExceeded, "Reset date:", resetDate);

      setLimits({
        isExceeded,
        resetDate,
        currentUsage: totalUsage,
        maxUsage: settings.units_per_period,
        limitType: settings.limit_type as 'messages' | 'tokens'
      });

      if (isExceeded) {
        toast({
          title: "Usage Limit Exceeded",
          description: `You have exceeded your ${settings.limit_type} limit of ${settings.units_per_period}. ${resetDate ? `Your access will be restored on ${resetDate.toLocaleDateString()}.` : ''}`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error checking subscription limits:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription limits",
        variant: "destructive",
      });
    }
  };

  return {
    ...limits,
    checkSubscriptionLimits
  };
};