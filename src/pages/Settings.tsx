import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";

const Settings = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [instructions, setInstructions] = useState("");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBots = async () => {
      const { data: botsData, error } = await supabase
        .from('bots')
        .select('*');
      
      if (error) {
        console.error('Error fetching bots:', error);
        return;
      }

      // Transform the data to match our Bot interface
      const transformedBots: Bot[] = botsData.map(bot => ({
        id: bot.id,
        name: bot.name,
        instructions: bot.instructions || "",
        starters: bot.starters || [],
        model: bot.model,
        apiKey: bot.api_key,
        openRouterModel: bot.open_router_model,
        avatar: bot.avatar,
        accessType: "private"
      }));

      setBots(transformedBots);
    };

    fetchBots();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      const clientId = crypto.randomUUID(); // Generate a unique client ID

      // Update or insert memory bot configuration
      const { error } = await supabase
        .from('user_context')
        .upsert({
          bot_id: selectedBotId,
          client_id: clientId,
          context: { instructions },
          last_updated: new Date().toISOString(),
          session_token: session?.access_token,
          user_id: session?.user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Memory bot configuration saved successfully",
      });
    } catch (error) {
      console.error('Error saving memory bot config:', error);
      toast({
        title: "Error",
        description: "Failed to save memory bot configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl pt-20 px-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Memory Bot Configuration</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bot-select">Select Memory Bot</Label>
            <Select
              value={selectedBotId}
              onValueChange={setSelectedBotId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a bot" />
              </SelectTrigger>
              <SelectContent>
                {bots.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key"
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
            disabled={!selectedBotId || !apiKey || !instructions || isLoading}
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