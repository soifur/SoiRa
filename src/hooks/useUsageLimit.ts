import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useUsageLimit = () => {
  const [isExceeded, setIsExceeded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkUsageLimit = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profile) return;

        // Check if user has exceeded their usage limit
        const { data: chatHistory } = await supabase
          .from('chat_history')
          .select('messages_used')
          .eq('user_id', user.id);

        const totalMessages = chatHistory?.reduce((acc, chat) => acc + (chat.messages_used || 0), 0) || 0;
        
        // This is a simplified check. You might want to implement more sophisticated logic
        const MESSAGE_LIMIT = 100; // Example limit
        setIsExceeded(totalMessages >= MESSAGE_LIMIT);

      } catch (error) {
        console.error('Error checking usage limit:', error);
        toast({
          title: "Error",
          description: "Failed to check usage limit",
          variant: "destructive",
        });
      }
    };

    checkUsageLimit();
  }, []);

  return { isExceeded };
};