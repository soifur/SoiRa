import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bot } from '@/hooks/useBots';

interface MemoryContext {
  name: string | null;
  faith: string | null;
  likes: string[];
  topics: string[];
  facts: string[];
}

export const useMemoryContext = (bot: Bot | undefined, clientId: string, sessionToken?: string) => {
  const [context, setContext] = useState<MemoryContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bot?.id) return;
    
    const loadContext = async () => {
      try {
        const { data, error } = await supabase
          .from('user_context')
          .select('context, combined_context')
          .eq('bot_id', bot.id)
          .eq('client_id', clientId)
          .eq('session_token', sessionToken)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setContext(data.combined_context || data.context);
        } else {
          setContext({
            name: null,
            faith: null,
            likes: [],
            topics: [],
            facts: []
          });
        }
      } catch (error) {
        console.error('Error loading memory context:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContext();
  }, [bot?.id, clientId, sessionToken]);

  const updateContext = async (newContext: Partial<MemoryContext>) => {
    if (!bot?.id) return;

    try {
      const { error } = await supabase
        .from('user_context')
        .upsert({
          bot_id: bot.id,
          client_id: clientId,
          session_token: sessionToken,
          context: newContext,
          is_global: bot.memory_enabled_model
        });

      if (error) throw error;
      
      setContext(prev => ({
        ...prev,
        ...newContext
      } as MemoryContext));
      
    } catch (error) {
      console.error('Error updating memory context:', error);
      throw error;
    }
  };

  return { context, isLoading, updateContext };
};