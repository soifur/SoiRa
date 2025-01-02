import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ModelSelector } from "@/components/bot/ModelSelector";
import { StartersInput } from "@/components/bot/StartersInput";
import { AvatarUploader } from "@/components/bot/AvatarUploader";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Bot {
  id: string;
  name: string;
  instructions: string;
  model: "gemini" | "claude" | "openai" | "openrouter";
  apiKey: string;
  openRouterModel?: string;
  starters: string[];
  avatar?: string;
  accessType?: "public" | "private";
  memoryEnabled?: boolean;
}

interface BotFormProps {
  bot: Bot;
  onSave: (bot: Bot) => void;
  onCancel: () => void;
}

export const BotForm = ({ bot, onSave, onCancel }: BotFormProps) => {
  const [name, setName] = useState(bot.name);
  const [instructions, setInstructions] = useState(bot.instructions);
  const [model, setModel] = useState<"gemini" | "claude" | "openai" | "openrouter">(bot.model);
  const [apiKey, setApiKey] = useState(bot.apiKey);
  const [openRouterModel, setOpenRouterModel] = useState(bot.openRouterModel);
  const [starters, setStarters] = useState<string[]>(bot.starters || []);
  const [avatar, setAvatar] = useState<string | undefined>(bot.avatar);
  const [memoryEnabled, setMemoryEnabled] = useState<boolean>(bot.memoryEnabled || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...bot,
      name,
      instructions,
      model,
      apiKey,
      openRouterModel,
      starters,
      avatar,
      memoryEnabled,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter bot name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Instructions</label>
        <Textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Enter instructions for the bot..."
          rows={4}
        />
      </div>

      <ModelSelector
        bot={{
          id: bot.id,
          name,
          instructions,
          model,
          apiKey,
          openRouterModel,
          starters,
          avatar,
          memoryEnabled,
          accessType: bot.accessType || "private"
        }}
        onModelChange={setModel}
        onOpenRouterModelChange={setOpenRouterModel}
      />

      <div>
        <label className="block text-sm font-medium mb-1">API Key</label>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          required
        />
      </div>

      <StartersInput
        starters={starters}
        onStartersChange={setStarters}
      />

      <AvatarUploader
        avatar={avatar}
        onAvatarChange={setAvatar}
      />

      <div className="flex items-center space-x-2">
        <Switch
          id="memory-enabled"
          checked={memoryEnabled}
          onCheckedChange={setMemoryEnabled}
        />
        <Label htmlFor="memory-enabled">Enable Memory</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};