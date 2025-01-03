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
import type { MemorySettings } from "@/hooks/useMemorySettings";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, isLoading, saveSettings } = useMemorySettings();
  const [formData, setFormData] = useState<MemorySettings>({
    model: "openrouter",
    api_key: "",
    instructions: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        model: settings.model,
        open_router_model: settings.open_router_model,
        api_key: settings.api_key || "",
        instructions: settings.instructions || "",
      });
    }
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
    await saveSettings(formData);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      api_key: e.target.value,
    }));
  };

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      instructions: e.target.value,
    }));
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
                  model: formData.model,
                  apiKey: "",
                  openRouterModel: formData.open_router_model,
                }}
                onModelChange={(model) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    model: model === "gemini" ? "gemini" : "openrouter" 
                  }))
                }
                onOpenRouterModelChange={(model) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    open_router_model: model 
                  }))
                }
                isMemorySelector
              />
              
              <div>
                <label className="block text-sm font-medium mb-1">API Key</label>
                <Input
                  type="password"
                  value={formData.api_key}
                  onChange={handleApiKeyChange}
                  placeholder="Enter your API key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Memory Instructions</label>
                <Textarea
                  value={formData.instructions}
                  onChange={handleInstructionsChange}
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