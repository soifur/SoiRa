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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { supabase } from "@/integrations/supabase/client";

interface BotFormProps {
  bot: Bot;
  onSave: (bot: Bot) => void;
  onCancel: () => void;
}

type LimitType = 'tokens' | 'messages';
type ResetPeriod = 'daily' | 'weekly' | 'monthly' | 'never';

interface SubscriptionSettings {
  units_per_period: number;
  reset_period: ResetPeriod;
  lifetime_max_units?: number;
  limit_type: LimitType;
  user_role?: string;
}

export const BotForm = ({ bot, onSave, onCancel }: BotFormProps) => {
  const [editingBot, setEditingBot] = useState<Bot>({
    ...bot,
    memory_enabled: bot.memory_enabled ?? false,
    published: bot.published ?? false
  });
  
  const [subscriptionSettings, setSubscriptionSettings] = useState<SubscriptionSettings>({
    units_per_period: 1000,
    reset_period: 'monthly',
    limit_type: 'tokens'
  });
  
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    fetchUserRole();
    fetchSubscriptionSettings();
  }, [editingBot.model]);

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchSubscriptionSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('model_subscription_settings')
        .select('*')
        .eq('model', editingBot.model)
        .eq('user_role', profile.role)
        .single();

      if (error) throw error;

      if (data) {
        setSubscriptionSettings({
          units_per_period: data.units_per_period,
          reset_period: data.reset_period as ResetPeriod,
          lifetime_max_units: data.lifetime_max_units,
          limit_type: (data.limit_type as LimitType) || 'tokens',
          user_role: data.user_role
        });
      }
    } catch (error) {
      console.error('Error fetching subscription settings:', error);
    }
  };

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

  const handleSubscriptionSettingChange = async (updates: Partial<SubscriptionSettings>) => {
    const newSettings = { ...subscriptionSettings, ...updates };
    setSubscriptionSettings(newSettings);
    
    try {
      const { error } = await supabase
        .from('model_subscription_settings')
        .upsert({
          model: editingBot.model,
          user_role: userRole,
          ...newSettings
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating subscription settings:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription settings",
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

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Subscription Settings</h3>
              
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Limit Type</Label>
                  <Select
                    value={subscriptionSettings.limit_type}
                    onValueChange={(value: LimitType) => handleSubscriptionSettingChange({ limit_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tokens">Tokens</SelectItem>
                      <SelectItem value="messages">Messages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Units per Period</Label>
                  <Input
                    type="number"
                    value={subscriptionSettings.units_per_period}
                    onChange={(e) => handleSubscriptionSettingChange({ 
                      units_per_period: parseInt(e.target.value) 
                    })}
                    className="dark:bg-[#1e1e1e] dark:border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reset Period</Label>
                  <Select
                    value={subscriptionSettings.reset_period}
                    onValueChange={(value: ResetPeriod) => handleSubscriptionSettingChange({ reset_period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Lifetime Maximum Units (Optional)</Label>
                  <Input
                    type="number"
                    value={subscriptionSettings.lifetime_max_units || ''}
                    onChange={(e) => handleSubscriptionSettingChange({ 
                      lifetime_max_units: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="No limit"
                    className="dark:bg-[#1e1e1e] dark:border-gray-700"
                  />
                </div>
              </div>
            </div>

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
