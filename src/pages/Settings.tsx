import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ModelSelector } from "@/components/bot/ModelSelector";
import { useMemorySettings } from "@/hooks/useMemorySettings";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, isLoading, saveSettings } = useMemorySettings();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveMemorySettings = async () => {
    if (!localSettings) return;
    
    await saveSettings({
      model: localSettings.model,
      open_router_model: localSettings.open_router_model,
      api_key: localSettings.api_key,
      instructions: localSettings.instructions,
    });
  };

  const handleApiKeyChange = (value: string) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        api_key: value,
      });
    }
  };

  const handleInstructionsChange = (value: string) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        instructions: value,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Memory Bot Configuration</h2>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <ModelSelector 
                bot={{
                  id: "memory-settings",
                  name: "Memory Settings",
                  instructions: "",
                  starters: [],
                  model: localSettings?.model || "openrouter",
                  apiKey: "",
                  openRouterModel: localSettings?.open_router_model,
                }}
                onModelChange={(model) => 
                  localSettings && setLocalSettings({ 
                    ...localSettings, 
                    model: model === "gemini" ? "gemini" : "openrouter" 
                  })
                }
                onOpenRouterModelChange={(model) => 
                  localSettings && setLocalSettings({ 
                    ...localSettings, 
                    open_router_model: model 
                  })
                }
                isMemorySelector
              />
              
              <div>
                <label className="block text-sm font-medium mb-1">API Key</label>
                <Input
                  type="password"
                  value={localSettings?.api_key || ""}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="Enter your API key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Memory Instructions</label>
                <Textarea
                  value={localSettings?.instructions || ""}
                  onChange={(e) => handleInstructionsChange(e.target.value)}
                  placeholder="Enter memory instructions..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSaveMemorySettings}>
                Save Memory Settings
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Settings;