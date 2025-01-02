import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ModelSelector } from "@/components/bot/ModelSelector";

interface MemoryBot {
  id: string;
  name: string;
  instructions: string;
  model: "gemini" | "claude" | "openai" | "openrouter";
  apiKey: string;
  openRouterModel?: string;
}

const Settings = () => {
  const [memoryBot, setMemoryBot] = useState<MemoryBot | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMemoryBot();
  }, []);

  const fetchMemoryBot = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('name', 'Memory Bot')
        .single();

      if (error) throw error;

      setMemoryBot({
        id: data.id,
        name: data.name,
        instructions: data.instructions || "",
        model: data.model,
        apiKey: data.api_key,
        openRouterModel: data.open_router_model,
      });
    } catch (error) {
      console.error('Error fetching Memory Bot:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Memory Bot configuration",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!memoryBot) return;

    try {
      const { error } = await supabase
        .from('bots')
        .update({
          instructions: memoryBot.instructions,
          model: memoryBot.model,
          api_key: memoryBot.apiKey,
          open_router_model: memoryBot.openRouterModel,
        })
        .eq('id', memoryBot.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Memory Bot configuration saved successfully",
      });
    } catch (error) {
      console.error('Error saving Memory Bot:', error);
      toast({
        title: "Error",
        description: "Failed to save Memory Bot configuration",
        variant: "destructive",
      });
    }
  };

  const handleModelChange = (model: "gemini" | "claude" | "openai" | "openrouter") => {
    if (!memoryBot) return;
    setMemoryBot({ 
      ...memoryBot, 
      model: model,
      openRouterModel: model === "openrouter" ? memoryBot.openRouterModel : undefined 
    });
  };

  if (!memoryBot) return null;

  return (
    <div className="container mx-auto max-w-4xl pt-20 px-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Memory Bot Configuration</h2>
        
        <div className="space-y-6">
          <ModelSelector 
            bot={memoryBot}
            onModelChange={handleModelChange}
            onOpenRouterModelChange={(model) => setMemoryBot({ ...memoryBot, openRouterModel: model })}
          />

          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <Input
              type="password"
              value={memoryBot.apiKey}
              onChange={(e) => setMemoryBot({ ...memoryBot, apiKey: e.target.value })}
              placeholder="Enter your API key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Instructions</label>
            <Textarea
              value={memoryBot.instructions}
              onChange={(e) => setMemoryBot({ ...memoryBot, instructions: e.target.value })}
              placeholder="Enter instructions for the Memory Bot..."
              rows={4}
            />
          </div>

          <Button onClick={handleSave}>Save Configuration</Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;