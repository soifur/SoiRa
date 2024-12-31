import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot } from "@/hooks/useBots";

interface ModelSelectorProps {
  bot: Bot;
  onModelChange: (model: "gemini" | "claude" | "openai" | "openrouter") => void;
  onOpenRouterModelChange: (model: string) => void;
}

export const ModelSelector = ({ bot, onModelChange, onOpenRouterModelChange }: ModelSelectorProps) => {
  const openRouterModels = [
    // Anthropic Models (Latest)
    { value: "anthropic/claude-3-haiku", label: "Claude 3 Haiku - $0.25/$1.25 per 1M tokens - 200k ctx" },
    { value: "anthropic/claude-3-opus", label: "Claude 3 Opus - $15/$75 per 1M tokens - 200k ctx" },
    { value: "anthropic/claude-3-sonnet", label: "Claude 3 Sonnet - $3/$15 per 1M tokens - 200k ctx" },
    
    // Google Models (Latest)
    { value: "google/gemini-pro", label: "Gemini Pro - $0.50/$1.50 per 1M tokens - 32k ctx" },
    { value: "google/gemini-pro-vision", label: "Gemini Pro Vision - $0.50/$1.50 per 1M tokens - 32k ctx" },
    
    // OpenAI Models (Latest)
    { value: "openai/gpt-4-turbo-preview", label: "GPT-4 Turbo Preview - $10/$30 per 1M tokens - 128k ctx" },
    { value: "openai/gpt-4-vision-preview", label: "GPT-4 Vision Preview - $10/$30 per 1M tokens - 128k ctx" },
    { value: "openai/gpt-3.5-turbo", label: "GPT-3.5 Turbo - $0.50/$1.50 per 1M tokens - 16k ctx" },
    
    // Mistral Models (Latest)
    { value: "mistral/mistral-large-latest", label: "Mistral Large Latest - $7/$20 per 1M tokens - 32k ctx" },
    { value: "mistral/mistral-medium-latest", label: "Mistral Medium Latest - $2.75/$8.10 per 1M tokens - 32k ctx" },
    { value: "mistral/mistral-small-latest", label: "Mistral Small Latest - $0.20/$0.60 per 1M tokens - 32k ctx" },
    { value: "mistral/mixtral-8x7b-instruct", label: "Mixtral 8x7B Instruct - $0.20/$0.60 per 1M tokens - 32k ctx" },
    
    // Meta Models (Latest)
    { value: "meta/llama-2-70b-chat", label: "Llama 2 70B Chat - $1/$1.50 per 1M tokens - 4k ctx" },
    { value: "meta/llama-2-13b-chat", label: "Llama 2 13B Chat - $0.20/$0.30 per 1M tokens - 4k ctx" },
    
    // Auto Router (Always keep this as an option)
    { value: "auto", label: "Auto Router (best for prompt) - Dynamic Pricing - 200k ctx" }
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Model</label>
        <Select
          value={bot.model}
          onValueChange={(value: "gemini" | "claude" | "openai" | "openrouter") =>
            onModelChange(value)
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

      {bot.model === "openrouter" && (
        <div>
          <label className="block text-sm font-medium mb-1">OpenRouter Model</label>
          <Select
            value={bot.openRouterModel}
            onValueChange={(value: string) => onOpenRouterModelChange(value)}
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
    </div>
  );
};
