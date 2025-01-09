import { useState, useCallback } from 'react';
import { Bot } from '@/hooks/useBots';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

export const useChatLimits = (selectedBot: Bot | undefined) => {
  const {
    isExceeded,
    resetDate,
    maxUsage,
    limitType,
    checkSubscriptionLimits
  } = useSubscriptionLimits(selectedBot?.id);

  const checkLimits = useCallback(() => {
    if (selectedBot) {
      checkSubscriptionLimits();
    }
  }, [selectedBot, checkSubscriptionLimits]);

  return { isExceeded, maxUsage, limitType, resetDate, checkLimits };
};