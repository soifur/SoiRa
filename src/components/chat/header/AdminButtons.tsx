import { Button } from "@/components/ui/button";
import { Bot, Archive, Folder, Users, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/types/user";

interface AdminButtonsProps {
  role?: UserRole;
}

export const AdminButtons = ({ role }: AdminButtonsProps) => {
  const navigate = useNavigate();
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin';

  if (!isSuperAdmin && !isAdmin) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/bots')}
        className="h-8 w-8 hover:bg-dropdown-hover"
      >
        <Bot className="h-4 w-4" />
      </Button>
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
    </>
  );
};