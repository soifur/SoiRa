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

    const initializeAuth = async () => {
      try {
        console.log("App: Checking session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("App: Session error:", sessionError);
          if (mounted) {
            setIsLoading(false);
            setIsAuthenticated(false);
            setUserRole(null);
          }
          return;
        }

        if (!mounted) return;
        
        if (session?.user) {
          console.log("App: Session found, user:", session.user.email);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error("App: Profile error:", profileError);
            if (mounted) {
              setIsLoading(false);
              setIsAuthenticated(false);
              setUserRole(null);
            }
            return;
          }

          if (mounted) {
            console.log("App: Setting authenticated state with role:", profile?.role);
            setUserRole(profile?.role || null);
            setIsAuthenticated(true);
            setIsLoading(false);
          }
        } else {
          console.log("App: No session found, setting unauthenticated state");
          if (mounted) {
            setIsAuthenticated(false);
            setUserRole(null);
            setIsLoading(false);
          }
        }
      } catch (error) {
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
      console.log("App: Auth state changed:", event, session?.user?.email);
      if (!mounted) return;
      
      if (session?.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error("App: Profile error in auth change:", profileError);
            if (mounted) {
              setIsLoading(false);
              setIsAuthenticated(false);
              setUserRole(null);
            }
            return;
          }

          if (mounted) {
            console.log("App: Updating state after auth change:", profile?.role);
            setIsAuthenticated(true);
            setUserRole(profile?.role || null);
            setIsLoading(false);
          }
        } catch (error) {
          console.error("App: Error in auth change:", error);
          if (mounted) {
            toast({
              title: "Profile Error",
              description: "There was a problem loading your profile. Please try refreshing the page.",
              variant: "destructive",
            });
            setIsAuthenticated(false);
            setUserRole(null);
            setIsLoading(false);
          }
        }
      } else {
        console.log("App: No session in auth change, setting unauthenticated");
        if (mounted) {
          setIsAuthenticated(false);
          setUserRole(null);
          setIsLoading(false);
        }
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  console.log('App: Current state:', { isLoading, isAuthenticated, userRole });

  if (isLoading) {
    return <LoadingScreen />;
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