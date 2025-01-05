import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SubscriptionLimitAmountProps {
  value: number;
  onChange: (value: number) => void;
}

export const SubscriptionLimitAmount = ({ value, onChange }: SubscriptionLimitAmountProps) => {
  return (
    <div className="space-y-2">
      <Label>Limit Amount</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        min={0}
      />
    </div>
  );
};