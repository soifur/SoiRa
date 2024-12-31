import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "super_admin" | "admin" | "user";

interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
}

export const useAuth = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          setLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          
          const basicProfile = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'user' as UserRole
          };
          setProfile(basicProfile);
          
          toast({
            title: "Profile Access Issue",
            description: "There was an issue accessing your profile. Some features may be limited.",
            variant: "destructive"
          });
        } else if (!profileData) {
          const basicProfile = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'user' as UserRole
          };
          setProfile(basicProfile);
          
          toast({
            title: "Profile Not Found",
            description: "Your profile is being created. Please refresh the page.",
            variant: "destructive"
          });
        } else {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error in auth flow:", error);
        toast({
          title: "Authentication Error",
          description: "There was an issue with authentication. Please try logging in again.",
          variant: "destructive"
        });
        await handleSignOut();
      } finally {
        setLoading(false);
      }
    };

    getProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await getProfile();
      } else {
        setProfile(null);
        // Only navigate if we're not already on the login page and not in an iframe
        if (location.pathname !== '/login' && window.top === window.self) {
          try {
            navigate('/login', { replace: true });
          } catch (error) {
            console.error("Navigation error:", error);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, location.pathname]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      // Only navigate if we're not already on the login page and not in an iframe
      if (location.pathname !== '/login' && window.top === window.self) {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { profile, loading, signOut: handleSignOut };
};