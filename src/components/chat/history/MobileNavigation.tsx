import { Button } from "@/components/ui/button";
import { Bot, Archive, Folder, Users, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/types/user";

interface MobileNavigationProps {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  onClose: () => void;
}

export const MobileNavigation = ({ isSuperAdmin, isAdmin, onClose }: MobileNavigationProps) => {
  const navigate = useNavigate();

  // If user is not admin or super admin, don't render anything to avoid the gap
  if (!isSuperAdmin && !isAdmin) {
    return null;
  }

  return (
    <div className="p-2 border-b border-border">
      <div className="space-y-1">
        {(isSuperAdmin || isAdmin) && (
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-accent text-sm"
            onClick={() => {
              navigate('/bots');
              onClose();
            }}
          >
            <Bot className="mr-2 h-4 w-4" />
            My Bots
          </Button>
        )}
        {isSuperAdmin && (
          <>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-accent text-sm"
              onClick={() => {
                navigate('/folders');
                onClose();
              }}
            >
              <Folder className="mr-2 h-4 w-4" />
              Folders
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-accent text-sm"
              onClick={() => {
                navigate('/subscriptions');
                onClose();
              }}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Subscriptions
            </Button>
          </>
        )}
        {(isSuperAdmin || isAdmin) && (
          <>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-accent text-sm"
              onClick={() => {
                navigate('/users');
                onClose();
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-accent text-sm"
              onClick={() => {
                navigate('/archive');
                onClose();
              }}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
          </>
        )}
      </div>
    </div>
  );
};