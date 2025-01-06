import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Settings, LogOut, CreditCard } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ProfileMenuItemsProps {
  onUpgrade: () => void;
  onLogout: () => void;
}

export const ProfileMenuItems = ({ onUpgrade, onLogout }: ProfileMenuItemsProps) => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <>
      <DropdownMenuItem 
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="flex items-center gap-2 px-3 py-2.5"
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </DropdownMenuItem>
      <DropdownMenuItem 
        onClick={() => navigate('/settings')}
        className="flex items-center gap-2 px-3 py-2.5"
      >
        <Settings className="h-4 w-4" />
        Settings
      </DropdownMenuItem>
      <DropdownMenuSeparator className="my-1" />
      <DropdownMenuItem 
        onClick={onUpgrade}
        className="flex items-center gap-2 px-3 py-2.5"
      >
        <CreditCard className="h-4 w-4" />
        Upgrade Plan
      </DropdownMenuItem>
      <DropdownMenuSeparator className="my-1" />
      <DropdownMenuItem 
        onClick={onLogout}
        className="flex items-center gap-2 px-3 py-2.5"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </DropdownMenuItem>
    </>
  );
};