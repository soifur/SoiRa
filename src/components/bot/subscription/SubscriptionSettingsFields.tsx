import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubscriptionSettings } from "@/types/subscriptionSettings";

interface SubscriptionSettingsFieldsProps {
  settings: SubscriptionSettings;
  onSettingChange: (updates: Partial<SubscriptionSettings>) => void;
  disabled?: boolean;
}

export const SubscriptionSettingsFields = ({ 
  settings, 
  onSettingChange, 
  disabled 
}: SubscriptionSettingsFieldsProps) => {
  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label>Limit Type</Label>
        <Select
          value={settings.limit_type}
          onValueChange={(value) => onSettingChange({ limit_type: value as 'tokens' | 'messages' })}
          disabled={disabled}
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
          value={settings.units_per_period}
          onChange={(e) => onSettingChange({ 
            units_per_period: parseInt(e.target.value) 
          })}
          disabled={disabled}
          className="dark:bg-[#1e1e1e] dark:border-gray-700"
        />
      </div>

      <div className="space-y-2">
        <Label>Reset Period</Label>
        <Select
          value={settings.reset_period}
          onValueChange={(value) => onSettingChange({ reset_period: value as ResetPeriod })}
          disabled={disabled}
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
          value={settings.lifetime_max_units || ''}
          onChange={(e) => onSettingChange({ 
            lifetime_max_units: e.target.value ? parseInt(e.target.value) : undefined 
          })}
          placeholder="No limit"
          disabled={disabled}
          className="dark:bg-[#1e1e1e] dark:border-gray-700"
        />
      </div>
    </div>
  );
};