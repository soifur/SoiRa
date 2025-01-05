import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";

type LimitType = 'tokens' | 'messages';
type ResetPeriod = 'daily' | 'weekly' | 'monthly' | 'never';

interface SubscriptionSettings {
  units_per_period: number;
  reset_period: ResetPeriod;
  lifetime_max_units?: number;
  limit_type: LimitType;
  user_role: UserRole;
}

interface SubscriptionLimitsFormProps {
  model: string;
  onSettingsChange?: (settings: SubscriptionSettings) => void;
}

export const SubscriptionLimitsForm = ({ model, onSettingsChange }: SubscriptionLimitsFormProps) => {
  const [subscriptionSettings, setSubscriptionSettings] = useState<SubscriptionSettings>({
    units_per_period: 1000,
    reset_period: 'monthly',
    limit_type: 'tokens',
    user_role: 'user'
  });
  
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole>('user');

  useEffect(() => {
    fetchUserRole();
    fetchSubscriptionSettings();
  }, [model]);

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
        .eq('model', model)
        .eq('user_role', profile.role)
        .single();

      if (error) throw error;

      if (data) {
        const newSettings = {
          units_per_period: data.units_per_period,
          reset_period: data.reset_period as ResetPeriod,
          lifetime_max_units: data.lifetime_max_units,
          limit_type: (data.limit_type as LimitType) || 'tokens',
          user_role: data.user_role as UserRole
        };
        setSubscriptionSettings(newSettings);
        onSettingsChange?.(newSettings);
      }
    } catch (error) {
      console.error('Error fetching subscription settings:', error);
    }
  };

  const handleSubscriptionSettingChange = async (updates: Partial<SubscriptionSettings>) => {
    const newSettings = { ...subscriptionSettings, ...updates };
    setSubscriptionSettings(newSettings);
    onSettingsChange?.(newSettings);
    
    try {
      const { error } = await supabase
        .from('model_subscription_settings')
        .upsert({
          model,
          user_role: userRole,
          units_per_period: newSettings.units_per_period,
          reset_period: newSettings.reset_period,
          lifetime_max_units: newSettings.lifetime_max_units,
          limit_type: newSettings.limit_type
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
  );
};