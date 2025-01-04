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

    async function checkSession() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (!session?.user) {
          if (mounted) {
            setIsAuthenticated(false);
            setUserRole(null);
            setIsLoading(false);
          }
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profileError) throw profileError;

        if (mounted) {
          setIsAuthenticated(true);
          setUserRole(profile?.role || null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth error:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setUserRole(null);
          setIsLoading(false);
          toast({
            title: "Authentication Error",
            description: "Please try logging in again.",
            variant: "destructive",
          });
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        if (!session?.user) {
          setIsAuthenticated(false);
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profileError) throw profileError;

        setIsAuthenticated(true);
        setUserRole(profile?.role || null);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth state change error:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        setIsLoading(false);
        toast({
          title: "Authentication Error",
          description: "Please try logging in again.",
          variant: "destructive",
        });
      }
    });

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

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