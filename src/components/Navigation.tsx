import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Link, useLocation } from "react-router-dom";

export const Navigation = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isEmbedded = new URLSearchParams(location.search).get('bot') !== null;

  // Don't show navigation in embedded mode
  if (isEmbedded) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <div className="flex gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold">SoiRa</span>
          </Link>
          <Link to="/bots" className="text-sm font-medium transition-colors hover:text-primary">
            Bots
          </Link>
          <Link to="/chat" className="text-sm font-medium transition-colors hover:text-primary">
            Chat
          </Link>
          <Link to="/archive" className="text-sm font-medium transition-colors hover:text-primary">
            Archive
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};