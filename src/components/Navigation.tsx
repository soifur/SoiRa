import { Button } from "./ui/button";
import { Bot, Archive, Folder, Users, CreditCard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ProfileMenu } from "./ProfileMenu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";

export const Navigation = () => {
  const location = useLocation();
  const isEmbedded = location.pathname.startsWith('/embed/');

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isEmbedded) return null;

  const role = userProfile?.role as UserRole;
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex gap-8 md:gap-12">
          {/* Only super_admin and admin can access Bots page */}
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
          
          {/* Only super_admin can access Folders */}
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

          {/* Only super_admin can access Subscriptions */}
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

          {/* Only super_admin and admin can access Users */}
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

          {/* Only super_admin and admin can access Archive */}
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
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ProfileMenu />
        </div>
      </div>
    </nav>
  );
};