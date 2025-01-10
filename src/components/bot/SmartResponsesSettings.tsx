import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bot } from "@/hooks/useBots";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface SmartResponsesSettingsProps {
  bot: Bot;
  onBotChange: (updates: Partial<Bot>) => void;
}

export const SmartResponsesSettings = ({ bot, onBotChange }: SmartResponsesSettingsProps) => {
  const { toast } = useToast();

  const handleSmartResponsesToggle = (checked: boolean) => {
    try {
      onBotChange({
        response_format: checked
          ? {
              type: "json_object",
              schema: {
                type: "object",
                properties: {
                  response: {
                    type: "string",
                    description: "The main response content"
                  },
                  context: {
                    type: "object",
                    properties: {
                      tone: {
                        type: "string",
                        description: "The detected tone of the conversation"
                      },
                      topics: {
                        type: "array",
                        items: { type: "string" },
                        description: "Key topics discussed"
                      }
                    }
                  }
                },
                required: ["response"]
              }
            }
          : { type: "text" }
      });
      toast({
        title: "Success",
        description: `Smart responses ${checked ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling smart responses:', error);
      toast({
        title: "Error",
        description: "Failed to update smart responses settings",
        variant: "destructive",
      });
    }
  };

  const handleGlobalMemoryToggle = (checked: boolean) => {
    try {
      onBotChange({ memory_enabled_model: checked });
      toast({
        title: "Success",
        description: `Global memory ${checked ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling global memory:', error);
      toast({
        title: "Error",
        description: "Failed to update global memory settings",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Smart Responses</Label>
            <p className="text-sm text-muted-foreground">
              Enable AI-powered response formatting and context awareness
            </p>
          </div>
          <Switch
            checked={bot.response_format?.type === "json_object"}
            onCheckedChange={handleSmartResponsesToggle}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Global Memory</Label>
            <p className="text-sm text-muted-foreground">
              Share memory and context across all bots
            </p>
          </div>
          <Switch
            checked={bot.memory_enabled_model}
            onCheckedChange={handleGlobalMemoryToggle}
          />
        </div>
      </div>
    </Card>
  );
};