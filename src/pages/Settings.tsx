import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ModelSelector } from "@/components/bot/ModelSelector";

const Settings = () => {
  const [instructions, setInstructions] = useState("");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<"gemini" | "claude" | "openai" | "openrouter">("openrouter");
  const [openRouterModel, setOpenRouterModel] = useState("auto");
  const [apiKey, setApiKey] = useState("");

  // Load existing memory configuration
  useEffect(() => {
    const loadMemoryConfig = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;

        const { data: botsData, error } = await supabase
          .from('bots')
          .select('instructions, model, api_key, open_router_model')
          .eq('memory_enabled', true)
          .limit(1);

        if (error) {
          console.error('Error fetching memory config:', error);
          return;
        }

        if (botsData && botsData.length > 0) {
          const bot = botsData[0];
          setInstructions(bot.instructions || "");
          setModel(bot.model);
          setOpenRouterModel(bot.open_router_model || "auto");
          setApiKey(bot.api_key || "");
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    loadMemoryConfig();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "Error",
          description: "You must be logged in to save memory configuration",
          variant: "destructive",
        });
        return;
      }

      // Update all bots where memory is enabled
      const { error } = await supabase
        .from('bots')
        .update({
          instructions,
          model,
          api_key: apiKey,
          open_router_model: model === 'openrouter' ? openRouterModel : null
        })
        .eq('memory_enabled', true)
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Memory configuration saved successfully for all memory-enabled bots",
      });
    } catch (error) {
      console.error('Error saving memory config:', error);
      toast({
        title: "Error",
        description: "Failed to save memory configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl pt-20 px-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Global Memory Configuration</h2>
        
        <div className="space-y-6">
          <ModelSelector 
            bot={{
              id: "",
              name: "",
              instructions: "",
              starters: [],
              model: model,
              apiKey: apiKey,
              openRouterModel: openRouterModel,
              memoryEnabled: true
            }}
            onModelChange={(newModel) => setModel(newModel)}
            onOpenRouterModelChange={(newModel) => setOpenRouterModel(newModel)}
          />

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key for the selected model"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Memory Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter instructions for memory summarization"
              className="min-h-[150px]"
            />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={!instructions || !apiKey || isLoading}
            className="w-full"
          >
            {isLoading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;