import { useMemorySettings } from "@/hooks/useMemorySettings";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ModelSelector } from "@/components/bot/ModelSelector";
import { Textarea } from "@/components/ui/textarea";

export const MemoryBotSettings = () => {
  const { settings, isLoading, saveSettings } = useMemorySettings();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleSave = async () => {
    if (!settings) return;
    await saveSettings(settings);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <Label>Model Selection</Label>
          {settings && (
            <ModelSelector
              bot={{
                id: 'memory',
                model: settings.model === 'gemini' ? 'gemini' : 'openrouter',
                openRouterModel: settings.open_router_model,
                name: 'Memory Bot',
                instructions: '',
                starters: [],
                apiKey: settings.api_key || ''
              }}
              onModelChange={(model) => {
                if (model === 'gemini' || model === 'openrouter') {
                  saveSettings({ ...settings, model });
                }
              }}
              onOpenRouterModelChange={(model) => saveSettings({ ...settings, open_router_model: model })}
              isMemorySelector
            />
          )}
        </div>

        <div>
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={settings?.api_key || ''}
            onChange={(e) => saveSettings({ ...settings, api_key: e.target.value })}
            placeholder="Enter API key"
          />
        </div>

        <div>
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            value={settings?.instructions || ''}
            onChange={(e) => saveSettings({ ...settings, instructions: e.target.value })}
            placeholder="Enter instructions for the memory bot"
            className="min-h-[100px]"
          />
        </div>

        <Button onClick={handleSave} className="w-full">Save Changes</Button>
      </div>
    </Card>
  );
};