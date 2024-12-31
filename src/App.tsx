import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { ThemeProvider } from "next-themes";
import Index from "@/pages/Index";
import Bots from "@/pages/Bots";
import Chat from "@/pages/Chat";
import Archive from "@/pages/Archive";
import Login from "@/pages/Login";
import EmbeddedBotChat from "@/components/chat/EmbeddedBotChat";
import { useAuth } from "@/hooks/useAuth";

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: "super_admin" | "admin" }) => {
  const { profile, loading } = useAuth();
  const isEmbedded = location.pathname.startsWith('/embed/');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile && !isEmbedded) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && profile) {
    const hasAccess = requiredRole === "super_admin" 
      ? profile.role === "super_admin"
      : profile.role === "super_admin" || profile.role === "admin";

    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <Router>
        <Navigation />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route 
            path="/bots" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Bots />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/archive" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Archive />
              </ProtectedRoute>
            } 
          />
          <Route path="/embed/:botId" element={<EmbeddedBotChat />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;