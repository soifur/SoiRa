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
    const initializeAuth = async () => {
      try {
        // Check initial auth state
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        if (session?.user) {
          await checkUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        await checkUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      setUserRole(profile?.role || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <Helmet>
        <title>SoiRa AI</title>
        <link rel="icon" type="image/png" href="/lovable-uploads/5dd98599-640e-42ab-b5f9-51965516a74d.png" />
        <meta name="description" content="SoiRa AI - Your AI Assistant" />
      </Helmet>
      <Router>
        {isAuthenticated && <Navigation />}
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                isAdmin ? (
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
    </ThemeProvider>
  );
}

export default App;