import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot } from "@/hooks/useBots";
import { ModelSelector } from "./bot/ModelSelector";
import { StartersInput } from "./bot/StartersInput";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { updateBotAndSharedConfig, updateBotMemorySettings, updateQuizConfiguration } from "@/utils/botUtils";
import { BotBasicInfo } from "./bot/BotBasicInfo";
import { BotPublishToggle } from "./bot/BotPublishToggle";
import { BotApiSettings } from "./bot/BotApiSettings";
import { ScrollArea } from "./ui/scroll-area";
import { BotSubscriptionSettings } from "./bot/BotSubscriptionSettings";
import { QuizModeSettings } from "./bot/quiz/QuizModeSettings";
import { supabase } from "@/integrations/supabase/client";
import { Field } from "./bot/quiz/QuizFieldBuilder";
import { BotAdvancedSettings } from "./bot/BotAdvancedSettings";
import { SmartResponsesSettings } from "./bot/SmartResponsesSettings";

interface BotFormProps {
  bot: Bot;
  onSave: (bot: Bot) => void;
  onCancel: () => void;
}

export const BotForm = ({ bot, onSave, onCancel }: BotFormProps) => {
  const [editingBot, setEditingBot] = useState<Bot>(() => ({
    id: bot.id,
    name: bot.name || "",
    instructions: bot.instructions || "",
    starters: bot.starters || [],
    model: bot.model,
    apiKey: bot.apiKey || "",
    openRouterModel: bot.openRouterModel,
    avatar: bot.avatar,
    memory_enabled: bot.memory_enabled,
    published: bot.published,
    memory_enabled_model: bot.memory_enabled_model,
    temperature: bot.temperature,
    top_p: bot.top_p,
    frequency_penalty: bot.frequency_penalty,
    presence_penalty: bot.presence_penalty,
    max_tokens: bot.max_tokens,
    stream: bot.stream,
    system_templates: bot.system_templates || [],
    tool_config: bot.tool_config || [],
    response_format: bot.response_format || { type: "text" },
    accessType: bot.accessType || "private"
  }));
  
  const [quizEnabled, setQuizEnabled] = useState(false);
  const [quizFields, setQuizFields] = useState<Field[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Bot data received in useEffect:", bot);
    console.log("Current editingBot state:", editingBot);
    if (bot.id) {
      setEditingBot(prev => ({
        ...prev,
        id: bot.id,
        name: bot.name || prev.name,
        instructions: bot.instructions || prev.instructions,
        starters: bot.starters || prev.starters,
        model: bot.model,
        apiKey: bot.apiKey || prev.apiKey,
        openRouterModel: bot.openRouterModel,
        avatar: bot.avatar,
        memory_enabled: bot.memory_enabled,
        published: bot.published,
        memory_enabled_model: bot.memory_enabled_model,
        temperature: bot.temperature,
        top_p: bot.top_p,
        frequency_penalty: bot.frequency_penalty,
        presence_penalty: bot.presence_penalty,
        max_tokens: bot.max_tokens,
        stream: bot.stream,
        system_templates: bot.system_templates || prev.system_templates,
        tool_config: bot.tool_config || prev.tool_config,
        response_format: bot.response_format || prev.response_format,
        accessType: bot.accessType || prev.accessType
      }));
      loadQuizConfiguration();
    }
  }, [bot]);

  const loadQuizConfiguration = async () => {
    try {
      const { data: quizConfig, error } = await supabase
        .from('quiz_configurations')
        .select('*')
        .eq('bot_id', bot.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading quiz configuration:', error);
        return;
      }

      if (quizConfig) {
        console.log("Loaded quiz config:", quizConfig);
        setQuizEnabled(quizConfig.enabled);
        
        const { data: quizFields, error: fieldsError } = await supabase
          .from('quiz_fields')
          .select('*')
          .eq('quiz_id', quizConfig.id)
          .order('sequence_number', { ascending: true });

        if (fieldsError) {
          console.error('Error loading quiz fields:', fieldsError);
          return;
        }

        if (quizFields) {
          console.log("Loaded quiz fields:", quizFields);
          setQuizFields(quizFields);
        }
      }
    } catch (error) {
      console.error('Error loading quiz configuration:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz configuration",
        variant: "destructive",
      });
    }
  };

  const handleBotChange = (updates: Partial<Bot>) => {
    console.log("Updating bot with:", updates);
    setEditingBot(prev => {
      const updated = { ...prev, ...updates };
      console.log("New bot state after update:", updated);
      return updated;
    });
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

  const handleQuizModeChange = (enabled: boolean) => {
    setQuizEnabled(enabled);
  };

  const handleQuizFieldsChange = (fields: Field[]) => {
    setQuizFields(fields);
  };

  const handleSave = async () => {
    try {
      console.log("Starting save with editingBot:", editingBot);
      
      if (!editingBot.id) {
        console.log("Creating new bot");
        onSave(editingBot);
        return;
      }

      console.log("Updating existing bot");
      await updateBotAndSharedConfig(editingBot);
      
      await updateQuizConfiguration(editingBot.id, quizEnabled, quizFields);

      console.log("Save completed successfully");
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

            <SmartResponsesSettings 
              bot={editingBot}
              onBotChange={handleBotChange}
            />

            <div className="flex items-center space-x-2">
              <Switch
                id="memory-mode"
                checked={editingBot.memory_enabled}
                onCheckedChange={handleMemoryToggle}
                className="dark:bg-gray-700 dark:data-[state=checked]:bg-primary"
              />
              <Label htmlFor="memory-mode">Enable Memory Mode</Label>
            </div>

            <BotAdvancedSettings 
              bot={editingBot}
              onBotChange={handleBotChange}
            />

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
                    enabled={quizEnabled}
                    fields={quizFields}
                    onEnableChange={handleQuizModeChange}
                    onFieldsChange={handleQuizFieldsChange}
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
