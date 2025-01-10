import { useState, useEffect } from 'react';
import { Bot } from '@/components/chat/types/chatTypes';
import { supabase } from '@/integrations/supabase/client';

export interface MemoryContext {
  name: string | null;
  faith: string | null;
  likes: string[];
  topics: string[];
  facts: string[];
}

export const useMemoryContext = (
  bot: Bot | undefined,
  clientId: string,
  sessionToken?: string
) => {
  const [context, setContext] = useState<MemoryContext>({
    name: null,
    faith: null,
    likes: [],
    topics: [],
    facts: []
  });
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
          const contextData = data.combined_context || data.context;
          setContext({
            name: contextData?.name || null,
            faith: contextData?.faith || null,
            likes: Array.isArray(contextData?.likes) ? contextData.likes : [],
            topics: Array.isArray(contextData?.topics) ? contextData.topics : [],
            facts: Array.isArray(contextData?.facts) ? contextData.facts : []
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
      }));
      
    } catch (error) {
      console.error('Error updating memory context:', error);
      throw error;
    }
  };

  const handleMemoryUpdate = async (messages: Array<{ role: string; content: string }>) => {
    // Process messages and extract context
    const newContext: Partial<MemoryContext> = {
      // Add context extraction logic here if needed
    };
    await updateContext(newContext);
  };

  return { 
    context, 
    isLoading, 
    updateContext,
    handleMemoryUpdate 
  };
};