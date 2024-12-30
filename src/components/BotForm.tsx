import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot } from "@/hooks/useBots";

interface BotFormProps {
  bot: Bot;
  onSave: (bot: Bot) => void;
  onCancel: () => void;
}

export const BotForm = ({ bot, onSave, onCancel }: BotFormProps) => {
  const [editingBot, setEditingBot] = useState<Bot>(bot);
  const [newStarter, setNewStarter] = useState("");

  const addStarter = () => {
    if (!newStarter.trim()) return;
    setEditingBot({
      ...editingBot,
      starters: [...editingBot.starters, newStarter.trim()],
    });
    setNewStarter("");
  };

  const removeStarter = (index: number) => {
    setEditingBot({
      ...editingBot,
      starters: editingBot.starters.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          value={editingBot.name}
          onChange={(e) => setEditingBot({ ...editingBot, name: e.target.value })}
          placeholder="Bot name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Model</label>
        <Select
          value={editingBot.model}
          onValueChange={(value: "gemini" | "claude" | "openai") =>
            setEditingBot({ ...editingBot, model: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gemini">Google Gemini</SelectItem>
            <SelectItem value="claude">Anthropic Claude</SelectItem>
            <SelectItem value="openai">OpenAI GPT</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
      <div>
        <label className="block text-sm font-medium mb-1">Conversation Starters</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newStarter}
            onChange={(e) => setNewStarter(e.target.value)}
            placeholder="Add a conversation starter"
          />
          <Button onClick={addStarter}>Add</Button>
        </div>
        <div className="space-y-2">
          {editingBot.starters.map((starter, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1">{starter}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeStarter(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(editingBot)}>Save</Button>
      </div>
    </div>
  );
};