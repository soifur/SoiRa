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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          
          // Create a basic profile with user role
          const basicProfile = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'user' as UserRole
          };
          setProfile(basicProfile);
          
          // Show a more helpful error message
          toast({
            title: "Profile Setup in Progress",
            description: "Your profile is being set up. Please refresh in a few seconds.",
            duration: 5000,
          });
        } else {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Auth error:", error);
        toast({
          title: "Authentication Error",
          description: "Please try logging out and back in.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        await getProfile();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        if (!location.pathname.startsWith('/embed/')) {
          navigate('/login');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, location.pathname]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      if (!location.pathname.startsWith('/embed/')) {
        navigate('/login');
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { profile, loading, signOut };
};