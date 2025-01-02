import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot } from "@/hooks/useBots";
import { ModelSelector } from "./bot/ModelSelector";
import { AvatarUploader } from "./bot/AvatarUploader";
import { StartersInput } from "./bot/StartersInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizConfigurationForm } from "./quiz/QuizConfigurationForm";
import { QuizList } from "./quiz/QuizList";
import { useQuizConfigurations } from "@/hooks/useQuizConfigurations";

interface BotFormProps {
  bot: Bot;
  onSave: (bot: Bot) => void;
  onCancel: () => void;
}

export const BotForm = ({ bot, onSave, onCancel }: BotFormProps) => {
  const [editingBot, setEditingBot] = useState<Bot>(bot);
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const { configurations, isLoading, saveConfiguration, deleteConfiguration } = useQuizConfigurations(bot.id);

  const handleModelChange = (model: "gemini" | "claude" | "openai" | "openrouter") => {
    setEditingBot({ 
      ...editingBot, 
      model: model,
      openRouterModel: model === "openrouter" ? editingBot.openRouterModel : undefined 
    });
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="flex items-center gap-4">
            <AvatarUploader 
              avatar={editingBot.avatar}
              botId={editingBot.id}
              onAvatarChange={(avatar) => setEditingBot({ ...editingBot, avatar })}
            />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={editingBot.name}
                onChange={(e) => setEditingBot({ ...editingBot, name: e.target.value })}
                placeholder="Bot name"
              />
            </div>
          </div>

          <ModelSelector 
            bot={editingBot}
            onModelChange={handleModelChange}
            onOpenRouterModelChange={(model) => setEditingBot({ ...editingBot, openRouterModel: model })}
          />

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

          <StartersInput 
            starters={editingBot.starters}
            onStartersChange={(starters) => setEditingBot({ ...editingBot, starters })}
          />
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          {isAddingQuiz ? (
            <QuizConfigurationForm
              botId={bot.id}
              onSave={async (config) => {
                await saveConfiguration(config);
                setIsAddingQuiz(false);
              }}
              onCancel={() => setIsAddingQuiz(false)}
            />
          ) : (
            <>
              <Button onClick={() => setIsAddingQuiz(true)}>
                Add Quiz
              </Button>
              <QuizList
                configurations={configurations}
                isLoading={isLoading}
                onDelete={deleteConfiguration}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(editingBot)}>Save</Button>
      </div>
    </div>
  );
};