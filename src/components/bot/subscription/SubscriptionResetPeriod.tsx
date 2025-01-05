import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResetPeriod } from "@/types/subscription";

interface SubscriptionResetPeriodProps {
  period: ResetPeriod;
  amount: number;
  onPeriodChange: (period: ResetPeriod) => void;
  onAmountChange: (amount: number) => void;
}

export const SubscriptionResetPeriod = ({
  period,
  amount,
  onPeriodChange,
  onAmountChange,
}: SubscriptionResetPeriodProps) => {
  return (
    <div className="space-y-2">
      <Label>Reset Period</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(parseInt(e.target.value))}
          min={1}
          className="w-24"
        />
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="never">Never</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};