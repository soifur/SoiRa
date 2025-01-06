import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { RoleSubscriptionSettings } from "./subscription/RoleSubscriptionSettings";
import { ModelSubscriptionSetting, UserRole, LimitType, ResetPeriod } from "@/types/subscription";
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
    if (isOpen || botId) {
      fetchSettings();
    }
  }, [isOpen, botId]);

  const fetchSettings = async () => {
    try {
      console.log("Fetching settings for bot:", botId);
      
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .single();

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      console.log("User role:", userProfile.role);

      const { data, error } = await supabase
        .from('model_subscription_settings')
        .select('*')
        .eq('bot_id', botId);

      if (error) {
        console.error('Error fetching settings:', error);
        throw error;
      }

      console.log("Raw settings data:", data);

      // Create default settings for each user role
      const newSettings: ModelSubscriptionSetting[] = USER_ROLES.map(role => {
        const existingSetting = data?.find(s => s.user_role === role);
        if (existingSetting) {
          return {
            ...existingSetting,
            limit_type: (existingSetting.limit_type || 'tokens') as LimitType,
            reset_period: existingSetting.reset_period as ResetPeriod,
            reset_amount: existingSetting.reset_amount || 1,
            units_per_period: existingSetting.units_per_period
          };
        }
        
        return {
          id: crypto.randomUUID(),
          bot_id: botId,
          user_role: role,
          units_per_period: 1000,
          reset_period: 'daily' as ResetPeriod,
          reset_amount: 1,
          limit_type: 'tokens' as LimitType,
          model: '' // Empty string as default
        };
      });

      console.log("Processed settings:", newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription settings",
        variant: "destructive",
      });
    }
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
      console.log("Saving settings:", settings);
      
      // First, delete existing settings for this bot
      const { error: deleteError } = await supabase
        .from('model_subscription_settings')
        .delete()
        .eq('bot_id', botId);

      if (deleteError) throw deleteError;

      // Process settings one by one
      for (const setting of settings) {
        const { error: insertError } = await supabase
          .from('model_subscription_settings')
          .insert({
            id: setting.id,
            bot_id: botId,
            model: setting.model || botId, // Use botId as model if not specified
            units_per_period: setting.units_per_period,
            reset_period: setting.reset_period,
            reset_amount: setting.reset_amount,
            lifetime_max_units: setting.lifetime_max_units,
            limit_type: setting.limit_type,
            user_role: setting.user_role,
          });

        if (insertError) {
          console.error('Error inserting setting:', insertError);
          throw insertError;
        }
      }

      toast({
        title: "Success",
        description: "Subscription settings saved successfully",
      });
      
      // Refresh settings immediately after save
      await fetchSettings();
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