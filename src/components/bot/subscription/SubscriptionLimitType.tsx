import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LimitType } from "@/types/subscription";

interface SubscriptionLimitTypeProps {
  value: LimitType;
  onChange: (value: LimitType) => void;
}

export const SubscriptionLimitType = ({ value, onChange }: SubscriptionLimitTypeProps) => {
  return (
    <div className="space-y-2">
      <Label>Limit Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tokens">Tokens</SelectItem>
          <SelectItem value="messages">Messages</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};