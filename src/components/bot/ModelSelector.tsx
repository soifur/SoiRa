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
    // Anthropic Models
    { value: "anthropic/claude-3-haiku", label: "Claude 3 Haiku - $0.25/$1.25 per 1M tokens - 200k ctx" },
    { value: "anthropic/claude-3-opus", label: "Claude 3 Opus - $15/$75 per 1M tokens - 200k ctx" },
    { value: "anthropic/claude-3-sonnet", label: "Claude 3 Sonnet - $3/$15 per 1M tokens - 200k ctx" },
    { value: "anthropic/claude-2", label: "Claude 2 - $8/$24 per 1M tokens - 100k ctx" },
    { value: "anthropic/claude-2.1", label: "Claude 2.1 - $8/$24 per 1M tokens - 200k ctx" },
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
    { value: "mistral/mistral-large", label: "Mistral Large - $7/$20 per 1M tokens - 32k ctx" },
    { value: "mistral/mistral-medium", label: "Mistral Medium - $2.75/$8.10 per 1M tokens - 32k ctx" },
    { value: "mistral/mistral-small", label: "Mistral Small - $0.20/$0.60 per 1M tokens - 32k ctx" },
    { value: "mistral/mixtral-8x7b-instruct", label: "Mixtral 8x7B Instruct - $0.20/$0.60 per 1M tokens - 32k ctx" },
    
    // Meta Models
    { value: "meta/llama-2-70b-chat", label: "Llama 2 70B Chat - $1/$1.50 per 1M tokens - 4k ctx" },
    { value: "meta/llama-2-13b-chat", label: "Llama 2 13B Chat - $0.20/$0.30 per 1M tokens - 4k ctx" },
    { value: "meta/llama-2-7b-chat", label: "Llama 2 7B Chat - $0.10/$0.15 per 1M tokens - 4k ctx" },
    { value: "meta/codellama-34b-instruct", label: "Code Llama 34B Instruct - $0.50/$0.75 per 1M tokens - 8k ctx" },
    
    // Cohere Models
    { value: "cohere/command", label: "Command - $1.50/$2 per 1M tokens - 4k ctx" },
    { value: "cohere/command-light", label: "Command Light - $0.30/$0.60 per 1M tokens - 4k ctx" },
    { value: "cohere/command-nightly", label: "Command Nightly - $2/$3 per 1M tokens - 4k ctx" },
    
    // Open Source Models
    { value: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo", label: "Nous Hermes 2 Mixtral - $0.30/$0.35 per 1M tokens - 32k ctx" },
    { value: "nousresearch/nous-hermes-2-vision-7b", label: "Nous Hermes 2 Vision - $0.15/$0.20 per 1M tokens - 4k ctx" },
    
    // Auto Router
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