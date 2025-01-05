import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addDays, subDays } from 'date-fns';
import { LimitType } from '@/types/subscription';

interface SubscriptionLimit {
  isExceeded: boolean;
  resetDate: Date | null;
  currentUsage: number;
  maxUsage: number;
  limitType: LimitType;
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

  const checkSubscriptionLimits = async () => {
    if (!botId) return;
    
    try {
      // Get current user's profile to check role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      console.log("Checking limits for user role:", profile.role);

      // Get subscription settings for this bot and user role
      const { data: settings } = await supabase
        .from('model_subscription_settings')
        .select('*')
        .eq('bot_id', botId)
        .eq('user_role', profile.role)
        .single();

      if (!settings) {
        console.log('No subscription settings found for this bot and user role');
        return;
      }

      console.log("Found subscription settings:", settings);

      // Calculate the period start date based on reset_amount and reset_period
      let periodStart = new Date();
      const resetAmount = settings.reset_amount || 1;
      
      switch (settings.reset_period) {
        case 'daily':
          periodStart = subDays(periodStart, resetAmount);
          break;
        case 'weekly':
          periodStart = subDays(periodStart, 7 * resetAmount);
          break;
        case 'monthly':
          periodStart = subDays(periodStart, 30 * resetAmount);
          break;
        case 'never':
          periodStart = new Date(0);
          break;
      }

      console.log("Checking usage since:", periodStart.toISOString());

      // Get usage within the period
      const { data: usage, error: usageError } = await supabase
        .from('chat_history')
        .select('messages_used, tokens_used, created_at')
        .eq('bot_id', botId)
        .eq('user_id', user.id)
        .gte('created_at', periodStart.toISOString());

      if (usageError) throw usageError;

      console.log("Found usage records:", usage);

      // Calculate total usage
      let totalUsage = 0;
      if (settings.limit_type === 'messages') {
        totalUsage = usage?.reduce((acc, chat) => acc + (chat.messages_used || 1), 0) || 0;
      } else {
        totalUsage = usage?.reduce((acc, chat) => acc + (chat.tokens_used || 0), 0) || 0;
      }

      console.log("Total usage calculated:", totalUsage, "out of", settings.units_per_period);

      const isExceeded = totalUsage >= settings.units_per_period;
      let resetDate = null;

      if (isExceeded) {
        // Calculate reset date based on the oldest message in the current period
        const oldestMessage = usage?.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )[0];

        if (oldestMessage) {
          const oldestDate = new Date(oldestMessage.created_at);
          switch (settings.reset_period) {
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

        console.log("Limit exceeded. Reset date:", resetDate);
        
        toast({
          title: "Usage Limit Exceeded",
          description: `You have exceeded your ${settings.limit_type} limit of ${settings.units_per_period}. ${resetDate ? `Your access will be restored on ${resetDate.toLocaleDateString()}.` : ''}`,
          variant: "destructive",
        });
      }

      setLimits({
        isExceeded,
        resetDate,
        currentUsage: totalUsage,
        maxUsage: settings.units_per_period,
        limitType: settings.limit_type as LimitType
      });

    } catch (error) {
      console.error('Error checking subscription limits:', error);
    }
  };

  // Check limits on mount and when botId changes
  useEffect(() => {
    checkSubscriptionLimits();
  }, [botId]);

  return {
    ...limits,
    checkSubscriptionLimits
  };
};