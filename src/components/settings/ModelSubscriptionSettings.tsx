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

interface ModelSubscriptionSetting {
  id: string;
  model: string;
  tokens_per_period: number;
  reset_period: 'daily' | 'weekly' | 'monthly' | 'never';
  lifetime_max_tokens?: number;
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
      setSettings(data || []);
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
          model: setting.model,
          tokens_per_period: setting.tokens_per_period,
          reset_period: setting.reset_period,
          lifetime_max_tokens: setting.lifetime_max_tokens,
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
      tokens_per_period: 1000,
      reset_period: 'monthly',
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
                <Label>Tokens per Period</Label>
                <Input
                  type="number"
                  value={setting.tokens_per_period}
                  onChange={(e) => {
                    const updated = settings.map((s) =>
                      s.id === setting.id ? { ...s, tokens_per_period: parseInt(e.target.value) } : s
                    );
                    setSettings(updated);
                  }}
                />
              </div>

              <div>
                <Label>Reset Period</Label>
                <Select
                  value={setting.reset_period}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'never') => {
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
                <Label>Lifetime Maximum Tokens (Optional)</Label>
                <Input
                  type="number"
                  value={setting.lifetime_max_tokens || ''}
                  onChange={(e) => {
                    const updated = settings.map((s) =>
                      s.id === setting.id ? { ...s, lifetime_max_tokens: parseInt(e.target.value) || undefined } : s
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