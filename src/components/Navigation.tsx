import { Button } from "./ui/button";
import { MoonIcon, SunIcon, LogOutIcon, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const Navigation = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEmbedded = location.pathname.startsWith('/embed/');

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          <Link to="/archive" className="text-sm font-medium transition-colors hover:text-primary">
            Archive
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-muted-foreground hover:text-primary"
          >
            <Link to="/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-primary"
          >
            <LogOutIcon className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};