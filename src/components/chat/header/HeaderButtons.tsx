import { Button } from "@/components/ui/button";
import { Bot, Archive, Folder, Users, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

interface HeaderButtonsProps {
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

export const HeaderButtons = ({ isSuperAdmin, isAdmin }: HeaderButtonsProps) => {
  return (
    <div className="flex items-center gap-6">
      {(isSuperAdmin || isAdmin) && (
        <Link to="/bots">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Bot className="h-5 w-5" />
          </Button>
        </Link>
      )}
      
      {isSuperAdmin && (
        <Link to="/folders">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Folder className="h-5 w-5" />
          </Button>
        </Link>
      )}

      {isSuperAdmin && (
        <Link to="/subscriptions">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <CreditCard className="h-5 w-5" />
          </Button>
        </Link>
      )}

      {(isSuperAdmin || isAdmin) && (
        <Link to="/users">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Users className="h-5 w-5" />
          </Button>
        </Link>
      )}

      {(isSuperAdmin || isAdmin) && (
        <Link to="/archive">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Archive className="h-5 w-5" />
          </Button>
        </Link>
      )}
    </div>
  );
};