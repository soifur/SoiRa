import { Navigate, Route, Routes } from "react-router-dom";
import Index from "@/pages/Index";
import Bots from "@/pages/Bots";
import Chat from "@/pages/Chat";
import Archive from "@/pages/Archive";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import EmbeddedBotChat from "@/components/chat/EmbeddedBotChat";
import EmbeddedCategoryChat from "@/components/chat/embedded/EmbeddedCategoryChat";
import { AuthenticatedLayout } from "./AuthenticatedLayout";

interface AppRoutesProps {
  isAuthenticated: boolean;
  userRole: string | null;
}

export const AppRoutes = ({ isAuthenticated, userRole }: AppRoutesProps) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            userRole === 'admin' || userRole === 'super_admin' ? (
              <AuthenticatedLayout>
                <Index />
              </AuthenticatedLayout>
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
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <Bots />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/chat"
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <Chat />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/archive"
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <Archive />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            <AuthenticatedLayout>
              <Settings />
            </AuthenticatedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/embed/:botId" element={<EmbeddedBotChat />} />
      <Route path="/category/:categoryId" element={<EmbeddedCategoryChat />} />
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
};