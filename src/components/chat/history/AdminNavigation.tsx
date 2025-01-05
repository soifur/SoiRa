import { useQuery } from "@tanstack/react-query";
import { Bot, Folder, Users, Archive, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const AdminNavigation = () => {
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

  const isSuperAdmin = userProfile?.role === 'super_admin';
  const isAdmin = userProfile?.role === 'admin';

  if (!isSuperAdmin && !isAdmin) return null;

  return (
    <div className="p-4 border-b border-border">
      <div className="space-y-2">
        {(isSuperAdmin || isAdmin) && (
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-accent"
            onClick={() => navigate('/bots')}
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
              onClick={() => navigate('/folders')}
            >
              <Folder className="mr-2 h-4 w-4" />
              Folders
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-accent"
              onClick={() => navigate('/subscriptions')}
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
              onClick={() => navigate('/users')}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-accent"
              onClick={() => navigate('/archive')}
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