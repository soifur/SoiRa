import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bot } from "@/hooks/useBots";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface SmartResponsesSettingsProps {
  bot: Bot;
  onBotChange: (updates: Partial<Bot>) => void;
}

export const SmartResponsesSettings = ({ bot, onBotChange }: SmartResponsesSettingsProps) => {
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
            onCheckedChange={(checked) => {
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
            }}
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
            onCheckedChange={(checked) => {
              onBotChange({ memory_enabled_model: checked });
            }}
          />
        </div>
      </div>
    </Card>
  );
};