import { Button } from "./ui/button";
import { Bot, Archive } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ProfileMenu } from "./ProfileMenu";

export const Navigation = () => {
  const location = useLocation();
  const isEmbedded = location.pathname.startsWith('/embed/');

  if (isEmbedded) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <div className="flex gap-6 md:gap-10">
          <Link to="/bots">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-foreground/80"
            >
              <Bot className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/archive">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-foreground/80"
            >
              <Archive className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ProfileMenu />
        </div>
      </div>
    </nav>
  );
};