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

  const openRouterModels = [
    // GPT-4 Models
    { value: "openai/gpt-4-turbo-preview", label: "GPT-4 Turbo" },
    { value: "openai/gpt-4-1106-preview", label: "GPT-4 1106 Preview" },
    { value: "openai/gpt-4", label: "GPT-4" },
    
    // Claude Models
    { value: "anthropic/claude-3-opus", label: "Claude 3 Opus" },
    { value: "anthropic/claude-3-sonnet", label: "Claude 3 Sonnet" },
    { value: "anthropic/claude-2", label: "Claude 2" },
    { value: "anthropic/claude-2.1", label: "Claude 2.1" },
    { value: "anthropic/claude-instant-1.2", label: "Claude Instant 1.2" },
    
    // Mistral Models
    { value: "mistral/mistral-tiny", label: "Mistral Tiny" },
    { value: "mistral/mistral-small", label: "Mistral Small" },
    { value: "mistral/mistral-medium", label: "Mistral Medium" },
    { value: "mistral/mistral-large", label: "Mistral Large" },
    
    // Google Models
    { value: "google/gemini-pro", label: "Gemini Pro" },
    { value: "google/palm-2", label: "PaLM 2" },
    
    // Meta Models
    { value: "meta-llama/llama-2-13b-chat", label: "Llama 2 13B" },
    { value: "meta-llama/llama-2-70b-chat", label: "Llama 2 70B" },
    
    // Other Models
    { value: "perplexity/pplx-7b-chat", label: "PPLX 7B" },
    { value: "perplexity/pplx-70b-chat", label: "PPLX 70B" },
    { value: "cohere/command-r", label: "Cohere Command R" },
  ];

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
          onValueChange={(value: "gemini" | "claude" | "openai" | "openrouter") =>
            setEditingBot({ 
              ...editingBot, 
              model: value,
              openRouterModel: value === "openrouter" ? editingBot.openRouterModel : undefined 
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gemini">Google Gemini</SelectItem>
            <SelectItem value="claude">Anthropic Claude</SelectItem>
            <SelectItem value="openai">OpenAI GPT</SelectItem>
            <SelectItem value="openrouter">OpenRouter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {editingBot.model === "openrouter" && (
        <div>
          <label className="block text-sm font-medium mb-1">OpenRouter Model</label>
          <Select
            value={editingBot.openRouterModel}
            onValueChange={(value: string) =>
              setEditingBot({ ...editingBot, openRouterModel: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an OpenRouter model" />
            </SelectTrigger>
            <SelectContent>
              {openRouterModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
