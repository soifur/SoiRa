import { useState, useCallback } from 'react';
import { Message } from '@/components/chat/types/chatTypes';
import { Bot } from '@/hooks/useBots';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

interface MemoryContext {
  name?: string | null;
  faith?: string | null;
  likes: string[];
  topics: string[];
  facts: string[];
  [key: string]: string | string[] | null | undefined;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const useMemoryContext = (bot: Bot, clientId: string, sessionToken: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const initializeContext = (): MemoryContext => ({
    name: null,
    faith: null,
    likes: [],
    topics: [],
    facts: []
  });

  const validateContext = (context: MemoryContext): boolean => {
    if (!Array.isArray(context.likes) || !Array.isArray(context.topics) || !Array.isArray(context.facts)) {
      console.error('Invalid context structure:', context);
      return false;
    }
    return true;
  };

  const handleMemoryUpdate = useCallback(async (messages: Message[], retryCount = 0) => {
    if (!bot.memory_enabled) {
      console.log('Memory updates are disabled for this bot');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Initialize context with default values
      const context = initializeContext();

      messages.forEach(message => {
        if (message.role === 'user') {
          // Extract name with null fallback
          const nameMatch = message.content.match(/my name is ([^\.,!?]+)/i);
          if (nameMatch) {
            context.name = nameMatch[1].trim() || null;
          }

          // Extract faith with null fallback
          const faithMatch = message.content.match(/I am (a |an )?([^\.,!?]+) (believer|faith|religion)/i);
          if (faithMatch) {
            context.faith = faithMatch[2].trim() || null;
          }

          // Extract and validate likes array
          const likeMatches = message.content.match(/I (like|love|enjoy|prefer) ([^\.,!?]+)/gi);
          if (likeMatches) {
            const newLikes = likeMatches.map(match => 
              match.replace(/I (like|love|enjoy|prefer) /i, '').trim()
            ).filter(Boolean);
            context.likes = [...new Set([...context.likes, ...newLikes])];
          }

          // Extract and validate topics array
          const topicMatches = message.content.match(/\b(about|regarding|concerning) ([^\.,!?]+)/gi);
          if (topicMatches) {
            const newTopics = topicMatches.map(match =>
              match.replace(/\b(about|regarding|concerning) /i, '').trim()
            ).filter(Boolean);
            context.topics = [...new Set([...context.topics, ...newTopics])];
          }

          // Extract and validate facts array
          const factMatches = message.content.match(/I (am|work as|live in|have) ([^\.,!?]+)/gi);
          if (factMatches) {
            const newFacts = factMatches.map(match => match.trim()).filter(Boolean);
            context.facts = [...new Set([...context.facts, ...newFacts])];
          }
        }
      });

      // Validate context before database update
      if (!validateContext(context)) {
        throw new Error('Invalid context structure detected');
      }

      // Update context in database
      const { error: updateError } = await supabase
        .from('user_context')
        .upsert({
          bot_id: bot.id,
          client_id: clientId,
          session_token: sessionToken,
          context: context as Json,
          last_updated: new Date().toISOString()
        });

      if (updateError) throw updateError;

      console.log('Memory context updated successfully:', context);

    } catch (err) {
      console.error('Error updating memory context:', err);
      
      // Implement retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying memory update (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        setTimeout(() => {
          handleMemoryUpdate(messages, retryCount + 1);
        }, RETRY_DELAY);
        return;
      }

      setError(err instanceof Error ? err.message : 'Failed to update memory context');
      toast({
        title: "Error",
        description: "Failed to update memory context. Some features may be limited.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [bot.memory_enabled, bot.id, clientId, sessionToken, toast]);

  return {
    handleMemoryUpdate,
    isLoading,
    error
  };
};