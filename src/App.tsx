import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "@/pages/Index";
import Bots from "@/pages/Bots";
import Chat from "@/pages/Chat";
import Archive from "@/pages/Archive";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import EmbeddedBotChat from "@/components/chat/EmbeddedBotChat";
import EmbeddedCategoryChat from "@/components/chat/embedded/EmbeddedCategoryChat";
import { Helmet } from "react-helmet";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log("User authenticated:", session.user.id);
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (!mounted) return;
          
          if (error) {
            console.error('Error fetching user role:', error);
            setUserRole(null);
            setIsAuthenticated(false);
          } else {
            console.log("User role:", profile?.role);
            setUserRole(profile?.role || null);
            setIsAuthenticated(true);
          }
        } else {
          console.log("No active session");
          if (mounted) {
            setUserRole(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", event);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (mounted) {
          setIsAuthenticated(true);
          setUserRole(profile?.role || null);
          setIsLoading(false);
        }
      } else {
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
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <Helmet>
        <title>SoiRa AI</title>
        <link rel="icon" type="image/png" href="/lovable-uploads/5dd98599-640e-42ab-b5f9-51965516a74d.png" />
        <meta name="description" content="SoiRa AI - Your AI Assistant" />
      </Helmet>
      {isLoading || isAuthenticated === null ? (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-lg text-foreground">Loading...</div>
        </div>
      ) : (
        <Router>
          {isAuthenticated && <Navigation />}
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  userRole === 'admin' || userRole === 'super_admin' ? (
                    <Index />
                  ) : (
                    <Navigate to="/chat" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/bots"
              element={isAuthenticated ? <Bots /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/chat"
              element={isAuthenticated ? <Chat /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/archive"
              element={isAuthenticated ? <Archive /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/settings"
              element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace />}
            />
            <Route path="/embed/:botId" element={<EmbeddedBotChat />} />
            <Route path="/category/:categoryId" element={<EmbeddedCategoryChat />} />
            <Route
              path="/login"
              element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
            />
          </Routes>
          <Toaster />
        </Router>
      )}
    </ThemeProvider>
  );
}

export default App;