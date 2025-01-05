import { ModelSubscriptionSetting } from "@/types/subscription";
import { SubscriptionLimitType } from "./SubscriptionLimitType";
import { SubscriptionResetPeriod } from "./SubscriptionResetPeriod";
import { SubscriptionLimitAmount } from "./SubscriptionLimitAmount";

interface RoleSubscriptionSettingsProps {
  settings: ModelSubscriptionSetting;
  onSettingsChange: (settings: ModelSubscriptionSetting) => void;
  userRole: string;
}

export const RoleSubscriptionSettings = ({
  settings,
  onSettingsChange,
  userRole,
}: RoleSubscriptionSettingsProps) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-medium capitalize">{userRole.replace('_', ' ')} Settings</h3>
      <div className="grid gap-4">
        <SubscriptionLimitType
          value={settings.limit_type || 'tokens'}
          onChange={(limit_type) => onSettingsChange({ ...settings, limit_type })}
        />
        <SubscriptionResetPeriod
          period={settings.reset_period}
          amount={settings.reset_amount || 1}
          onPeriodChange={(reset_period) => onSettingsChange({ ...settings, reset_period })}
          onAmountChange={(reset_amount) => onSettingsChange({ ...settings, reset_amount })}
        />
        <SubscriptionLimitAmount
          value={settings.units_per_period}
          onChange={(units_per_period) => onSettingsChange({ ...settings, units_per_period })}
        />
      </div>
    </div>
  );
};