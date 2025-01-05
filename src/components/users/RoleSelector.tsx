import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/types/user";

interface RoleSelectorProps {
  currentRole: UserRole;
  isDisabled: boolean;
  onChange: (role: UserRole) => void;
}

export function RoleSelector({ currentRole, isDisabled, onChange }: RoleSelectorProps) {
  return (
    <Select
      defaultValue={currentRole}
      onValueChange={(value) => onChange(value as UserRole)}
      disabled={isDisabled}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="super_admin">Super Admin</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="paid_user">Paid User</SelectItem>
        <SelectItem value="user">User</SelectItem>
      </SelectContent>
    </Select>
  );
}