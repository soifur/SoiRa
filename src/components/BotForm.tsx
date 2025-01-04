import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot } from "@/hooks/useBots";
import { ModelSelector } from "./bot/ModelSelector";
import { AvatarUploader } from "./bot/AvatarUploader";
import { StartersInput } from "./bot/StartersInput";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { updateBotAndSharedConfig, updateBotMemorySettings } from "@/utils/botUtils";

interface BotFormProps {
  bot: Bot;
  onSave: (bot: Bot) => void;
  onCancel: () => void;
}

type BotModel = "gemini" | "claude" | "openai" | "openrouter";

export const BotForm = ({ bot, onSave, onCancel }: BotFormProps) => {
  const [editingBot, setEditingBot] = useState<Bot>({
    ...bot,
    memory_enabled: bot.memory_enabled ?? false,
  });
  const { toast } = useToast();

  const handleModelChange = (model: BotModel) => {
    setEditingBot({ 
      ...editingBot, 
      model: model,
      openRouterModel: model === "openrouter" ? editingBot.openRouterModel : undefined 
    });
  };

  const handleMemoryToggle = async (checked: boolean) => {
    try {
      await updateBotMemorySettings(editingBot.id, checked);
      setEditingBot({ ...editingBot, memory_enabled: checked });
      toast({
        title: "Success",
        description: "Memory settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating memory settings:", error);
      toast({
        title: "Error",
        description: "Failed to update memory settings",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      await updateBotAndSharedConfig(editingBot);
      onSave({
        ...editingBot,
        memory_enabled: editingBot.memory_enabled ?? false,
      });
      toast({
        title: "Success",
        description: "Bot updated successfully",
      });
    } catch (error) {
      console.error("Error updating bot:", error);
      toast({
        title: "Error",
        description: "Failed to update bot",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <AvatarUploader 
          avatar={editingBot.avatar}
          botId={editingBot.id}
          onAvatarChange={(avatar) => setEditingBot({ ...editingBot, avatar })}
        />
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input
            value={editingBot.name}
            onChange={(e) => setEditingBot({ ...editingBot, name: e.target.value })}
            placeholder="Bot name"
          />
        </div>
      </div>

      <ModelSelector 
        bot={editingBot}
        onModelChange={handleModelChange}
        onOpenRouterModelChange={(model) => setEditingBot({ ...editingBot, openRouterModel: model })}
      />

      <div>
        <label className="block text-sm font-medium mb-1">API Key</label>
        <Input
          type="password"
          value={editingBot.apiKey}
          onChange={(e) => setEditingBot({ ...editingBot, apiKey: e.target.value })}
          placeholder="Enter your API key"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Instructions</label>
        <Textarea
          value={editingBot.instructions}
          onChange={(e) => setEditingBot({ ...editingBot, instructions: e.target.value })}
          placeholder="Enter instructions for the bot..."
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="memory-mode"
          checked={editingBot.memory_enabled}
          onCheckedChange={handleMemoryToggle}
        />
        <Label htmlFor="memory-mode">Enable Memory Mode</Label>
      </div>

      <StartersInput 
        starters={editingBot.starters}
        onStartersChange={(starters) => setEditingBot({ ...editingBot, starters })}
      />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
};