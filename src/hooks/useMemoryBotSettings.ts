import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MemorySettings } from './useMemorySettings';

export const useMemoryBotSettings = () => {
  const [settings, setSettings] = useState<MemorySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log("Fetching memory bot settings");
        const { data: memoryBotData, error: memoryBotError } = await supabase
          .from('memory_bot_settings')
          .select('*')
          .limit(1)
          .single();

        if (memoryBotError) {
          console.error("Error fetching memory bot settings:", memoryBotError);
          return;
        }
        
        if (memoryBotData) {
          console.log("Found memory bot settings:", memoryBotData);
          setSettings({
            id: memoryBotData.id,
            model: memoryBotData.model as "gemini" | "openrouter",
            open_router_model: memoryBotData.open_router_model,
            api_key: memoryBotData.api_key,
            instructions: memoryBotData.instructions
          });
        } else {
          console.log("No memory bot settings found");
        }
      } catch (err) {
        console.error("Error in fetchSettings:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch memory settings'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, isLoading, error };
};