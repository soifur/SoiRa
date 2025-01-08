import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OpenRouterModel {
  id: string;
  name: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled = false }: ModelSelectorProps) {
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOpenRouterModels = async () => {
      try {
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
            context_length: model.context_length,
            pricing: {
              prompt: model.pricing?.prompt,
              completion: model.pricing?.completion,
            },
          }))
          .sort((a: OpenRouterModel, b: OpenRouterModel) => 
            a.name.localeCompare(b.name)
          );

        setOpenRouterModels([
          {
            id: "auto",
            name: "Auto (Recommended)",
            context_length: 0,
            pricing: { prompt: "varies", completion: "varies" },
          },
          ...models,
        ]);
      } catch (error) {
        console.error('Error fetching OpenRouter models:', error);
        setOpenRouterModels([
          {
            id: "auto",
            name: "Auto (Recommended)",
            context_length: 0,
            pricing: { prompt: "varies", completion: "varies" },
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpenRouterModels();
  }, []);

  return (
    <div className="grid gap-2">
      <Select
        value={value}
        onValueChange={onChange}
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
  );
}