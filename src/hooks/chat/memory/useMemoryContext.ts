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
  [key: string]: string | string[] | null | undefined; // Add index signature
}

interface DatabaseContext {
  context: MemoryContext;
  last_updated: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const useMemoryContext = (bot: Bot, clientId: string, sessionToken: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMemoryUpdate = useCallback(async (messages: Message[], retryCount = 0) => {
    if (!bot.memory_enabled) {
      console.log('Memory updates are disabled for this bot');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Extract context from messages
      const context: MemoryContext = {
        likes: [],
        topics: [],
        facts: []
      };

      messages.forEach(message => {
        if (message.role === 'user') {
          // Extract name
          const nameMatch = message.content.match(/my name is ([^\.,!?]+)/i);
          if (nameMatch) {
            context.name = nameMatch[1].trim();
          }

          // Extract faith
          const faithMatch = message.content.match(/I am (a |an )?([^\.,!?]+) (believer|faith|religion)/i);
          if (faithMatch) {
            context.faith = faithMatch[2].trim();
          }

          // Extract likes
          const likeMatches = message.content.match(/I (like|love|enjoy|prefer) ([^\.,!?]+)/gi);
          if (likeMatches) {
            likeMatches.forEach(match => {
              const like = match.replace(/I (like|love|enjoy|prefer) /i, '').trim();
              if (!context.likes.includes(like)) {
                context.likes.push(like);
              }
            });
          }

          // Extract topics
          const topicMatches = message.content.match(/\b(about|regarding|concerning) ([^\.,!?]+)/gi);
          if (topicMatches) {
            topicMatches.forEach(match => {
              const topic = match.replace(/\b(about|regarding|concerning) /i, '').trim();
              if (!context.topics.includes(topic)) {
                context.topics.push(topic);
              }
            });
          }

          // Extract facts
          const factMatches = message.content.match(/I (am|work as|live in|have) ([^\.,!?]+)/gi);
          if (factMatches) {
            factMatches.forEach(match => {
              const fact = match.trim();
              if (!context.facts.includes(fact)) {
                context.facts.push(fact);
              }
            });
          }
        }
      });

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