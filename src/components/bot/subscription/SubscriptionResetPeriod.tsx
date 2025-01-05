import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SubscriptionResetPeriodProps {
  period: string;
  amount: number;
  onPeriodChange: (value: string) => void;
  onAmountChange: (value: number) => void;
}

export const SubscriptionResetPeriod = ({ 
  period, 
  amount, 
  onPeriodChange, 
  onAmountChange 
}: SubscriptionResetPeriodProps) => {
  return (
    <div className="space-y-2">
      <Label>Reset Period</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(parseInt(e.target.value))}
          className="w-24"
          min={1}
        />
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};