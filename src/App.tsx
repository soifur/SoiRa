import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";
import { useToast } from "./components/ui/use-toast";
import { AppRoutes } from "./components/layout/AppRoutes";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Immediately check the current session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('Session error:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        return;
      }

      if (!session?.user) {
        setIsAuthenticated(false);
        setUserRole(null);
        return;
      }

      // Get user profile
      supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()
        .then(({ data: profile, error: profileError }) => {
          if (!mounted) return;
          
          if (profileError) {
            console.error('Profile error:', profileError);
            setIsAuthenticated(false);
            setUserRole(null);
            return;
          }

          setIsAuthenticated(true);
          setUserRole(profile?.role || null);
        });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.email);

      if (!session?.user) {
        setIsAuthenticated(false);
        setUserRole(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('Profile error:', profileError);
        setIsAuthenticated(false);
        setUserRole(null);
        toast({
          title: "Authentication Error",
          description: "Please try logging in again.",
          variant: "destructive",
        });
        return;
      }

      setIsAuthenticated(true);
      setUserRole(profile?.role || null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

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