import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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
  const { toast } = useToast();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        // First try to get the profile
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          // If there's an error, check if it's the recursion error
          if (error.message.includes("infinite recursion")) {
            // Create a basic profile from session data
            const basicProfile = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'user' as UserRole
            };
            setProfile(basicProfile);
            
            toast({
              title: "Profile Access Issue",
              description: "There was an issue accessing your full profile. Some features may be limited.",
              variant: "destructive"
            });
          } else {
            throw error;
          }
        } else {
          setProfile(profile);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile. Please try refreshing the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    getProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        getProfile();
      } else {
        setProfile(null);
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { profile, loading, signOut };
};