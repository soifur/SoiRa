import React, { useEffect, useState } from "react";
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
  isMemorySelector?: boolean;
  disabled?: boolean;
}

interface OpenRouterModel {
  id: string;
  name: string;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
  context_length?: number;
}

export const ModelSelector = ({ 
  bot, 
  onModelChange, 
  onOpenRouterModelChange, 
  isMemorySelector = false,
  disabled = false 
}: ModelSelectorProps) => {
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://openrouter.ai/api/v1/models');
        const data = await response.json();
        
        const models = (data.data || [])
          .filter((model: OpenRouterModel) => 
            model?.id && 
            model?.name && 
            typeof model?.pricing === 'object'
          )
          .map((model: OpenRouterModel) => ({
            id: model.id,
            name: model.name,
            pricing: {
              prompt: model.pricing?.prompt || "N/A",
              completion: model.pricing?.completion || "N/A"
            },
            context_length: model.context_length || 0
          }))
          .sort((a: OpenRouterModel, b: OpenRouterModel) => 
            a.name.localeCompare(b.name)
          );

        setOpenRouterModels([
          {
            id: "auto",
            name: "Auto Router",
            pricing: { prompt: "Dynamic", completion: "Dynamic" },
            context_length: 200000
          },
          ...models
        ]);
      } catch (error) {
        console.error('Error fetching OpenRouter models:', error);
        setOpenRouterModels([
          {
            id: "auto",
            name: "Auto Router",
            pricing: { prompt: "Dynamic", completion: "Dynamic" },
            context_length: 200000
          },
          {
            id: "anthropic/claude-3-opus",
            name: "Claude 3 Opus",
            pricing: { prompt: "$15", completion: "$75" },
            context_length: 200000
          },
          {
            id: "openai/gpt-4-turbo-preview",
            name: "GPT-4 Turbo Preview",
            pricing: { prompt: "$10", completion: "$30" },
            context_length: 128000
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          {isMemorySelector ? "Memory Model" : "Model"}
        </label>
        <Select
          value={bot.model}
          onValueChange={(value: "gemini" | "claude" | "openai" | "openrouter") =>
            onModelChange(value)
          }
          disabled={disabled}
        >
          <SelectTrigger className={disabled ? "opacity-50 cursor-not-allowed" : ""}>
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
          <label className="block text-sm font-medium mb-1">
            {isMemorySelector ? "OpenRouter Memory Model" : "OpenRouter Model"}
          </label>
          <Select
            value={bot.openRouterModel}
            onValueChange={(value: string) => onOpenRouterModelChange(value)}
            disabled={disabled}
          >
            <SelectTrigger className={disabled ? "opacity-50 cursor-not-allowed" : ""}>
              <SelectValue placeholder={isLoading ? "Loading models..." : "Select an OpenRouter model"} />
            </SelectTrigger>
            <SelectContent>
              {openRouterModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {`${model.name} - ${model.pricing?.prompt || 'N/A'}/${model.pricing?.completion || 'N/A'} per 1M tokens - ${Math.floor((model.context_length || 0)/1000)}k ctx`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};