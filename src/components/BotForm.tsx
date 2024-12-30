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
    // 01.AI Models
    { value: "01.ai/yi-large", label: "01.AI: Yi Large - $3.00/$3.00 - 32k ctx" },

    // Aetherwiing Models
    { value: "aetherwing/starcannon-12b", label: "Aetherwing: Starcannon 12B - $0.80/$1.20 - 16k ctx" },

    // AI21 Models
    { value: "ai21/j1.5-large", label: "AI21: Jamba 1.5 Large - $2.00/$8.00 - 256k ctx" },
    { value: "ai21/j1.5-mini", label: "AI21: Jamba 1.5 Mini - $0.20/$0.40 - 256k ctx" },
    { value: "ai21/j1.5-instruct", label: "AI21: Jamba Instruct - $0.50/$0.70 - 256k ctx" },

    // Airoboros Models
    { value: "airoboros/70b", label: "Airoboros 70B - $0.50/$0.50 - 4k ctx" },

    // Amazon Models
    { value: "amazon/nova-lite-1.0", label: "Amazon: Nova Lite 1.0 - $0.06/$0.24 - 300k ctx" },
    { value: "amazon/nova-micro-1.0", label: "Amazon: Nova Micro 1.0 - $0.04/$0.14 - 128k ctx" },
    { value: "amazon/nova-pro-1.0", label: "Amazon: Nova Pro 1.0 - $0.80/$3.20 - 300k ctx" },

    // Anthropic Models
    { value: "anthropic/claude-3-haiku", label: "Anthropic: Claude 3 Haiku - $0.25/$1.25 - 200k ctx" },
    { value: "anthropic/claude-3-haiku-sm", label: "Anthropic: Claude 3 Haiku (self-moderated) - $0.25/$1.25 - 200k ctx" },
    { value: "anthropic/claude-3-opus", label: "Anthropic: Claude 3 Opus - $15.00/$75.00 - 200k ctx" },
    { value: "anthropic/claude-3-opus-sm", label: "Anthropic: Claude 3 Opus (self-moderated) - $15.00/$75.00 - 200k ctx" },
    { value: "anthropic/claude-3-sonnet", label: "Anthropic: Claude 3 Sonnet - $3.00/$15.00 - 200k ctx" },
    { value: "anthropic/claude-3-sonnet-sm", label: "Anthropic: Claude 3 Sonnet (self-moderated) - $3.00/$15.00 - 200k ctx" },
    { value: "anthropic/claude-3.5-haiku", label: "Anthropic: Claude 3.5 Haiku - $0.80/$4.00 - 200k ctx" },
    { value: "anthropic/claude-3.5-haiku-2024", label: "Anthropic: Claude 3.5 Haiku (2024-10-22) - $0.80/$4.00 - 200k ctx" },
    { value: "anthropic/claude-3.5-haiku-2024-sm", label: "Anthropic: Claude 3.5 Haiku (2024-10-22) (self-moderated) - $0.80/$4.00 - 200k ctx" },
    { value: "anthropic/claude-3.5-sonnet", label: "Anthropic: Claude 3.5 Sonnet - $3.00/$15.00 - 200k ctx" },
    { value: "anthropic/claude-3.5-sonnet-2024", label: "Anthropic: Claude 3.5 Sonnet (2024-06-20) - $3.00/$15.00 - 200k ctx" },
    { value: "anthropic/claude-v2", label: "Anthropic: Claude v2 - $8.00/$24.00 - 200k ctx" },
    { value: "anthropic/claude-v2-sm", label: "Anthropic: Claude v2 (self-moderated) - $8.00/$24.00 - 200k ctx" },
    { value: "anthropic/claude-v2.0", label: "Anthropic: Claude v2.0 - $8.00/$24.00 - 100k ctx" },
    { value: "anthropic/claude-v2.1", label: "Anthropic: Claude v2.1 - $8.00/$24.00 - 200k ctx" },

    // Auto Router
    { value: "auto-router", label: "Auto Router (best for prompt) - Dynamic Pricing - 200k ctx" },

    // Cohere Models
    { value: "cohere/command", label: "Cohere: Command - $0.95/$1.90 - 4k ctx" },
    { value: "cohere/command-r", label: "Cohere: Command R - $0.47/$1.42 - 128k ctx" },
    { value: "cohere/command-r-2024-03", label: "Cohere: Command R (03-2024) - $0.47/$1.42 - 128k ctx" },
    { value: "cohere/command-r-2024-08", label: "Cohere: Command R (08-2024) - $0.14/$0.57 - 128k ctx" },
    { value: "cohere/command-r-plus", label: "Cohere: Command R+ - $2.85/$14.25 - 128k ctx" },
    { value: "cohere/command-r7b", label: "Cohere: Command R7B - $0.04/$0.15 - 128k ctx" },

    // Databricks Models
    { value: "databricks/dbrx-132b", label: "Databricks: DBRX 132B Instruct - $1.08/$1.08 - 32k ctx" },

    // DeepSeek Models
    { value: "deepseek/v2.5", label: "DeepSeek V2.5 - $2.00/$2.00 - 8k ctx" },
    { value: "deepseek/v3", label: "DeepSeek V3 - $0.14/$0.28 - 64k ctx" },

    // Dolphin Models
    { value: "dolphin/mixtral-8x7b", label: "Dolphin 2.6 Mixtral 8x7B - $0.50/$0.50 - 32k ctx" },
    { value: "dolphin/mixtral-8x22b", label: "Dolphin 2.9.2 Mixtral 8x22B - $0.90/$0.90 - 16k ctx" },

    // EVA Models
    { value: "eva/llama-70b", label: "EVA Llama 3.33 70b - $4.00/$6.00 - 16k ctx" },
    { value: "eva/qwen-32b", label: "EVA Qwen2.5 32B - $2.60/$3.40 - 16k ctx" },
    { value: "eva/qwen-72b", label: "EVA Qwen2.5 72B - $4.00/$6.00 - 16k ctx" },

    // Google Models
    { value: "google/gemini-pro", label: "Google: Gemini Pro 1.0 - $0.50/$1.50 - 32k ctx" },
    { value: "google/gemini-pro-1.5", label: "Google: Gemini Pro 1.5 - $1.25/$5.00 - 2000k ctx" },
    { value: "google/palm-2-chat-32k", label: "Google: PaLM 2 Chat 32k - $1.00/$2.00 - 32k ctx" },
    { value: "google/palm-2-codechat-32k", label: "Google: PaLM 2 Code Chat 32k - $1.00/$2.00 - 32k ctx" },

    // Meta Models
    { value: "meta-llama/llama-2-13b-chat", label: "Meta: Llama 2 13B Chat - $0.20/$0.20 - 4k ctx" },
    { value: "meta-llama/llama-2-70b-chat", label: "Meta: Llama 2 70B Chat - $0.70/$0.70 - 4k ctx" },
    { value: "meta-llama/llama-3-70b", label: "Meta: Llama 3.1 70B Instruct - $0.12/$0.30 - 131k ctx" },

    // Microsoft Models
    { value: "microsoft/phi-3", label: "Microsoft: Phi-3 Medium 128K Instruct - $1.00/$1.00 - 128k ctx" },

    // Mistral Models
    { value: "mistral/large", label: "Mistral Large - $2.00/$6.00 - 128k ctx" },
    { value: "mistral/medium", label: "Mistral Medium - $2.75/$8.10 - 32k ctx" },
    { value: "mistral/small", label: "Mistral Small - $0.20/$0.60 - 32k ctx" },
    { value: "mistral/tiny", label: "Mistral Tiny - $0.25/$0.25 - 32k ctx" },
    { value: "mistral/mixtral-8x7b", label: "Mistral: Mixtral 8x7B - $0.24/$0.24 - 32k ctx" },
    { value: "mistral/mistral-7b", label: "Mistral: Mistral 7B Instruct - $0.03/$0.06 - 32k ctx" },

    // Perplexity Models
    { value: "perplexity/pplx-7b", label: "Perplexity: Llama3 Sonar 8B - $0.20/$0.20 - 32k ctx" },
    { value: "perplexity/pplx-70b", label: "Perplexity: Llama3 Sonar 70B - $1.00/$1.00 - 32k ctx" },
    { value: "perplexity/pplx-online", label: "Perplexity: Llama 3.1 Sonar 70B Online - $1.00/$1.00 - 127k ctx" },

    // OpenAI Models
    { value: "openai/gpt-4", label: "OpenAI: GPT-4 - $30.00/$60.00 - 8k ctx" },
    { value: "openai/gpt-4-32k", label: "OpenAI: GPT-4 32k - $60.00/$120.00 - 32k ctx" },
    { value: "openai/gpt-4-turbo", label: "OpenAI: GPT-4 Turbo - $10.00/$30.00 - 128k ctx" },
    { value: "openai/gpt-4o", label: "OpenAI: GPT-4o - $2.50/$10.00 - 128k ctx" },
    { value: "openai/gpt-4o-2024", label: "OpenAI: GPT-4o (2024-05-13) - $5.00/$15.00 - 128k ctx" },

    // Additional Models
    { value: "pygmalion/mythalion-13b", label: "Pygmalion: Mythalion 13B - $0.80/$1.20 - 4k ctx" },
    { value: "qwen/qwen-72b", label: "Qwen 2 72B Instruct - $0.34/$0.39 - 32k ctx" },
    { value: "xai/grok-beta", label: "xAI: Grok Beta - $5.00/$15.00 - 131k ctx" }
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
