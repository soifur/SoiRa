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

export const useMemorySettings = () => {
  const [settings, setSettings] = useState<MemorySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('memory_bot_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        // Ensure the model is of type MemoryModel
        const model = data.model as MemoryModel;
        setSettings({
          id: data.id,
          model,
          open_router_model: data.open_router_model,
          api_key: data.api_key,
          instructions: data.instructions
        });
      }
    } catch (error) {
      console.error("Error fetching memory settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: Omit<MemorySettings, 'id'>) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Not authenticated");

      const { data: existingSettings } = await supabase
        .from('memory_bot_settings')
        .select('id')
        .maybeSingle();

      let result;
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('memory_bot_settings')
          .update({
            ...newSettings,
            user_id: user.data.user.id
          })
          .eq('id', existingSettings.id)
          .select()
          .single();
      } else {
        // Insert new settings
        result = await supabase
          .from('memory_bot_settings')
          .insert({
            ...newSettings,
            user_id: user.data.user.id
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      if (result.data) {
        const model = result.data.model as MemoryModel;
        setSettings({
          id: result.data.id,
          model,
          open_router_model: result.data.open_router_model,
          api_key: result.data.api_key,
          instructions: result.data.instructions
        });
      }
      
      toast({
        title: "Success",
        description: "Memory settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving memory settings:", error);
      toast({
        title: "Error",
        description: "Failed to save memory settings",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    saveSettings,
  };
};