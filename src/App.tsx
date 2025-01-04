import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Bots from "@/pages/Bots";
import Categories from "@/pages/Categories";
import SharedCategory from "@/pages/SharedCategory";
import Settings from "@/pages/Settings";
import Archive from "@/pages/Archive";
import Chat from "@/pages/Chat";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/bots" element={<Bots />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:shortKey" element={<SharedCategory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;