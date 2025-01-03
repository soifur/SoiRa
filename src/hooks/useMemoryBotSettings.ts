import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type MemoryModel = "gemini" | "openrouter";

export interface MemorySettings {
  id?: string;
  model: MemoryModel;
  open_router_model?: string;
  api_key: string;
  instructions?: string;
}

export const useMemoryBotSettings = () => {
  const [settings, setSettings] = useState<MemorySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      console.log("Fetching memory bot settings");
      
      const { data: memoryBotData, error: memoryBotError } = await supabase
        .from('memory_bot_settings')
        .select('*')
        .maybeSingle();

      if (memoryBotError) {
        console.error("Error fetching memory bot settings:", memoryBotError);
        throw memoryBotError;
      }

      if (memoryBotData) {
        console.log("Found memory bot settings:", {
          ...memoryBotData,
          api_key: '[REDACTED]'
        });
        
        const validatedSettings: MemorySettings = {
          id: memoryBotData.id,
          model: memoryBotData.model as MemoryModel,
          open_router_model: memoryBotData.open_router_model,
          api_key: memoryBotData.api_key,
          instructions: memoryBotData.instructions
        };

        setSettings(validatedSettings);
        setError(null);
        return;
      }

      // If no settings found in memory_bot_settings
      console.log("No memory settings found");
      setSettings(null);
      setError(null);

    } catch (err) {
      console.error("Error in fetchSettings:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch memory settings'));
      setSettings(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSettings = async (newSettings: MemorySettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('memory_bot_settings')
        .upsert({
          id: newSettings.id,
          model: newSettings.model,
          open_router_model: newSettings.open_router_model,
          api_key: newSettings.api_key,
          instructions: newSettings.instructions,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const validatedSettings: MemorySettings = {
        id: data.id,
        model: data.model as MemoryModel,
        open_router_model: data.open_router_model,
        api_key: data.api_key,
        instructions: data.instructions
      };

      setSettings(validatedSettings);
      setError(null);
      
      toast({
        title: "Success",
        description: "Memory settings saved successfully",
      });
      return true;
    } catch (err) {
      console.error("Error saving memory settings:", err);
      setError(err instanceof Error ? err : new Error('Failed to save memory settings'));
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save memory settings",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    settings,
    isLoading,
    error,
    saveSettings,
  };
};