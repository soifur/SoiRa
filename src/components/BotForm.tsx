import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Upload, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot } from "@/hooks/useBots";
import { useToast } from "@/components/ui/use-toast";

interface BotFormProps {
  bot: Bot;
  onSave: (bot: Bot) => void;
  onCancel: () => void;
}

export const BotForm = ({ bot, onSave, onCancel }: BotFormProps) => {
  const [editingBot, setEditingBot] = useState<Bot>(bot);
  const [newStarter, setNewStarter] = useState("");
  const { toast } = useToast();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Avatar image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingBot({
          ...editingBot,
          avatar: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

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
    // Anthropic Models (Most strict and safe)
    { value: "anthropic/claude-3-haiku-sm", label: "Anthropic: Claude 3 Haiku (self-moderated) - $0.25/$1.25 - 200k ctx" },
    { value: "anthropic/claude-3-opus-sm", label: "Anthropic: Claude 3 Opus (self-moderated) - $15.00/$75.00 - 200k ctx" },
    { value: "anthropic/claude-3-sonnet-sm", label: "Anthropic: Claude 3 Sonnet (self-moderated) - $3.00/$15.00 - 200k ctx" },
    { value: "anthropic/claude-v2-sm", label: "Anthropic: Claude v2 (self-moderated) - $8.00/$24.00 - 200k ctx" },
    
    // Google Models (With content filtering)
    { value: "google/gemini-pro", label: "Google: Gemini Pro 1.0 - $0.50/$1.50 - 32k ctx" },
    { value: "google/gemini-pro-1.5", label: "Google: Gemini Pro 1.5 - $1.25/$5.00 - 2000k ctx" },
    
    // OpenAI Models (With moderation)
    { value: "openai/gpt-4", label: "OpenAI: GPT-4 - $30.00/$60.00 - 8k ctx" },
    { value: "openai/gpt-4-turbo", label: "OpenAI: GPT-4 Turbo - $10.00/$30.00 - 128k ctx" },
    
    // Mistral Models (With safety measures)
    { value: "mistral/large", label: "Mistral Large - $2.00/$6.00 - 128k ctx" },
    { value: "mistral/medium", label: "Mistral Medium - $2.75/$8.10 - 32k ctx" },
    { value: "mistral/small", label: "Mistral Small - $0.20/$0.60 - 32k ctx" },
    
    // Auto Router (Uses the most appropriate model)
    { value: "auto-router", label: "Auto Router (best for prompt) - Dynamic Pricing - 200k ctx" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {editingBot.avatar ? (
              <img 
                src={editingBot.avatar} 
                alt="Bot avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          <label 
            htmlFor="avatar-upload" 
            className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <Upload className="w-4 h-4 text-primary-foreground" />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input
            value={editingBot.name}
            onChange={(e) => setEditingBot({ ...editingBot, name: e.target.value })}
            placeholder="Bot name"
          />
        </div>
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

      <div className="hidden">
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