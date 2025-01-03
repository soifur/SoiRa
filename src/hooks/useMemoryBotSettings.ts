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
        // Set default settings if none found
        setSettings({
          model: "openrouter",
          api_key: "",
          instructions: "Please analyze the conversation and maintain context about the user, including their preferences, background, and any important details they share. Update the context with new information while preserving existing knowledge unless it's explicitly contradicted."
        });
      }
    } catch (err) {
      console.error("Error in fetchSettings:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch memory settings'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    error,
    saveSettings,
  };
};