import { Button } from "@/components/ui/button";
import { Bot, Archive, Folder, Users, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  onClose: () => void;
  className?: string;
}

export const MobileNavigation = ({ isSuperAdmin, isAdmin, onClose, className }: MobileNavigationProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("p-4 border-b border-border", className)}>
      <div className="space-y-2">
        {(isSuperAdmin || isAdmin) && (
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-accent"
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
              className="w-full justify-start hover:bg-accent"
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
              className="w-full justify-start hover:bg-accent"
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
              className="w-full justify-start hover:bg-accent"
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
              className="w-full justify-start hover:bg-accent"
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