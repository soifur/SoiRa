import { Button } from "@/components/ui/button";
import { Bot, Archive, Folder, Users, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/types/user";

interface NavigationButtonsProps {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isMobile: boolean;
}

export const NavigationButtons = ({ isSuperAdmin, isAdmin, isMobile }: NavigationButtonsProps) => {
  const navigate = useNavigate();

  if (isMobile) return null;

  return (
    <div className="flex items-center gap-2">
      {(isSuperAdmin || isAdmin) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/bots')}
          className="h-8 w-8 hover:bg-dropdown-hover"
        >
          <Bot className="h-4 w-4" />
        </Button>
      )}
      {isSuperAdmin && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/folders')}
            className="h-8 w-8 hover:bg-dropdown-hover"
          >
            <Folder className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/subscriptions')}
            className="h-8 w-8 hover:bg-dropdown-hover"
          >
            <CreditCard className="h-4 w-4" />
          </Button>
        </>
      )}
      {(isSuperAdmin || isAdmin) && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/users')}
            className="h-8 w-8 hover:bg-dropdown-hover"
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/archive')}
            className="h-8 w-8 hover:bg-dropdown-hover"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};