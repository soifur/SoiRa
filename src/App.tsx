import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";
import { useToast } from "./components/ui/use-toast";
import { LoadingScreen } from "./components/layout/LoadingScreen";
import { AppRoutes } from "./components/layout/AppRoutes";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    console.log("App: Initializing authentication...");

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("App: Session error:", sessionError);
          throw sessionError;
        }

        if (!mounted) return;
        
        if (session?.user) {
          console.log("App: User session found");
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error("App: Profile fetch error:", profileError);
            throw profileError;
          }

          if (mounted) {
            console.log("App: Setting authenticated state with role:", profile?.role);
            setUserRole(profile?.role || null);
            setIsAuthenticated(true);
            setIsLoading(false);
          }
        } else {
          console.log("App: No active session");
          if (mounted) {
            setUserRole(null);
            setIsAuthenticated(false);
            setIsLoading(false);
          }
        }
      } catch (error: any) {
        console.error('App: Error in auth initialization:', error);
        if (mounted) {
          toast({
            title: "Authentication Error",
            description: "There was a problem with authentication. Please try logging in again.",
            variant: "destructive",
          });
          setIsAuthenticated(false);
          setUserRole(null);
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("App: Auth state changed:", event);
      
      if (!mounted) return;
      
      if (session?.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) throw profileError;

          if (mounted) {
            console.log("App: Updated auth state - authenticated with role:", profile?.role);
            setIsAuthenticated(true);
            setUserRole(profile?.role || null);
            setIsLoading(false);
          }
        } catch (error) {
          console.error("App: Error fetching profile:", error);
          toast({
            title: "Profile Error",
            description: "There was a problem loading your profile. Please try refreshing the page.",
            variant: "destructive",
          });
        }
      } else {
        if (mounted) {
          console.log("App: Updated auth state - not authenticated");
          setIsAuthenticated(false);
          setUserRole(null);
          setIsLoading(false);
        }
      }
    });

    initializeAuth();

    return () => {
      console.log("App: Cleaning up auth listeners");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>SoiRa AI</title>
        <link rel="icon" type="image/png" href="/lovable-uploads/5dd98599-640e-42ab-b5f9-51965516a74d.png" />
        <meta name="description" content="SoiRa AI - Your AI Assistant" />
      </Helmet>
      <Router>
        <AppRoutes isAuthenticated={isAuthenticated} userRole={userRole} />
        <Toaster />
      </Router>
    </div>
  );
}

export default App;