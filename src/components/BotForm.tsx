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

interface BotFormProps {
  bot: Bot;
  onSave: (bot: Bot) => void;
  onCancel: () => void;
}

export const BotForm = ({ bot, onSave, onCancel }: BotFormProps) => {
  const [editingBot, setEditingBot] = useState<Bot>({
    ...bot,
    memory_enabled: bot.memory_enabled ?? false,
    memory_instructions: bot.memory_instructions ?? "",
    memory_model: bot.memory_model ?? "openrouter",
    memory_api_key: bot.memory_api_key ?? ""
  });

  const handleModelChange = (model: "gemini" | "claude" | "openai" | "openrouter") => {
    setEditingBot({ 
      ...editingBot, 
      model: model,
      openRouterModel: model === "openrouter" ? editingBot.openRouterModel : undefined 
    });
  };

  const handleMemoryModelChange = (model: "gemini" | "claude" | "openai" | "openrouter") => {
    setEditingBot({ 
      ...editingBot, 
      memory_model: model
    });
  };

  const handleSave = () => {
    onSave({
      ...editingBot,
      memory_enabled: editingBot.memory_enabled ?? false,
      memory_instructions: editingBot.memory_enabled ? editingBot.memory_instructions : "",
      memory_model: editingBot.memory_enabled ? editingBot.memory_model : "openrouter",
      memory_api_key: editingBot.memory_enabled ? editingBot.memory_api_key : ""
    });
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
          onCheckedChange={(checked) => setEditingBot({ ...editingBot, memory_enabled: checked })}
        />
        <Label htmlFor="memory-mode">Enable Memory Mode</Label>
      </div>

      {editingBot.memory_enabled && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Memory Instructions</label>
            <Textarea
              value={editingBot.memory_instructions}
              onChange={(e) => setEditingBot({ ...editingBot, memory_instructions: e.target.value })}
              placeholder="Enter memory instructions..."
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Memory Model</label>
            <ModelSelector 
              bot={{ ...editingBot, model: editingBot.memory_model }}
              onModelChange={handleMemoryModelChange}
              onOpenRouterModelChange={(model) => setEditingBot({ ...editingBot, memory_model: model })}
              isMemorySelector
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Memory API Key</label>
            <Input
              type="password"
              value={editingBot.memory_api_key}
              onChange={(e) => setEditingBot({ ...editingBot, memory_api_key: e.target.value })}
              placeholder="Enter memory API key"
            />
          </div>
        </>
      )}

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