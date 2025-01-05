import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addDays, isAfter, parseISO, subDays } from 'date-fns';
import { LimitType, ResetPeriod, UserRole } from '@/types/subscription';
import { Message } from '@/components/chat/types/chatTypes';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      console.log("Checking limits for user role:", profile.role);

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

      const { data: usage, error: usageError } = await supabase
        .from('chat_history')
        .select('messages, messages_used, tokens_used, created_at')
        .eq('bot_id', botId)
        .eq('user_id', user.id)
        .gte('created_at', periodStart.toISOString());

      if (usageError) throw usageError;

      console.log("Found usage records:", usage);

      let totalUsage = 0;
      if (settings.limit_type === 'messages') {
        totalUsage = usage?.reduce((acc, chat) => {
          const messages = chat.messages as unknown as Message[];
          const userMessages = messages ? messages.filter(msg => msg.role === 'user').length : 0;
          return acc + userMessages;
        }, 0) || 0;
      } else {
        totalUsage = usage?.reduce((acc, chat) => acc + (chat.tokens_used || 0), 0) || 0;
      }

      console.log("Total usage calculated:", totalUsage, "out of", settings.units_per_period);

      const isExceeded = totalUsage >= settings.units_per_period;
      let resetDate = null;

      if (isExceeded) {
        const oldestMessage = usage?.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )[0];

        if (oldestMessage) {
          const oldestDate = parseISO(oldestMessage.created_at);
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
          description: `You have exceeded your ${settings.limit_type} limit of ${settings.units_per_period}. Your access will be restored on ${resetDate?.toLocaleDateString()}.`,
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

  useEffect(() => {
    checkSubscriptionLimits();
  }, [botId]);

  return {
    ...limits,
    checkSubscriptionLimits
  };
};