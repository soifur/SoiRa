import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { PrivateRoute } from "@/components/PrivateRoute";
import { PublicRoute } from "@/components/PublicRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Bots from "@/pages/Bots";
import Chat from "@/pages/Chat";
import Categories from "@/pages/Categories";
import Archive from "@/pages/Archive";
import Settings from "@/pages/Settings";
import EmbeddedBotChat from "@/components/chat/EmbeddedBotChat";
import EmbeddedCategoryView from "./components/categories/embedded/EmbeddedCategoryView";

const App = () => {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Navigation />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Bots /></PrivateRoute>} />
          <Route path="/bots" element={<PrivateRoute><Bots /></PrivateRoute>} />
          <Route path="/chat/:botId" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
          <Route path="/archive" element={<PrivateRoute><Archive /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/embed/:botId" element={<EmbeddedBotChat />} />
          <Route path="/embed/category/:categoryId" element={<EmbeddedCategoryView />} />
        </Routes>
        <Toaster />
      </ThemeProvider>
    </Router>
  );
};

export default App;
