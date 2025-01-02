import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import { ModelSelector } from "@/components/bot/ModelSelector";

const Settings = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState("");
  const [instructions, setInstructions] = useState("");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<"gemini" | "claude" | "openai" | "openrouter">("openrouter");
  const [openRouterModel, setOpenRouterModel] = useState("auto");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const fetchMemoryConfig = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;

        const { data, error } = await supabase
          .from('user_context')
          .select('context')
          .eq('user_id', session.session.user.id)
          .single();

        if (error) {
          console.error('Error fetching memory config:', error);
          return;
        }

        if (data?.context) {
          setInstructions(data.context.instructions || "");
          setModel(data.context.model || "openrouter");
          setOpenRouterModel(data.context.openRouterModel || "auto");
          setApiKey(data.context.apiKey || "");
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchMemoryConfig();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      const clientId = crypto.randomUUID();

      const { error } = await supabase
        .from('user_context')
        .upsert({
          bot_id: selectedBotId,
          client_id: clientId,
          context: { 
            instructions,
            model,
            apiKey,
            openRouterModel: model === 'openrouter' ? openRouterModel : undefined
          },
          last_updated: new Date().toISOString(),
          session_token: session?.access_token,
          user_id: session?.user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Memory configuration saved successfully",
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
        <h2 className="text-2xl font-bold mb-6">Memory Configuration</h2>
        
        <div className="space-y-6">
          <ModelSelector 
            bot={{
              id: selectedBotId,
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