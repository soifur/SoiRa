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
    const fetchBots = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;

        const { data: botsData, error } = await supabase
          .from('bots')
          .select('*')
          .eq('user_id', session.session.user.id);

        if (error) {
          console.error('Error fetching bots:', error);
          return;
        }

        const transformedBots = botsData.map((bot): Bot => ({
          id: bot.id,
          name: bot.name,
          instructions: bot.instructions || "",
          starters: bot.starters || [],
          model: bot.model,
          apiKey: bot.api_key,
          openRouterModel: bot.open_router_model,
          avatar: bot.avatar,
          accessType: "private",
          memoryEnabled: bot.memory_enabled
        }));

        setBots(transformedBots);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchBots();
  }, []);

  // Load bot's memory configuration when selected
  useEffect(() => {
    if (!selectedBotId) return;

    const selectedBot = bots.find(bot => bot.id === selectedBotId);
    if (selectedBot) {
      setInstructions(selectedBot.instructions || "");
      setModel(selectedBot.model);
      setOpenRouterModel(selectedBot.openRouterModel || "auto");
      setApiKey(selectedBot.apiKey || "");
    }
  }, [selectedBotId, bots]);

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

      if (!selectedBotId) {
        toast({
          title: "Error",
          description: "Please select a bot",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('bots')
        .update({
          instructions,
          model,
          api_key: apiKey,
          open_router_model: model === 'openrouter' ? openRouterModel : null,
          memory_enabled: true
        })
        .eq('id', selectedBotId);

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
        <h2 className="text-2xl font-bold mb-6">Bot Memory Configuration</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bot-select">Select Bot</Label>
            <select
              id="bot-select"
              value={selectedBotId}
              onChange={(e) => setSelectedBotId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a bot</option>
              {bots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name}
                </option>
              ))}
            </select>
          </div>

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
            disabled={!selectedBotId || !instructions || !apiKey || isLoading}
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