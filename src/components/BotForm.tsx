import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot } from "@/hooks/useBots";
import { ModelSelector } from "./bot/ModelSelector";
import { StartersInput } from "./bot/StartersInput";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { updateBotAndSharedConfig, updateBotMemorySettings } from "@/utils/botUtils";
import { BotBasicInfo } from "./bot/BotBasicInfo";
import { BotPublishToggle } from "./bot/BotPublishToggle";
import { BotApiSettings } from "./bot/BotApiSettings";
import { ScrollArea } from "./ui/scroll-area";
import { BotSubscriptionSettings } from "./bot/BotSubscriptionSettings";
import { QuizModeSettings } from "./bot/quiz/QuizModeSettings";
import { supabase } from "@/integrations/supabase/client";

interface BotFormProps {
  bot: Bot;
  onSave: (bot: Bot) => void;
  onCancel: () => void;
}

export const BotForm = ({ bot, onSave, onCancel }: BotFormProps) => {
  const [editingBot, setEditingBot] = useState<Bot>({
    ...bot,
    memory_enabled: bot.memory_enabled ?? false,
    published: bot.published ?? false
  });
  const { toast } = useToast();

  // Update editingBot when bot prop changes
  useEffect(() => {
    setEditingBot(prev => ({
      ...prev,
      ...bot,
      memory_enabled: bot.memory_enabled ?? false,
      published: bot.published ?? false
    }));
  }, [bot]);

  const handleBotChange = (updates: Partial<Bot>) => {
    setEditingBot(prev => ({ ...prev, ...updates }));
  };

  const handleModelChange = (model: Bot['model']) => {
    handleBotChange({ model });
  };

  const handleMemoryToggle = async (checked: boolean) => {
    if (!editingBot.id) {
      handleBotChange({ memory_enabled: checked });
      return;
    }

    try {
      await updateBotMemorySettings(editingBot.id, checked);
      handleBotChange({ memory_enabled: checked });
      toast({
        title: "Success",
        description: "Memory settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating memory settings:", error);
      toast({
        title: "Error",
        description: "Failed to update memory settings",
        variant: "destructive",
      });
    }
  };

  const handlePublishToggle = async (checked: boolean) => {
    handleBotChange({ published: checked });
  };

  const handleSave = async () => {
    try {
      if (!editingBot.id) {
        onSave(editingBot);
        return;
      }

      await updateBotAndSharedConfig(editingBot);
      onSave(editingBot);
      toast({
        title: "Success",
        description: "Bot updated successfully",
      });
    } catch (error) {
      console.error("Error updating bot:", error);
      toast({
        title: "Error",
        description: "Failed to update bot",
        variant: "destructive",
      });
    }
  };

  const handleQuizModeChange = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('quiz_configurations')
        .upsert({
          bot_id: editingBot.id,
          enabled: enabled,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Quiz mode ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error("Error updating quiz mode:", error);
      toast({
        title: "Error",
        description: "Failed to update quiz mode",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 px-4 py-8">
        <div className="container max-w-4xl mx-auto space-y-8">
          <div className="grid gap-6">
            <BotBasicInfo bot={editingBot} onBotChange={handleBotChange} />
            
            <BotPublishToggle 
              isPublished={editingBot.published}
              onPublishChange={handlePublishToggle}
            />

            <ModelSelector 
              bot={editingBot}
              onModelChange={handleModelChange}
              onOpenRouterModelChange={(model) => handleBotChange({ openRouterModel: model })}
            />

            <BotApiSettings 
              apiKey={editingBot.apiKey}
              onApiKeyChange={(apiKey) => handleBotChange({ apiKey })}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium">Instructions</label>
              <Textarea
                value={editingBot.instructions}
                onChange={(e) => handleBotChange({ instructions: e.target.value })}
                placeholder="Enter instructions for the bot..."
                rows={4}
                className="w-full resize-y min-h-[100px] dark:bg-[#1e1e1e] dark:border-gray-700"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="memory-mode"
                checked={editingBot.memory_enabled}
                onCheckedChange={handleMemoryToggle}
                className="dark:bg-gray-700 dark:data-[state=checked]:bg-primary"
              />
              <Label htmlFor="memory-mode">Enable Memory Mode</Label>
            </div>

            <StartersInput 
              starters={editingBot.starters}
              onStartersChange={(starters) => handleBotChange({ starters })}
            />

            {editingBot.id && (
              <>
                <BotSubscriptionSettings botId={editingBot.id} />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Quiz Mode</h3>
                  <QuizModeSettings
                    botId={editingBot.id}
                    enabled={false}
                    onEnableChange={handleQuizModeChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 w-full bg-background border-t p-4">
        <div className="container max-w-4xl mx-auto flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
};
