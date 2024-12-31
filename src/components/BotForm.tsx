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
    // Anthropic Models (Most advanced and reliable)
    { value: "anthropic/claude-3-haiku", label: "Claude 3 Haiku - $0.25/$1.25 per 1M tokens - 200k ctx" },
    { value: "anthropic/claude-3-opus", label: "Claude 3 Opus - $15/$75 per 1M tokens - 200k ctx" },
    { value: "anthropic/claude-3-sonnet", label: "Claude 3 Sonnet - $3/$15 per 1M tokens - 200k ctx" },
    { value: "anthropic/claude-2", label: "Claude 2 - $8/$24 per 1M tokens - 100k ctx" },
    { value: "anthropic/claude-instant-1", label: "Claude Instant 1.2 - $0.80/$2.40 per 1M tokens - 100k ctx" },
    
    // Google Models
    { value: "google/gemini-pro", label: "Gemini Pro - $0.50/$1.50 per 1M tokens - 32k ctx" },
    { value: "google/gemini-pro-vision", label: "Gemini Pro Vision - $0.50/$1.50 per 1M tokens - 32k ctx" },
    { value: "google/palm-2-chat-bison", label: "PaLM 2 Chat - $0.50/$0.50 per 1M tokens - 8k ctx" },
    { value: "google/palm-2-codechat-bison", label: "PaLM 2 Code Chat - $0.50/$0.50 per 1M tokens - 8k ctx" },
    
    // OpenAI Models
    { value: "openai/gpt-4-turbo-preview", label: "GPT-4 Turbo Preview - $10/$30 per 1M tokens - 128k ctx" },
    { value: "openai/gpt-4-vision-preview", label: "GPT-4 Vision Preview - $10/$30 per 1M tokens - 128k ctx" },
    { value: "openai/gpt-4", label: "GPT-4 - $30/$60 per 1M tokens - 8k ctx" },
    { value: "openai/gpt-3.5-turbo", label: "GPT-3.5 Turbo - $0.50/$1.50 per 1M tokens - 16k ctx" },
    { value: "openai/gpt-3.5-turbo-16k", label: "GPT-3.5 Turbo 16k - $1/$2 per 1M tokens - 16k ctx" },
    
    // Mistral Models
    { value: "mistral/mistral-large-latest", label: "Mistral Large - $7/$20 per 1M tokens - 32k ctx" },
    { value: "mistral/mistral-medium-latest", label: "Mistral Medium - $2.75/$8.10 per 1M tokens - 32k ctx" },
    { value: "mistral/mistral-small-latest", label: "Mistral Small - $0.20/$0.60 per 1M tokens - 32k ctx" },
    
    // Meta Models
    { value: "meta/llama-2-70b-chat", label: "Llama 2 70B Chat - $1/$1.50 per 1M tokens - 4k ctx" },
    { value: "meta/llama-2-13b-chat", label: "Llama 2 13B Chat - $0.20/$0.30 per 1M tokens - 4k ctx" },
    { value: "meta/llama-2-7b-chat", label: "Llama 2 7B Chat - $0.10/$0.15 per 1M tokens - 4k ctx" },
    
    // Anthropic Legacy Models
    { value: "anthropic/claude-2.1", label: "Claude 2.1 - $8/$24 per 1M tokens - 200k ctx" },
    { value: "anthropic/claude-2.0", label: "Claude 2.0 - $8/$24 per 1M tokens - 100k ctx" },
    { value: "anthropic/claude-1.3", label: "Claude 1.3 - $8/$24 per 1M tokens - 100k ctx" },
    
    // Cohere Models
    { value: "cohere/command", label: "Command - $1.50/$2 per 1M tokens - 4k ctx" },
    { value: "cohere/command-light", label: "Command Light - $0.30/$0.60 per 1M tokens - 4k ctx" },
    { value: "cohere/command-nightly", label: "Command Nightly - $2/$3 per 1M tokens - 4k ctx" },
    
    // Open Source Models
    { value: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo", label: "Nous Hermes 2 Mixtral - $0.30/$0.35 per 1M tokens - 32k ctx" },
    { value: "nousresearch/nous-hermes-2-vision-7b", label: "Nous Hermes 2 Vision - $0.15/$0.20 per 1M tokens - 4k ctx" },
    { value: "nousresearch/nous-capybara-7b", label: "Nous Capybara 7B - $0.10/$0.15 per 1M tokens - 4k ctx" },
    
    // Perplexity Models
    { value: "perplexity/pplx-70b-chat", label: "PPLX 70B Chat - $1/$1.50 per 1M tokens - 4k ctx" },
    { value: "perplexity/pplx-7b-chat", label: "PPLX 7B Chat - $0.10/$0.15 per 1M tokens - 4k ctx" },
    { value: "perplexity/pplx-online-70b-chat", label: "PPLX Online 70B Chat - $1.50/$2 per 1M tokens - 4k ctx" },
    
    // Mixtral Models
    { value: "mistral/mixtral-8x7b", label: "Mixtral 8x7B - $0.20/$0.60 per 1M tokens - 32k ctx" },
    { value: "mistral/mixtral-8x7b-instruct", label: "Mixtral 8x7B Instruct - $0.20/$0.60 per 1M tokens - 32k ctx" },
    
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