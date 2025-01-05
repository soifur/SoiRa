import { Button } from "./ui/button";
import { Bot, Archive, Folder } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ProfileMenu } from "./ProfileMenu";

export const Navigation = () => {
  const location = useLocation();
  const isEmbedded = location.pathname.startsWith('/embed/');

  if (isEmbedded) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex gap-6 md:gap-10">
          <Link to="/bots">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Bot className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/folders">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Folder className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/archive">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
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