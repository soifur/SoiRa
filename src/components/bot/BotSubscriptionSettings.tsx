import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { RoleSubscriptionSettings } from "./subscription/RoleSubscriptionSettings";
import { ModelSubscriptionSetting, UserRole, LimitType } from "@/types/subscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BotSubscriptionSettingsProps {
  botId: string;
}

const USER_ROLES: UserRole[] = ['super_admin', 'admin', 'paid_user', 'user'];

export const BotSubscriptionSettings = ({ botId }: BotSubscriptionSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ModelSubscriptionSetting[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen, botId]);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('model_subscription_settings')
      .select('*')
      .eq('bot_id', botId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load subscription settings",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have a setting for each user role with proper typing
    const newSettings: ModelSubscriptionSetting[] = USER_ROLES.map(role => {
      const existingSetting = data?.find(s => s.user_role === role);
      if (existingSetting) {
        return {
          ...existingSetting,
          limit_type: (existingSetting.limit_type || 'tokens') as LimitType,
          reset_period: existingSetting.reset_period,
          reset_amount: existingSetting.reset_amount || 1,
          units_per_period: existingSetting.units_per_period
        } as ModelSubscriptionSetting;
      }
      
      return {
        id: crypto.randomUUID(),
        bot_id: botId,
        user_role: role,
        units_per_period: 1000,
        reset_period: 'daily',
        reset_amount: 1,
        limit_type: 'tokens',
      } as ModelSubscriptionSetting;
    });

    setSettings(newSettings);
  };

  const handleSettingsChange = (updatedSetting: ModelSubscriptionSetting) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === updatedSetting.id ? updatedSetting : setting
      )
    );
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('model_subscription_settings')
        .upsert(
          settings.map(setting => ({
            ...setting,
            bot_id: botId,
          }))
        );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save subscription settings",
        variant: "destructive",
      });
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="flex w-full justify-between p-4">
          <span>Subscription Settings</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 px-4">
        {settings.map((setting) => (
          <RoleSubscriptionSettings
            key={setting.id}
            settings={setting}
            onSettingsChange={handleSettingsChange}
            userRole={setting.user_role}
          />
        ))}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};