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
        const { data, error } = await supabase
          .from('memory_bot_settings')
          .select('*')
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          console.log("Found memory bot settings:", data);
          setSettings({
            id: data.id,
            model: data.model as "gemini" | "openrouter",
            open_router_model: data.open_router_model,
            api_key: data.api_key,
            instructions: data.instructions
          });
        } else {
          console.log("No memory bot settings found");
        }
      } catch (err) {
        console.error("Error fetching memory settings:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch memory settings'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, isLoading, error };
};