import React, { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Bot } from "@/hooks/useBots";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

interface BotAdvancedSettingsProps {
  bot: Bot;
  onBotChange: (updates: Partial<Bot>) => void;
}

export const BotAdvancedSettings = ({ bot, onBotChange }: BotAdvancedSettingsProps) => {
  const handleSliderChange = useDebouncedCallback(
    (key: keyof Bot, value: number[]) => {
      onBotChange({ [key]: value[0] });
    },
    300
  );

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="flex w-full justify-between p-4">
          Advanced Settings
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="p-4 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Temperature ({bot.temperature})</Label>
              <Slider
                value={[bot.temperature || 1]}
                onValueChange={(value) => handleSliderChange('temperature', value)}
                min={0}
                max={2}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label>Top P ({bot.top_p})</Label>
              <Slider
                value={[bot.top_p || 1]}
                onValueChange={(value) => handleSliderChange('top_p', value)}
                min={0}
                max={1}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label>Frequency Penalty ({bot.frequency_penalty})</Label>
              <Slider
                value={[bot.frequency_penalty || 0]}
                onValueChange={(value) => handleSliderChange('frequency_penalty', value)}
                min={-2}
                max={2}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label>Presence Penalty ({bot.presence_penalty})</Label>
              <Slider
                value={[bot.presence_penalty || 0]}
                onValueChange={(value) => handleSliderChange('presence_penalty', value)}
                min={-2}
                max={2}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Tokens ({bot.max_tokens})</Label>
              <Slider
                value={[bot.max_tokens || 4096]}
                onValueChange={(value) => handleSliderChange('max_tokens', value)}
                min={1}
                max={32000}
                step={1}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="stream-mode"
                checked={bot.stream}
                onCheckedChange={(checked) => onBotChange({ stream: checked })}
              />
              <Label htmlFor="stream-mode">Enable Streaming</Label>
            </div>

            <div className="space-y-2">
              <Label>System Templates</Label>
              <Textarea
                value={JSON.stringify(bot.system_templates || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onBotChange({ system_templates: parsed });
                  } catch (error) {
                    console.error('Invalid JSON for system templates');
                  }
                }}
                placeholder="[
  {
    'role': 'system',
    'content': 'You are a helpful assistant'
  }
]"
                className="font-mono"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Tool Configuration</Label>
              <Textarea
                value={JSON.stringify(bot.tool_config || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onBotChange({ tool_config: parsed });
                  } catch (error) {
                    console.error('Invalid JSON for tool config');
                  }
                }}
                placeholder="[
  {
    'type': 'function',
    'function': {
      'name': 'get_weather',
      'description': 'Get the weather in a location',
      'parameters': {
        'type': 'object',
        'properties': {
          'location': {
            'type': 'string',
            'description': 'The city and state, e.g. San Francisco, CA'
          }
        },
        'required': ['location']
      }
    }
  }
]"
                className="font-mono"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Response Format</Label>
              <Textarea
                value={JSON.stringify(bot.response_format || { type: "text" }, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onBotChange({ response_format: parsed });
                  } catch (error) {
                    console.error('Invalid JSON for response format');
                  }
                }}
                placeholder="{
  'type': 'json_object'
}"
                className="font-mono"
                rows={4}
              />
            </div>
          </div>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};