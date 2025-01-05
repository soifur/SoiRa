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
  const [subscriptionSettings, setSubscriptionSettings] = useState<Record<UserRole, SubscriptionSettings>>({
    user: {
      units_per_period: 1000,
      reset_period: 'monthly',
      limit_type: 'tokens',
      user_role: 'user'
    },
    paid_user: {
      units_per_period: 10000,
      reset_period: 'monthly',
      limit_type: 'tokens',
      user_role: 'paid_user'
    },
    admin: {
      units_per_period: 100000,
      reset_period: 'monthly',
      limit_type: 'tokens',
      user_role: 'admin'
    },
    super_admin: {
      units_per_period: -1, // unlimited
      reset_period: 'never',
      limit_type: 'tokens',
      user_role: 'super_admin'
    }
  });
  
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');

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
        setSelectedRole(profile.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchSubscriptionSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('model_subscription_settings')
        .select('*')
        .eq('model', model);

      if (error) throw error;

      if (data) {
        const newSettings = { ...subscriptionSettings };
        data.forEach(setting => {
          newSettings[setting.user_role] = {
            units_per_period: setting.units_per_period,
            reset_period: setting.reset_period as ResetPeriod,
            lifetime_max_units: setting.lifetime_max_units,
            limit_type: (setting.limit_type as LimitType) || 'tokens',
            user_role: setting.user_role as UserRole
          };
        });
        setSubscriptionSettings(newSettings);
      }
    } catch (error) {
      console.error('Error fetching subscription settings:', error);
    }
  };

  const handleSubscriptionSettingChange = async (updates: Partial<SubscriptionSettings>) => {
    const currentSettings = subscriptionSettings[selectedRole];
    const newSettings = { ...currentSettings, ...updates };
    setSubscriptionSettings(prev => ({
      ...prev,
      [selectedRole]: newSettings
    }));
    
    try {
      const { error } = await supabase
        .from('model_subscription_settings')
        .upsert({
          model,
          user_role: selectedRole,
          units_per_period: newSettings.units_per_period,
          reset_period: newSettings.reset_period,
          lifetime_max_units: newSettings.lifetime_max_units,
          limit_type: newSettings.limit_type
        });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Subscription settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating subscription settings:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription settings",
        variant: "destructive",
      });
    }
  };

  // Only super_admin can modify settings
  const canModifySettings = userRole === 'super_admin';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Subscription Settings</h3>
      
      {canModifySettings && (
        <div className="space-y-2">
          <Label>Select Role to Configure</Label>
          <Select
            value={selectedRole}
            onValueChange={(value: UserRole) => setSelectedRole(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Regular User</SelectItem>
              <SelectItem value="paid_user">Paid User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Limit Type</Label>
          <Select
            value={subscriptionSettings[selectedRole].limit_type}
            onValueChange={(value: LimitType) => handleSubscriptionSettingChange({ limit_type: value })}
            disabled={!canModifySettings}
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
            value={subscriptionSettings[selectedRole].units_per_period}
            onChange={(e) => handleSubscriptionSettingChange({ 
              units_per_period: parseInt(e.target.value) 
            })}
            disabled={!canModifySettings}
            className="dark:bg-[#1e1e1e] dark:border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label>Reset Period</Label>
          <Select
            value={subscriptionSettings[selectedRole].reset_period}
            onValueChange={(value: ResetPeriod) => handleSubscriptionSettingChange({ reset_period: value })}
            disabled={!canModifySettings}
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
            value={subscriptionSettings[selectedRole].lifetime_max_units || ''}
            onChange={(e) => handleSubscriptionSettingChange({ 
              lifetime_max_units: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            placeholder="No limit"
            disabled={!canModifySettings}
            className="dark:bg-[#1e1e1e] dark:border-gray-700"
          />
        </div>
      </div>

      {!canModifySettings && (
        <p className="text-sm text-muted-foreground mt-4">
          Only super admins can modify subscription settings. Current limits for your role ({userRole}):
          {subscriptionSettings[userRole].units_per_period === -1 ? (
            " Unlimited usage"
          ) : (
            ` ${subscriptionSettings[userRole].units_per_period} ${subscriptionSettings[userRole].limit_type} per ${subscriptionSettings[userRole].reset_period} period`
          )}
        </p>
      )}
    </div>
  );
};