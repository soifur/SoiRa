import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
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

type LimitType = 'tokens' | 'messages';
type ResetPeriod = 'daily' | 'weekly' | 'monthly' | 'never';

interface ModelSubscriptionSetting {
  id: string;
  model: string;
  units_per_period: number;
  reset_period: ResetPeriod;
  lifetime_max_units?: number;
  limit_type: LimitType;
  created_at?: string;
  updated_at?: string;
}

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

      // Ensure the data matches our expected types
      const typedSettings: ModelSubscriptionSetting[] = (data || []).map(item => ({
        ...item,
        limit_type: (item.limit_type as LimitType) || 'tokens',
        reset_period: item.reset_period as ResetPeriod,
      }));

      setSettings(typedSettings);
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
      if (!setting.model.trim()) {
        toast({
          title: "Error",
          description: "Model name is required",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('model_subscription_settings')
        .upsert({
          id: setting.id,
          model: setting.model,
          units_per_period: setting.units_per_period,
          reset_period: setting.reset_period,
          lifetime_max_units: setting.lifetime_max_units,
          limit_type: setting.limit_type,
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
      
      await fetchSettings(); // Refresh the settings after save
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
      limit_type: 'tokens',
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
                  value={setting.model}
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
                    <SelectItem value="tokens">By Token Count</SelectItem>
                    <SelectItem value="messages">By Message Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{setting.limit_type === 'tokens' ? 'Tokens' : 'Messages'} per Period</Label>
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
                <Label>Lifetime Maximum {setting.limit_type === 'tokens' ? 'Tokens' : 'Messages'} (Optional)</Label>
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

              <Button onClick={() => handleSave(setting)}>Save</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};