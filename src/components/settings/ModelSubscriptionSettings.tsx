import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ModelSubscriptionSetting, LimitType, ResetPeriod, UserRole } from "@/types/subscription";

export const ModelSubscriptionSettings = () => {
  const [settings, setSettings] = useState<ModelSubscriptionSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('model_subscription_settings')
        .select('*')
        .order('model');

      if (error) throw error;
      
      // Ensure limit_type is properly typed
      const typedData = data?.map(setting => ({
        ...setting,
        limit_type: setting.limit_type as LimitType
      })) || [];
      
      setSettings(typedData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (setting: ModelSubscriptionSetting) => {
    try {
      const { error } = await supabase
        .from('model_subscription_settings')
        .upsert({
          id: setting.id,
          model: setting.model || '',
          units_per_period: setting.units_per_period,
          reset_period: setting.reset_period,
          reset_amount: setting.reset_amount,
          lifetime_max_units: setting.lifetime_max_units,
          limit_type: setting.limit_type,
          user_role: setting.user_role,
          bot_id: setting.bot_id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
      
      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const addNewSetting = () => {
    const newSetting: ModelSubscriptionSetting = {
      id: crypto.randomUUID(),
      model: '',
      units_per_period: 1000,
      reset_period: 'monthly',
      reset_amount: 1,
      limit_type: 'tokens',
      user_role: 'user',
    };
    setSettings([...settings, newSetting]);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Model Subscription Settings</h2>
        <Button onClick={addNewSetting}>Add New Model</Button>
      </div>
      
      <div className="grid gap-4">
        {settings.map((setting) => (
          <Card key={setting.id} className="p-4">
            <div className="grid gap-4">
              <div>
                <Label>Model</Label>
                <Input
                  value={setting.model || ''}
                  onChange={(e) => {
                    const updated = settings.map((s) =>
                      s.id === setting.id ? { ...s, model: e.target.value } : s
                    );
                    setSettings(updated);
                  }}
                  placeholder="e.g., gpt-4, claude-3"
                />
              </div>

              <div>
                <Label>Units per Period</Label>
                <Input
                  type="number"
                  value={setting.units_per_period}
                  onChange={(e) => {
                    const updated = settings.map((s) =>
                      s.id === setting.id ? { ...s, units_per_period: parseInt(e.target.value) } : s
                    );
                    setSettings(updated);
                  }}
                />
              </div>

              <div>
                <Label>Reset Period</Label>
                <Select
                  value={setting.reset_period}
                  onValueChange={(value: ResetPeriod) => {
                    const updated = settings.map((s) =>
                      s.id === setting.id ? { ...s, reset_period: value } : s
                    );
                    setSettings(updated);
                  }}
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

              <div>
                <Label>Reset Amount</Label>
                <Input
                  type="number"
                  value={setting.reset_amount}
                  onChange={(e) => {
                    const updated = settings.map((s) =>
                      s.id === setting.id ? { ...s, reset_amount: parseInt(e.target.value) } : s
                    );
                    setSettings(updated);
                  }}
                />
              </div>

              <div>
                <Label>Lifetime Maximum Units (Optional)</Label>
                <Input
                  type="number"
                  value={setting.lifetime_max_units || ''}
                  onChange={(e) => {
                    const updated = settings.map((s) =>
                      s.id === setting.id ? { ...s, lifetime_max_units: parseInt(e.target.value) || undefined } : s
                    );
                    setSettings(updated);
                  }}
                  placeholder="Leave empty for no limit"
                />
              </div>

              <div>
                <Label>Limit Type</Label>
                <Select
                  value={setting.limit_type}
                  onValueChange={(value: LimitType) => {
                    const updated = settings.map((s) =>
                      s.id === setting.id ? { ...s, limit_type: value } : s
                    );
                    setSettings(updated);
                  }}
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

              <div>
                <Label>User Role</Label>
                <Select
                  value={setting.user_role}
                  onValueChange={(value: UserRole) => {
                    const updated = settings.map((s) =>
                      s.id === setting.id ? { ...s, user_role: value } : s
                    );
                    setSettings(updated);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="paid_user">Paid User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => handleSave(setting)}>Save</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};