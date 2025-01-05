import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bot, Archive, Folder, Users, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";

interface MobileNavigationProps {
  onClose: () => void;
}

export const MobileNavigation = ({ onClose }: MobileNavigationProps) => {
  const navigate = useNavigate();

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

  const role = userProfile?.role as UserRole;
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin';
  const isPaidUser = role === 'paid_user';

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isSuperAdmin && !isAdmin && !isPaidUser) return null;

  return (
    <div className="p-4 border-b border-border">
      <div className="space-y-2">
        {(isSuperAdmin || isAdmin || isPaidUser) && (
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-accent"
            onClick={() => handleNavigation('/bots')}
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
              onClick={() => handleNavigation('/folders')}
            >
              <Folder className="mr-2 h-4 w-4" />
              Folders
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-accent"
              onClick={() => handleNavigation('/subscriptions')}
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
              onClick={() => handleNavigation('/users')}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-accent"
              onClick={() => handleNavigation('/archive')}
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