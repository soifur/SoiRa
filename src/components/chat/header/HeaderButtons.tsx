import { Bot, Archive, Folder, Users, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HeaderButtonsProps {
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

export const HeaderButtons = ({ isSuperAdmin, isAdmin }: HeaderButtonsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-6">
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