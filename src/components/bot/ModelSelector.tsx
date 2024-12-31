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
}

interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
}

export const ModelSelector = ({ bot, onModelChange, onOpenRouterModelChange }: ModelSelectorProps) => {
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://openrouter.ai/api/v1/models');
        const data = await response.json();
        
        // Filter and transform the models
        const models = data.data
          .filter((model: OpenRouterModel) => 
            // Only include models that are fully operational
            model.id && model.name && model.pricing
          )
          .map((model: OpenRouterModel) => ({
            id: model.id,
            name: model.name,
            pricing: model.pricing,
            context_length: model.context_length
          }));

        setOpenRouterModels([
          ...models,
          // Always include the auto router option
          {
            id: "auto",
            name: "Auto Router",
            pricing: { prompt: "Dynamic", completion: "Dynamic" },
            context_length: 200000
          }
        ]);
      } catch (error) {
        console.error('Error fetching OpenRouter models:', error);
        // Fallback to a minimal set of reliable models if the API fails
        setOpenRouterModels([
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
          },
          {
            id: "auto",
            name: "Auto Router",
            pricing: { prompt: "Dynamic", completion: "Dynamic" },
            context_length: 200000
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
              <SelectValue placeholder={isLoading ? "Loading models..." : "Select an OpenRouter model"} />
            </SelectTrigger>
            <SelectContent>
              {openRouterModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {`${model.name} - ${model.pricing.prompt}/${model.pricing.completion} per 1M tokens - ${Math.floor(model.context_length/1000)}k ctx`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};