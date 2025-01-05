import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "@/pages/Index";
import Bots from "@/pages/Bots";
import Chat from "@/pages/Chat";
import Archive from "@/pages/Archive";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Users from "@/pages/Users";
import Folders from "@/pages/Folders";
import EmbeddedBotChat from "@/components/chat/EmbeddedBotChat";
import { Helmet } from "react-helmet";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { UserRole } from "./types/user";

// Create a client
const queryClient = new QueryClient();

const ProtectedRoute = ({ 
  children, 
  allowedRoles = ['super_admin', 'admin', 'paid_user', 'user'],
}: { 
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (!profile || !allowedRoles.includes(profile.role as UserRole)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show nothing while checking auth state
  if (isAuthenticated === null) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <Helmet>
          <title>SoiRa AI</title>
          <link rel="icon" type="image/png" href="/lovable-uploads/5dd98599-640e-42ab-b5f9-51965516a74d.png" />
          <meta name="description" content="SoiRa AI - Your AI Assistant" />
        </Helmet>
        <Router>
          <Routes>
            <Route
              path="/"
              element={isAuthenticated ? <Index /> : <Navigate to="/login" />}
            />
            <Route
              path="/bots"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin', 'paid_user']}>
                  <Bots />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={isAuthenticated ? <Chat /> : <Navigate to="/login" />}
            />
            <Route
              path="/archive"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                  <Archive />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={isAuthenticated ? <Settings /> : <Navigate to="/login" />}
            />
            <Route
              path="/folders"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <Folders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route path="/embed/:botId" element={<EmbeddedBotChat />} />
            <Route
              path="/login"
              element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
            />
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;