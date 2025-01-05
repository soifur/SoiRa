import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SubscriptionLimitTypeProps {
  value: string;
  onChange: (value: string) => void;
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
          <SelectItem value="messages">Messages</SelectItem>
          <SelectItem value="tokens">Tokens</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};